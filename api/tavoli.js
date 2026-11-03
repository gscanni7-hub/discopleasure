// Richieste tavoli: riceve il modulo della pagina /tavoli e invia due email con Resend.
// 1) al team dei tavoli, con tutti i dati (rispondendo si scrive direttamente al cliente);
// 2) al cliente, come conferma di ricezione.
//
// Variabili d'ambiente da impostare su Vercel (Project → Settings → Environment Variables):
//   RESEND_API_KEY  la chiave di Resend (re_...)
//   TAVOLI_TO       chi riceve le richieste, es. eugeniocoppola7@gmail.com (più indirizzi separati da virgola)
//   TAVOLI_FROM     il mittente, es. Disco Pleasure <tavoli@discopleasure.com> (dominio verificato su Resend).
//                   Senza dominio verificato: Disco Pleasure <onboarding@resend.dev> (arriva solo all'email dell'account Resend)

const MAX = { nome: 60, cognome: 60, email: 120, prefisso: 6, telefono: 20, note: 1000, data: 10 };

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clean = (s, n) => String(s ?? "").replace(/[\r\n\t]+/g, " ").trim().slice(0, n);

const GIORNI = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
const MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
const dataLunga = (id) => {
  const [y, m, d] = id.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return `${GIORNI[dt.getUTCDay()]} ${d} ${MESI[m - 1]} ${y}`;
};

async function send(key, mail) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(mail),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
  return r.json();
}

const riga = (k, v) => `<tr><td style="padding:10px 0;border-bottom:1px solid #ddd;font:10px/16px monospace;text-transform:uppercase;color:#555;width:120px">${k}</td><td style="padding:10px 0;border-bottom:1px solid #ddd;font:15px/22px Helvetica,Arial,sans-serif;color:#212121">${v}</td></tr>`;
const layout = (titolo, corpo) => `<!doctype html><html><body style="margin:0;background:#f4f3ef;padding:32px 16px">
<table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:4px"><tr><td style="padding:32px">
<p style="margin:0 0 24px;font:700 18px/1 Helvetica,Arial,sans-serif;letter-spacing:-.5px;color:#212121">DISCO PLEASURE</p>
<h1 style="margin:0 0 16px;font:700 24px/1.1 Helvetica,Arial,sans-serif;text-transform:uppercase;color:#212121">${titolo}</h1>
${corpo}
<p style="margin:32px 0 0;font:10px/16px monospace;text-transform:uppercase;color:#888">Chalet Valentino · Valle delle Gravare · Roccaraso (AQ)</p>
</td></tr></table></body></html>`;

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ ok: false }); }
  const key = process.env.RESEND_API_KEY, to = process.env.TAVOLI_TO, from = process.env.TAVOLI_FROM;
  if (!key || !to || !from) return res.status(500).json({ ok: false, error: "config" });

  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};

  // anti-spam: il campo nascosto deve restare vuoto
  if (b._honey) return res.status(200).json({ ok: true });

  const d = {
    nome: clean(b.nome, MAX.nome), cognome: clean(b.cognome, MAX.cognome), email: clean(b.email, MAX.email).toLowerCase(),
    prefisso: clean(b.prefisso, MAX.prefisso), telefono: clean(b.telefono, MAX.telefono).replace(/[^\d ]/g, ""),
    persone: parseInt(b.persone, 10), data: clean(b.data, MAX.data), note: String(b.note ?? "").trim().slice(0, MAX.note),
    novita: !!b.novita, privacy: !!b.privacy,
  };
  const errori = [];
  if (!d.nome) errori.push("nome");
  if (!d.cognome) errori.push("cognome");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) errori.push("email");
  if (!/^\+\d{1,4}$/.test(d.prefisso) || d.telefono.replace(/\D/g, "").length < 6) errori.push("telefono");
  if (!(d.persone >= 1 && d.persone <= 15)) errori.push("persone");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.data)) errori.push("data");
  if (!d.privacy) errori.push("privacy");
  if (errori.length) return res.status(400).json({ ok: false, error: "dati", campi: errori });

  const quando = dataLunga(d.data), tel = `${d.prefisso} ${d.telefono}`, nomeCompleto = `${d.nome} ${d.cognome}`;
  const wa = `https://wa.me/${(d.prefisso + d.telefono).replace(/\D/g, "")}`;

  try {
    // 1) al team: rispondendo all'email si scrive al cliente
    await send(key, {
      from, to: to.split(",").map((x) => x.trim()).filter(Boolean), reply_to: d.email,
      subject: `Richiesta tavolo · ${quando} · ${nomeCompleto} · ${d.persone} pers.`,
      html: layout("Nuova richiesta tavolo", `<table role="presentation" width="100%" style="border-collapse:collapse;border-top:1px solid #ddd">
        ${riga("Data", esc(quando))}${riga("Persone", d.persone)}${riga("Nome", esc(nomeCompleto))}
        ${riga("Email", `<a href="mailto:${esc(d.email)}" style="color:#212121">${esc(d.email)}</a>`)}
        ${riga("Telefono", `${esc(tel)} · <a href="${wa}" style="color:#212121">apri WhatsApp</a>`)}
        ${riga("Note", esc(d.note || "-").replace(/\n/g, "<br>"))}${riga("Novità", d.novita ? "Sì, vuole ricevere le novità" : "No")}</table>
        <p style="margin:24px 0 0;font:14px/20px Helvetica,Arial,sans-serif;color:#555">Rispondi a questa email per scrivere direttamente a ${esc(d.nome)}, oppure contattalo su WhatsApp.</p>`),
      text: `Nuova richiesta tavolo\nData: ${quando}\nPersone: ${d.persone}\nNome: ${nomeCompleto}\nEmail: ${d.email}\nTelefono: ${tel} (${wa})\nNote: ${d.note || "-"}\nNovità: ${d.novita ? "sì" : "no"}`,
    });

    // 2) al cliente: conferma di ricezione (se fallisce, la richiesta è comunque arrivata al team).
    //    Finché il dominio non è verificato su Resend si usa il mittente di prova onboarding@resend.dev,
    //    che può scrivere solo al proprietario dell'account: in quel caso la conferma al cliente si salta.
    if (!/resend\.dev/i.test(from)) try {
      await send(key, {
        from, to: [d.email], reply_to: to.split(",")[0].trim(),
        subject: `Abbiamo ricevuto la tua richiesta · ${quando}`,
        html: layout(`Grazie, ${esc(d.nome)}.`, `<p style="margin:0 0 20px;font:16px/24px Helvetica,Arial,sans-serif;color:#212121">Abbiamo ricevuto la tua richiesta di tavolo. Il nostro team la verificherà e ti contatterà in privato, via WhatsApp o email, con la conferma e tutte le istruzioni.</p>
          <table role="presentation" width="100%" style="border-collapse:collapse;border-top:1px solid #ddd">${riga("Data", esc(quando))}${riga("Persone", d.persone)}${riga("Telefono", esc(tel))}</table>
          <p style="margin:20px 0 0;font:13px/19px Helvetica,Arial,sans-serif;color:#777">La richiesta non è ancora una prenotazione: il tavolo è confermato solo con il nostro messaggio. Se i tuoi piani cambiano, rispondi a questa email.</p>`),
        text: `Grazie, ${d.nome}.\nAbbiamo ricevuto la tua richiesta di tavolo per ${quando}, ${d.persone} persone.\nIl nostro team la verificherà e ti contatterà in privato, via WhatsApp o email, con la conferma e tutte le istruzioni.\nLa richiesta non è ancora una prenotazione: il tavolo è confermato solo con il nostro messaggio.\n\nDisco Pleasure · Chalet Valentino · Valle delle Gravare · Roccaraso (AQ)`,
      });
    } catch (e) { console.error("conferma cliente non inviata", e.message); }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e.message);
    return res.status(502).json({ ok: false, error: "invio" });
  }
};
