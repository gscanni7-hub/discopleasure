/* =========================================================
   CONTENUTI DI DISCO PLEASURE: modifica qui.
   Per usare una foto vera: img: "/img/nomefile.jpg".
   ========================================================= */

/* ---------- Biglietti e tavoli ---------- */
const CONTATTI = {
  // Numero WhatsApp per i tavoli: prefisso internazionale senza "+" e senza spazi (es. 393331234567)
  whatsapp: "393403692824",
  // Link Eventbrite generale (se una data non ha il suo link, si usa questo)
  eventbrite: "https://www.eventbrite.it/",
  email: "tavoli@discopleasure.it",
  // Profili social (sostituisci con i link veri)
  instagram: "#",
  tiktok: "#",
};
const waLink = (testo) => `https://wa.me/${CONTATTI.whatsapp}?text=${encodeURIComponent(testo)}`;

/* ---------- Stagione 2026/27 ---------- */
// Ogni riga: [anno, mese, giorno]. I giorni della settimana si calcolano da soli.
const SEASON_DATES = [
  // Il ponte dell'Immacolata
  [2026, 12, 5], [2026, 12, 6], [2026, 12, 7], [2026, 12, 8],
  // Le feste: tutti i giorni dal 26 dicembre al 10 gennaio
  ...Array.from({ length: 16 }, (_, i) => { const d = new Date(2026, 11, 26 + i); return [d.getFullYear(), d.getMonth() + 1, d.getDate()]; }),
  // I weekend
  [2027, 1, 16], [2027, 1, 17], [2027, 1, 23], [2027, 1, 24], [2027, 1, 30], [2027, 1, 31],
  [2027, 2, 6], [2027, 2, 7], [2027, 2, 13], [2027, 2, 14], [2027, 2, 20], [2027, 2, 21], [2027, 2, 27], [2027, 2, 28],
  [2027, 3, 6], [2027, 3, 7], [2027, 3, 13], [2027, 3, 14],
];

// Titoli speciali per alcune date (le altre si chiamano "Disco Pleasure")
const SPECIAL_TITLES = {
  "2026-12-05": "Apriamo il 5",
  "2026-12-08": "Immacolata",
  "2026-12-26": "Santo Stefano",
  "2026-12-31": "San Silvestro",
  "2027-01-01": "Capodanno",
  "2027-01-06": "Epifania",
  "2027-03-14": "Ultima data",
};

// Foto per le card (a rotazione)
const EVENT_IMGS = ["/img/opening.jpg", "/img/ven-5.jpg", "/img/sab-6.jpg", "/img/dom-7.jpg", "/img/lun-8.jpg", "/img/ponte.jpg", "/img/feste.jpg", "/img/epifania.jpg", "/img/calendario.jpg"];

const GIORNI = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
const GIORNI_BREVI = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const MESI_BREVI = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
const MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];

const pad2 = (n) => String(n).padStart(2, "0");
// Indirizzo della pagina di una data, es. /eventi/2026/5-dicembre
const evUrl = (id) => { const [y, m, dd] = id.split("-"); return `/eventi/${y}/${+dd}-${MESI[+m - 1]}`; };
const EVENTS = SEASON_DATES.map(([y, m, d], i) => {
  const date = new Date(y, m - 1, d);
  const id = `${y}-${pad2(m)}-${pad2(d)}`;
  const phase = m === 12 && d <= 8 ? "Il ponte" : (y === 2026 || (m === 1 && d <= 10)) ? "Le feste" : "Weekend";
  return {
    id,
    url: evUrl(id),
    date,
    month: m,
    phase,
    title: SPECIAL_TITLES[id] || "Disco Pleasure",
    weekday: GIORNI[date.getDay()],
    short: `${GIORNI_BREVI[date.getDay()]} ${d}.${m}`,
    long: `${GIORNI[date.getDay()]} ${d} ${MESI[m - 1]} ${y}`,
    card: `${GIORNI_BREVI[date.getDay()]}, ${d} ${MESI_BREVI[m - 1]} ${y}`,
    tag: SPECIAL_TITLES[id] || null,
    hours: "12:00 - 19:00",
    img: EVENT_IMGS[i % EVENT_IMGS.length],
    // Line-up per area: sostituisci con i nomi. Per un b2b scrivi "Nome A b2b Nome B".
    lineup: [
      { area: "Sotto l'arco", names: ["Resident", "Guest da annunciare"] },
      { area: "Dal tramonto", names: ["Resident b2b Resident"] },
    ],
    // Link Eventbrite: si imposta nella lista TICKETS più sotto
    tickets: null,
    // Righe in fondo alla card (prezzi, orari d'ingresso...)
    entry: ["Info ingresso in arrivo", "Tavoli su prenotazione"],
  };
});
// Link Eventbrite per singola data: "2026-12-05": "https://www.eventbrite.it/e/...",
const TICKETS = {
  "2026-12-05": "https://www.eventbrite.com/e/2002311265897?aff=oddtdtcreator",
  "2026-12-06": "https://www.eventbrite.com/e/2002311501602?aff=oddtdtcreator",
  "2026-12-07": "https://www.eventbrite.com/e/2002311677127?aff=oddtdtcreator",
  "2026-12-08": "https://www.eventbrite.com/e/2002311718250?aff=oddtdtcreator",
  "2026-12-26": "https://www.eventbrite.com/e/2002311834598?aff=oddtdtcreator",
  "2026-12-27": "https://www.eventbrite.com/e/2002312021156?aff=oddtdtcreator",
  "2026-12-28": "https://www.eventbrite.com/e/2002312466488?aff=oddtdtcreator",
  "2026-12-29": "https://www.eventbrite.com/e/2002312601893?aff=oddtdtcreator",
  "2026-12-30": "https://www.eventbrite.com/e/2002312963976?aff=oddtdtcreator",
  "2026-12-31": "https://www.eventbrite.com/e/2002313322047?aff=oddtdtcreator",
  "2027-01-01": "https://www.eventbrite.com/e/2002313419338?aff=oddtdtcreator",
  "2027-01-02": "https://www.eventbrite.com/e/2002314429359?aff=oddtdtcreator",
  "2027-01-03": "https://www.eventbrite.com/e/2002314570782?aff=oddtdtcreator",
  "2027-01-04": "https://www.eventbrite.com/e/2002314708193?aff=oddtdtcreator",
  "2027-01-05": "https://www.eventbrite.com/e/2002314802475?aff=oddtdtcreator",
  "2027-01-06": "https://www.eventbrite.com/e/2002315039183?aff=oddtdtcreator",
  "2027-01-07": "https://www.eventbrite.com/e/2002315247807?aff=oddtdtcreator",
  "2027-01-08": "https://www.eventbrite.com/e/2002315182612?aff=oddtdtcreator",
  "2027-01-09": "https://www.eventbrite.com/e/2002315406281?aff=oddtdtcreator",
  "2027-01-10": "https://www.eventbrite.it/e/disco-pleasure-apres-ski-1001-chalet-valentino-tickets-2002316123426?aff=oddtdtcreator",
};
EVENTS.forEach((e) => { e.tickets = TICKETS[e.id] || CONTATTI.eventbrite; });
// Locandine: una per data, in /img/locandine/AAAA-MM-GG.jpg (4:5, 1280x1600).
// Per aggiungerne una basta mettere il file e la data in questa lista.
const POSTERS = ["2026-12-05", "2026-12-06", "2026-12-07", "2026-12-08"];
EVENTS.forEach((e) => { if (POSTERS.includes(e.id)) e.poster = `/img/locandine/${e.id}.jpg`; });
const eventById = (id) => EVENTS.find((e) => e.id === id) || EVENTS[0];
const eventByPath = (path) => EVENTS.find((e) => e.url === decodeURI(path).replace(/\/$/, ""));
const tableMsg = (e) => `Ciao! Vorrei prenotare un tavolo a Disco Pleasure per ${e.long.toLowerCase()}.`;

/* ---------- Artisti (segnaposto) ---------- */
const ARTISTS = [
  { name: "Resident 01", day: "Sabato", img: "/img/recap-piazzale.jpg" },
  { name: "Resident 02", day: "Domenica", img: "/img/recap-flash.jpg" },
  { name: "Resident 03", day: "Il ponte", img: "/img/stage-led.jpg" },
  { name: "Resident 04", day: "Le feste", img: "/img/feste.jpg" },
  { name: "Guest 01", day: "Sabato", img: "/img/opening.jpg" },
  { name: "Guest 02", day: "Domenica", img: "/img/recap-orablu.jpg" },
  { name: "Guest 03", day: "Capodanno", img: "/img/recap-brindisi.jpg" },
  { name: "Guest 04", day: "Epifania", img: "/img/recap-terrazza.jpg" },
  { name: "Guest 05", day: "Sabato", img: "/img/recap-alto.jpg" },
  { name: "Guest 06", day: "Domenica", img: "/img/palla.jpg" },
  { name: "Guest 07", day: "Le feste", img: "/img/interno.jpg" },
  { name: "Guest 08", day: "Weekend", img: "/img/palla-travi.jpg" },
];

/* ---------- Aggiornamenti ----------
   Ogni articolo: apertura (lead + intro), poi sezioni con titolo gigante,
   foto grande, etichetta, testo e due foto affiancate.
*/
const NEWS = [
  {
    id: "apriamo-il-5", tag: "Aggiornamento", date: "15 novembre 2026", title: "Si riparte il 5 dicembre", img: "/img/manifesto.jpg",
    lead: "Sabato 5 dicembre la piattaforma dello Chalet Valentino torna a suonare. Quattro giorni di ponte, un palco nuovo e la regola di sempre: si balla finché c'è luce, e anche un po' dopo.",
    intro: [
      "Chi c'era l'anno scorso lo sa: l'après-ski alle Gravare non è una pausa tra una discesa e l'altra, è il motivo per cui si sale. Quest'anno si parte con il ponte dell'Immacolata, dal 5 all'8 dicembre, dalle 12 alle 19.",
      "Tre cose da sapere prima di caricare gli sci in macchina.",
    ],
    sections: [
      { h: "Quattro giorni di fila", img: "/img/ven-5.jpg", label: "5 · 6 · 7 · 8 dicembre",
        text: ["Sabato si apre, domenica e lunedì si tiene il ritmo, martedì 8 si chiude il ponte con la giornata dell'Immacolata. Quattro date, quattro line-up diverse.",
               "I nomi escono giorno per giorno nel calendario. Se hai già scelto la data, tieni d'occhio quella pagina: le novità arrivano lì prima che altrove."],
        pair: ["/img/opening.jpg", "/img/sab-6.jpg"] },
      { h: "Il palco è cambiato", img: "/img/stage.jpg", label: "Sotto l'arco",
        text: ["Il gazebo è andato in pensione. Al suo posto c'è un arco di truss di sei metri, due torri audio e una corona di luci calde che si accende quando il sole scende dietro la cresta.",
               "La consolle sta sotto l'arco, la pista davanti, le montagne alle spalle. Niente tavoli in mezzo: la piattaforma è fatta per ballare."],
        pair: ["/img/stage-led.jpg", "/img/dom-7.jpg"] },
      { h: "Biglietti e timbro", img: "/img/timbro.jpg", label: "Come si entra",
        text: ["I biglietti sono su Eventbrite, un evento per ogni data: il link è nella pagina del giorno. Per il tavolo basta un messaggio su WhatsApp.",
               "All'ingresso ti timbriamo la mano con il sigillo. Serve per uscire e rientrare, e il giorno dopo è ancora lì: il souvenir più economico della stagione."],
        pair: ["/img/tshirt.jpg", "/img/manifesto-27.jpg"] },
    ],
  },
  {
    id: "tavoli", tag: "Aggiornamento", date: "20 novembre 2026", title: "Tavoli: come funzionano", img: "/img/bancone.jpg",
    lead: "La piattaforma nasce per ballare, quindi i tavoli sono pochi e stanno ai bordi. Nei giorni caldi finiscono presto: ecco come muoversi.",
    intro: [
      "Un tavolo serve a una cosa sola: avere un punto fermo. Un posto dove lasciare giacche e caschi, dove ritrovarsi quando il gruppo scende dalle piste a orari diversi, dove tornare tra un set e l'altro.",
    ],
    sections: [
      { h: "Quando conviene", img: "/img/recap-terrazza.jpg", label: "Weekend e feste",
        text: ["Sabati, ponte dell'Immacolata, Capodanno ed Epifania: sono i giorni in cui la piattaforma si riempie già nel primo pomeriggio. Se siete in tanti, prenotare è la differenza tra stare comodi e girare con lo zaino in spalla.",
               "Nei giorni feriali di gennaio c'è più margine, ma un messaggio prima di salire non costa niente."],
        pair: ["/img/recap-brindisi.jpg", "/img/recap-piazzale.jpg"] },
      { h: "Come si prenota", img: "/img/interno.jpg", label: "Su WhatsApp",
        text: ["Si prenota su WhatsApp. Dal bottone Tavoli di ogni data il messaggio parte già scritto con il giorno giusto: aggiungi quante persone siete e un nome di riferimento.",
               "Ti rispondiamo con la disponibilità. Se quella data è piena, ti proponiamo la più vicina."],
        pair: ["/img/bancone.jpg", "/img/palla-travi.jpg"] },
      { h: "Il giorno stesso", img: "/img/calendario.jpg", label: "All'arrivo",
        text: ["All'ingresso dai il nome della prenotazione e ti accompagniamo al tavolo. Se i piani cambiano, avvisaci: liberiamo il posto per qualcun altro.",
               "Un consiglio da habitué: il tavolo è la base, ma la festa è in pista. Non restare seduto troppo a lungo."],
        pair: ["/img/opening.jpg", "/img/lun-8.jpg"] },
    ],
  },
  {
    id: "meteo-weekend", tag: "Tips", date: "Ogni venerdì", title: "Il meteo, prima di salire", img: "/img/montagne-giorno.jpg",
    lead: "A 1.500 metri il tempo cambia in un'ora. In home trovi il meteo delle Gravare aggiornato ora per ora: guardalo prima di partire.",
    intro: [
      "Il sole di mezzogiorno inganna. Sulla piattaforma si sta in maglione finché la luce batte sulla neve, poi il sole sparisce dietro la cresta e la temperatura crolla. Sapere cosa aspettarsi cambia la giornata.",
    ],
    sections: [
      { h: "Dove guardarlo", img: "/img/montagne-tramonto.jpg", label: "In home e nella pagina della data",
        text: ["Nella sezione Meteo della home ci sono tre schede: le prossime ventiquattro ore, i sette giorni e i dettagli, da alba e tramonto fino a vento e zero termico.",
               "Nella pagina di ogni data compaiono anche le previsioni di quel giorno, a partire da sedici giorni prima."],
        pair: ["/img/recap-alto.jpg", "/img/pista-notte.jpg"] },
      { h: "L'ora da segnare", img: "/img/lun-8.jpg", label: "Tramonto",
        text: ["A dicembre il sole lascia la piattaforma intorno alle 16:40. È il momento in cui si accendono le luci dell'arco e il pomeriggio diventa un'altra cosa.",
               "Nelle giornate limpide vale la pena esserci un po' prima: l'ora blu sulla neve non si racconta, si vede."],
        pair: ["/img/recap-orablu.jpg", "/img/chalet-piazzale.jpg"] },
      { h: "Se il tempo gira", img: "/img/pista-notte.jpg", label: "Cambi di programma",
        text: ["Se vento o neve ci costringono a cambiare orari, lo scriviamo qui nelle News e sui social la mattina stessa.",
               "Le previsioni orarie sono le più affidabili: controllale prima di partire, non la sera prima."],
        pair: ["/img/montagne-giorno.jpg", "/img/recap-piazzale.jpg"] },
    ],
  },
  {
    id: "cosa-portare", tag: "Tips", date: "Stagione 2026/27", title: "Cosa portare a -6°", img: "/img/guanti.jpg",
    lead: "Si balla all'aperto dalle 12 alle 19. A mezzogiorno si sta bene, dopo il tramonto no. La differenza la fa quello che hai addosso.",
    intro: [
      "Niente guardaroba al caldo, niente pista al coperto: Disco Pleasure è un après-ski vero, sulla neve. Qualche regola da chi ci passa la stagione.",
    ],
    sections: [
      { h: "A strati", img: "/img/recap-flash.jpg", label: "La regola base",
        text: ["Tre strati leggeri battono un piumino pesante: intimo tecnico, uno strato caldo, una giacca che fermi il vento. Al sole ne togli uno, al tramonto lo rimetti.",
               "Il cotone sulla pelle è il nemico: si bagna ballando e ti gela appena ti fermi."],
        pair: ["/img/recap-piazzale.jpg", "/img/recap-terrazza.jpg"] },
      { h: "Mani, testa, occhi", img: "/img/guanti.jpg", label: "I dettagli",
        text: ["Dopo le 16 guanti e cappello non sono un'opzione. Gli occhiali da sole servono fino all'ultimo raggio: la neve riflette più di quanto sembri.",
               "Un paio di guanti sottili in tasca è il trucco per usare il telefono senza perdere le dita."],
        pair: ["/img/recap-brindisi.jpg", "/img/recap-orablu.jpg"] },
      { h: "Ai piedi", img: "/img/dom-7.jpg", label: "Scarponi o scarpe",
        text: ["Se arrivi dalla pista resta pure con gli scarponi, sei in ottima compagnia. Se sali a piedi scegli una suola che tenga sulla neve battuta: al tramonto il fondo ghiaccia.",
               "Calze di lana o tecniche. I piedi freddi sono il primo motivo per cui la gente va via presto."],
        pair: ["/img/recap-alto.jpg", "/img/ven-5.jpg"] },
    ],
  },
  {
    id: "dal-26", tag: "Aggiornamento", date: "1 dicembre 2026", title: "Sedici giorni di fila", img: "/img/pista-notte.jpg",
    lead: "Dal 26 dicembre al 10 gennaio non ci fermiamo: Disco Pleasure è aperto ogni giorno, dalle 12 alle 19. Poi tutti i weekend, fino al 14 marzo.",
    intro: [
      "Le vacanze di Natale sono il periodo in cui Roccaraso si riempie di più. Noi ci siamo tutti i giorni, con line-up che cambiano da un pomeriggio all'altro.",
    ],
    sections: [
      { h: "Le feste", img: "/img/feste.jpg", label: "26 dicembre - 10 gennaio",
        text: ["Si parte a Santo Stefano e si va avanti fino a domenica 10 gennaio. Sedici pomeriggi, stessi orari, sempre all'aperto.",
               "Nel calendario trovi ogni data con il suo evento su Eventbrite e il bottone per il tavolo."],
        pair: ["/img/recap-piazzale.jpg", "/img/opening.jpg"] },
      { h: "Le date da cerchiare", img: "/img/recap-brindisi.jpg", label: "31 dicembre, 1 e 6 gennaio",
        text: ["San Silvestro, Capodanno ed Epifania sono le giornate più attese. Programmi e line-up escono qui e sui social appena sono chiusi.",
               "Sono anche le prime a esaurire i tavoli: se venite in gruppo, muovetevi con anticipo."],
        pair: ["/img/recap-orablu.jpg", "/img/palla.jpg"] },
      { h: "Poi i weekend", img: "/img/epifania.jpg", label: "Fino al 14 marzo",
        text: ["Dopo il 10 gennaio ci vediamo il sabato e la domenica, da metà gennaio a tutto febbraio, fino al 13 e 14 marzo.",
               "Ogni weekend ha il suo programma: lo trovi nel calendario, filtrato per mese."],
        pair: ["/img/sab-6.jpg", "/img/calendario.jpg"] },
    ],
  },
];
const newsById = (id) => NEWS.find((n) => n.id === id) || NEWS[0];

/* ---------- Home ---------- */
const HOME = {
  special: [
    { date: "Sab 5.12 · dalle 12", title: "Apriamo il 5", img: "/img/opening.jpg", href: evUrl("2026-12-05") },
    { date: "5 · 6 · 7 · 8 dicembre", title: "Il ponte dell'Immacolata", img: "/img/ponte.jpg", href: evUrl("2026-12-06") },
    { date: "Dal 26.12 al 10.01", title: "Tutti i giorni", img: "/img/feste.jpg", href: "/apres-ski?m=12" },
    { date: "Fino al 14.03", title: "Ogni weekend", img: "/img/epifania.jpg", href: "/apres-ski?m=1" },
  ],
  residencies: [
    { day: "Sabato 5.12", title: "Apriamo sotto l'arco", img: "/img/ven-5.jpg", href: evUrl("2026-12-05") },
    { day: "Domenica 6.12", title: "Heat, dal tramonto", img: "/img/sab-6.jpg", href: evUrl("2026-12-06") },
    { day: "Lunedì 7.12", title: "Neve di giorno, pista al tramonto", img: "/img/dom-7.jpg", href: evUrl("2026-12-07") },
    { day: "Martedì 8.12", title: "L'ora blu, alle 19", img: "/img/lun-8.jpg", href: evUrl("2026-12-08") },
  ],
  residents: [
    // "Coming soon" finché non escono i nomi: sostituisci name e img con DJ e foto
    { day: "Sabato 5.12", name: "Coming soon", img: "/img/coming-soon/cs-1.jpg" },
    { day: "Domenica 6.12", name: "Coming soon", img: "/img/coming-soon/cs-2.jpg" },
    { day: "Lunedì 7.12", name: "Coming soon", img: "/img/coming-soon/cs-3.jpg" },
    { day: "Martedì 8.12", name: "Coming soon", img: "/img/coming-soon/cs-4.jpg" },
    { day: "Sabato 26.12", name: "Coming soon", img: "/img/coming-soon/cs-5.jpg" },
    { day: "Giovedì 31.12", name: "Coming soon", img: "/img/coming-soon/cs-6.jpg" },
  ],
};

/* ---------- Menu: prossime date ---------- */
const MENU_RAIL = [
  { day: "Sab 5.12", title: "Apriamo il 5", img: "/img/opening.jpg", href: evUrl("2026-12-05") },
  { day: "Dom 6.12", title: "Il ponte", img: "/img/sab-6.jpg", href: evUrl("2026-12-06") },
  { day: "Lun 7.12", title: "Il ponte", img: "/img/dom-7.jpg", href: evUrl("2026-12-07") },
  { day: "Mar 8.12", title: "Immacolata", img: "/img/lun-8.jpg", href: evUrl("2026-12-08") },
  { day: "Sab 26.12", title: "Santo Stefano", img: "/img/feste.jpg", href: evUrl("2026-12-26") },
  { day: "Gio 31.12", title: "San Silvestro", img: "/img/recap-brindisi.jpg", href: evUrl("2026-12-31") },
  { day: "Ven 1.1", title: "Capodanno", img: "/img/recap-orablu.jpg", href: evUrl("2027-01-01") },
];

/* ---------- Meteo (Open-Meteo, gratuito, senza chiave) ---------- */
// Punto delle previsioni: Roccaraso, zona Gravare. Sposta lat/lon sul punto esatto dello chalet se serve.
const METEO = { lat: 41.835, lon: 14.055, place: "Roccaraso · Gravare" };
