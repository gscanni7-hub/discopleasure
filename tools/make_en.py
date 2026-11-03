#!/usr/bin/env python3
"""Genera le pagine inglesi in /en/ a partire da quelle italiane.

Uso:  python3 tools/make_en.py
Va rilanciato ogni volta che si modifica una pagina italiana: le pagine in /en/ vengono riscritte.
I testi che cambiano con i dati (date, artisti, news, meteo, menu, footer) sono in data-en.js e nei T() dei file .js.
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EN_DIR = os.path.join(ROOT, "en")
SITE = "https://discopleasure.com"
TAG_IT = "La notte sale in quota"
TAG_EN = "Where the night goes higher"
GMAPS = "https://www.google.com/maps/search/?api=1&amp;query=Chalet+Valentino+Viale+delle+Gravare+Roccaraso"


SLUG_EN = {"apres-ski": "dates", "tavoli": "tables", "artisti": "artists", "chi-siamo": "about", "come-arrivare": "getting-here", "eventi": "events"}
NEWS_SLUG_EN = {"apriamo-il-5": "the-return", "tavoli": "tables-guide", "meteo-weekend": "weather", "cosa-portare": "what-to-wear", "dal-26": "sixteen-days"}
MESE_IT = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"]
MESE_EN = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
# file delle pagine inglesi (nome tradotto = indirizzo tradotto, con cleanUrls di Vercel)
FILE_EN = {"apres-ski.html": "dates.html", "tavoli.html": "tables.html", "artisti.html": "artists.html", "artista.html": "artist.html",
           "evento.html": "event.html", "articolo.html": "article.html", "chi-siamo.html": "about.html", "come-arrivare.html": "getting-here.html"}


def to_en(path):
    """/tavoli?d=1 → /en/tables?d=1 ; /eventi/2026/31-dicembre → /en/events/2026/31-december"""
    m = re.match(r"^([^?#]*)(.*)$", path)
    p, rest = m.group(1), m.group(2)
    if p == "/en" or p.startswith("/en/"):
        p = p[3:] or "/"
    parts = p.split("/")
    if len(parts) > 3 and parts[1] == "eventi":
        parts[3] = re.sub(r"[a-z]+$", lambda x: MESE_EN[MESE_IT.index(x.group(0))] if x.group(0) in MESE_IT else x.group(0), parts[3])
    if len(parts) > 2 and parts[1] == "news":
        parts[2] = NEWS_SLUG_EN.get(parts[2], parts[2])
    if len(parts) > 1:
        parts[1] = SLUG_EN.get(parts[1], parts[1])
    out = "/".join(parts)
    return "/en" + ("" if out in ("", "/") else out) + rest


def slug_of(fname):
    base = fname[:-5]
    return "" if base == "index" else base


# ---------- blocchi riusati per Chi siamo / Come arrivare ----------
def row(img, label, h, ps, rev=False, pos=""):
    return f'''
<div class="u-art-block"><div class="u-art-row{' rev' if rev else ''}">
  <div class="u-art-img"><div class="art" data-img="{img}"></div></div>
  <div class="u-art-col">
    <div class="u-art-hgroup"><span class="u-mono u-art-label">{label}</span><h2 class="u-art-h2">{h}</h2></div>
    <div class="u-art-text">{''.join(f'<p>{p}</p>' for p in ps)}</div>
  </div>
</div></div>'''


def quote(t):
    return f'''
<div class="u-art-block"><div class="u-art-end"><div class="u-art-end-col wide">
  <h2 class="u-art-quote">{t}</h2>
  <div class="u-art-quote-foot"><i aria-hidden="true"></i></div>
</div></div></div>'''


def q(title, inner, open_=False, sub=False):
    return (f'<div class="u-faq-item{" u-faq-sub" if sub else ""}{" open" if open_ else ""}"><button class="u-faq-q" type="button" aria-expanded="{"true" if open_ else "false"}">'
            f'<span>{title}</span><span class="u-faq-ic" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3.5 6 8 10.5 12.5 6"/></svg></span></button><div class="u-faq-a">{inner}</div></div>')


def txt(ps):
    return '<div class="u-faq-text">' + ''.join(f'<p>{p}</p>' for p in ps) + '</div>'


CHI_EN = '''<main class="u-doc">
<div class="u-doc-head">
  <div class="u-doc-head-row"><h1 class="u-doc-title">About</h1><i class="u-doc-tick" aria-hidden="true"></i></div>
  <div class="u-doc-hero"><div class="art" data-img="/img/chi/palco-neon.jpg" style="background-position:center 42%"></div></div>
</div>
<div class="u-art-blocks">
''' + row('/img/chi/maschera.jpg', 'Disco Pleasure', 'The party, outdoors', [
    "Disco Pleasure is the après-ski of Chalet Valentino, at the foot of the Valle delle Gravare, in Roccaraso. An address passed on by word of mouth, a ritual that returns every winter, and a simple, almost stubborn idea: the party happens outside.",
    "No dark rooms, no cloakroom queues. You arrive with skis on, unclip your bindings and you are already in front of the speakers. The Apennines instead of walls, the January sky instead of a ceiling.",
    "The afternoon comes in two acts. The first is all bright light, mirrored goggles and toasts that were meant to be just one. The second begins around 4:40 pm, when the sun slips behind the ridge and the square changes its skin."], rev=True) + quote("“We dance while there is light, and a little after. The place is right: the rest is up to the people.”") + row('/img/chi/tramonto-folla.jpg', 'The square', 'Where the slope ends', [
    "Everything happens in front of the chalet, exactly where the Gravare slope ends. Whoever takes the last turn finds themselves in the crowd without noticing: the kind of entrance no club could ever design.",
    "The centre is kept free, made for dancing. Tables around it, the DJ booth in front, the mountains behind turning pink at sunset. Friends lost on the chairlift are found again, and everyone stays longer than planned."]) + row('/img/news/abruzzo-dall-alto.jpg', 'The place', 'Roccaraso, at 1,500 metres', [
    "We are in the Alto Sangro, in the heart of the Roccaraso ski area: slopes running down through beech woods, Aremogna just above, the Cinquemiglia plateau on the horizon.",
    "A landscape that needs no set design. Just snow, the low winter light and the right music at the right moment."], rev=True) + row('/img/chi/coppia.jpg', 'The style', 'The dress code is the mountain', [
    "There is no dress code here, or maybe there is: the mountain's own. Technical jackets open over knitwear, faux fur, beanies, goggles pushed up on the forehead, ski boots still clipped for those coming off the slopes.",
    "The result is a wardrobe no stylist could invent: bright colours on white snow, layers that come off in the sun and go back on at sunset, an elegance born from the cold rather than from posing."]) + quote("“The beauty of it up here is that nobody is in a hurry to leave.”") + row('/img/chi/neve-notte.jpg', 'After sunset', 'The blue hour', [
    "Shortly after sunset the sky turns electric blue, the snow throws back every reflection and the lights of the booth cut through the cold air. It is the moment nobody checks the time any more.",
    "We dance until 7 pm. Then everyone heads down to the valley with a story to tell, rosy cheeks and the urge to come back the following weekend."], rev=True) + '''
<div class="u-art-block"><div class="u-art-end"><div class="u-art-end-col">
  <h2 class="u-art-h2s">See you up there</h2>
  <div class="u-art-text"><p>From December 5 to March 14, noon to 7 pm. The dates are in the calendar, tables are requested through the form.</p></div>
  <div class="u-art-btns"><a class="u-art-btn" href="/en/apres-ski">Dates</a><a class="u-art-btn sec" href="/en/tavoli">Tables</a></div>
</div></div></div>
</div>
</main>'''

FAQ_EN = '''<main class="u-doc">
<div class="u-doc-head">
  <div class="u-doc-head-row"><h1 class="u-doc-title">Getting here</h1><i class="u-doc-tick" aria-hidden="true"></i></div>
</div>
<div class="u-art-block"><div class="u-art-end"><div class="u-faq" id="faq">
''' + q('How do I get to the chalet?',
        q('Address', txt([
            'Chalet Valentino, Viale delle Gravare snc, 67037 Roccaraso (AQ), Aremogna area, at 1,567 metres.',
            'GPS coordinates: 41.835, 14.055.',
            f'<a href="{GMAPS}" target="_blank" rel="noopener">Open directions in Google Maps</a>']), sub=True) +
        q('On skis', txt([
            "The most beautiful entrance, and the quickest. The chalet sits at the bottom of the Valle delle Gravare slope, served by the Gravare three-seater chairlift and linked to Pizzalto by the Pizzalto-Gravare gondola.",
            "At the end of the day just head down the valley: the last run drops you right in front of the square. Unclip your bindings, and you have arrived."]), sub=True) +
        q('By car', txt([
            "From Roccaraso drive up towards Aremogna along via Aremogna. Alternatively, from the SS17 at km 136 take the Barranea municipal road and continue for four to six kilometres.",
            "Leave the car at the Gravare car park or in the Aremogna car parks, then walk to the chalet. At weekends and over the holidays spaces fill up quickly: come up early."]), sub=True) +
        q('On foot', txt([
            "The chalet can also be reached on foot, on packed snow. You need shoes with a sole that grips, ideally snow boots: up here, style starts with your feet.",
            "At sunset the ground freezes. If you walk back down, take it slowly and keep your phone charged."]), sub=True), open_=True) + q("What's the weather like up there?",
    '<div class="u-faq-text"><p>The forecast for Chalet Valentino, at 1,567 metres, hour by hour and for the coming days. At this altitude the sky changes its mind quickly: check it before you leave, not the night before.</p></div><div class="w-card u-faq-meteo" id="meteoCard"></div>') + q('What time do you open?',
    q('Hours', txt(["From noon to 7 pm, from the first sun until dark. Around 4:40 pm the sun drops behind the ridge and the lights come on: the moment not to miss."]), sub=True) +
    q('Season', txt(['We open with the Immaculate Conception long weekend, December 5 to 8. Then every day from December 26 to January 10, and every weekend until the closing on March 14. All the dates are in the <a href="/en/apres-ski">calendar</a>.']), sub=True)) + q('How do I get back down?', txt([
        "We close at 7 pm, after dark. Plan your way back before you come up, especially if you are a group travelling in several cars.",
        "And if you have been drinking, leave the wheel to someone else. It is the most elegant rule of the evening: we want to see you again next weekend."])) + q('Any other questions?', txt([
        'Message us on WhatsApp: <a href="#" data-wa target="_blank" rel="noopener">we reply personally</a>. For tables there is a <a href="/en/tavoli">dedicated form</a>.'])) + '''
</div></div></div>
</main>'''

PRIVACY_EN = '''<main class="page">
<section class="page-hero legal-hero">
  <span class="badge badge-gray">Notice</span>
  <h1 class="page-title">Privacy policy</h1>
  <p class="page-sub">Under EU Regulation 2016/679 (GDPR)</p>
</section>
<article class="prose legal">
  <p><strong>This notice explains how Disco Pleasure handles the personal data of people who visit the website and of those who contact us to book a table or ask for information. The Italian version is the legally binding one.</strong></p>
  <h3>1. Data controller</h3>
  <p>The data controller is <mark class="todo">[to be completed]</mark> (company name), based in <mark class="todo">[to be completed]</mark>, VAT number <mark class="todo">[to be completed]</mark>. For any request about your data you can write to <mark class="todo">[to be completed]</mark> (email).</p>
  <h3>2. What data we collect</h3>
  <ul>
    <li><strong>Data you provide</strong>, when you fill in the Tables form (first name, last name, email, phone, number of guests, date and notes) or when you message us on WhatsApp to book or ask for information (name, phone number and whatever you choose to write).</li>
    <li><strong>Browsing data</strong>: like every website, the servers hosting it automatically record some technical data (IP address, browser type, pages visited, date and time). They are needed to run the website and keep it secure.</li>
  </ul>
  <p>We do not use profiling tools or advertising cookies.</p>
  <h3>3. Why we process it and on what basis</h3>
  <ul>
    <li><strong>To reply to you and manage your table request</strong>: legal basis, your request (art. 6.1.b GDPR).</li>
    <li><strong>To send you news about dates, tables and events</strong>, by email or messaging apps, only if you ticked the box in the form: legal basis, your consent (art. 6.1.a GDPR), which you can withdraw at any time.</li>
    <li><strong>To run and protect the website</strong>: legal basis, our legitimate interest (art. 6.1.f GDPR).</li>
  </ul>
  <h3>4. How long we keep it</h3>
  <p>Request and booking data are kept for as long as needed to manage them, and in any case no longer than the end of the season, unless the law requires otherwise. Technical browsing data are kept only as long as strictly necessary for the operation and security of the service.</p>
  <h3>5. Who can see the data</h3>
  <p>Data are never sold or transferred. They may be processed on our behalf, and only for the purposes above, by the providers who help us run the website:</p>
  <ul>
    <li><strong>Vercel Inc.</strong>: website hosting; receives the Tables form data to forward it by email.</li>
    <li><strong>Resend</strong> (resend.com): sends the Tables form emails, to our team and as a confirmation of receipt to the person making the request.</li>
    <li><strong>FormSubmit</strong> (formsubmit.co): as an alternative to Resend, delivers the Tables form requests to our team by email.</li>
  </ul>
  <p>Some providers are based outside the European Union. In these cases data are transferred with the safeguards required by the GDPR, such as the European Commission's standard contractual clauses.</p>
  <h3>6. Linked external services</h3>
  <ul>
    <li><strong>Google Fonts</strong>: to display the website's typefaces, your browser downloads them from Google's servers, which receive your IP address.</li>
    <li><strong>Open-Meteo and MET Norway</strong>: to show the Roccaraso weather, your browser queries Open-Meteo and, if it does not respond, MET Norway (the Norwegian Meteorological Institute). Both receive your IP address.</li>
    <li><strong>Eventbrite, WhatsApp and Google Maps</strong>: reached through links. When you open them you leave our website and their own privacy notices apply.</li>
  </ul>
  <h3>7. Your rights</h3>
  <p>At any time you can ask us to access, correct or delete your data, restrict its use, receive it in a readable format, object to its processing or withdraw your consent, by writing to <mark class="todo">[to be completed]</mark>. If you believe your data are not being handled correctly, you can lodge a complaint with the Italian <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener">Data Protection Authority (Garante)</a>.</p>
  <h3>8. Cookies</h3>
  <p>To find out which cookies the website uses, read the <a href="/en/cookie">Cookie policy</a>.</p>
  <h3>9. Changes</h3>
  <p>We may update this notice. The version in force is always the one published on this page, with the last update date below.</p>
  <p class="legal-date">Last updated: <mark class="todo">[to be completed]</mark></p>
</article>
</main>'''

COOKIE_EN = '''<main class="page">
<section class="page-hero legal-hero">
  <span class="badge badge-gray">Notice</span>
  <h1 class="page-title">Cookie policy</h1>
  <p class="page-sub">Which cookies the website uses and how to manage them</p>
</section>
<article class="prose legal">
  <p><strong>This page explains which cookies the Disco Pleasure website uses. In short: the website uses no profiling or advertising cookies, only two small technical items stored in your browser.</strong></p>
  <h3>What cookies are</h3>
  <p>Cookies are small files a website saves in your browser to remember some information between visits.</p>
  <h3>Which cookies we use</h3>
  <table class="legal-table">
    <thead><tr><th>Name</th><th>Type</th><th>Purpose</th><th>Duration</th></tr></thead>
    <tbody>
      <tr><td>dp_lang_hint</td><td>Technical (browser storage)</td><td>Remembers whether you chose a language or closed the invitation to switch, so it does not appear again.</td><td>Until you delete it</td></tr>
      <tr><td>dp_meteo</td><td>Technical (browser storage)</td><td>Keeps the latest weather forecast, so it can be shown even when the weather service does not respond.</td><td>Until you delete it</td></tr>
    </tbody>
  </table>
  <p>The website sets no cookies. The two technical items above stay in your browser, are never sent to us and, by law, do not require your consent.</p>
  <h3>Third-party cookies</h3>
  <p>We do not use analytics, advertising or profiling tools. The website loads its typefaces from <strong>Google Fonts</strong> and the weather from <strong>Open-Meteo</strong>: these services receive your IP address in order to deliver the content, as explained in the <a href="/en/privacy">Privacy policy</a>.</p>
  <p>If you open external links such as Eventbrite, WhatsApp or the maps, those services may use their own cookies according to their policies.</p>
  <h3>How to manage cookies</h3>
  <p>You can delete or block cookies from your browser settings (Safari, Chrome, Firefox, Arc and others). Blocking technical cookies does not prevent you from browsing the website.</p>
  <h3>Contact</h3>
  <p>For questions about this policy write to <mark class="todo">[to be completed]</mark>.</p>
  <p class="legal-date">Last updated: <mark class="todo">[to be completed]</mark></p>
</article>
</main>'''

OG_ALT = [("Disco Pleasure, la notte sale in quota. Chalet Valentino, Roccaraso.", "Disco Pleasure, where the night goes higher. Chalet Valentino, Roccaraso.")]
DESC_HOME_IT = "Disco Pleasure · Après-ski all&#x27;aperto allo Chalet Valentino, a valle delle Gravare, Roccaraso. 5-8 dicembre, tutti i giorni dal 26 dicembre al 10 gennaio, poi ogni weekend fino al 14 marzo. Dalle 12 alle 19."
DESC_HOME_EN = "Disco Pleasure · Outdoor après-ski at Chalet Valentino, Valle delle Gravare, Roccaraso. December 5-8, every day from December 26 to January 10, then every weekend until March 14. Noon to 7 pm."

PAGES = {
    "index.html": [
        (f"Disco Pleasure | {TAG_IT}", f"Disco Pleasure | {TAG_EN}"),
        (DESC_HOME_IT, DESC_HOME_EN),
        (DESC_HOME_IT.replace("&#x27;", "'"), DESC_HOME_EN),
        (f'aria-label="{TAG_IT}"', f'aria-label="{TAG_EN}"'),
        ('data-words="La|Notte|Sale|In quota">La<', 'data-words="The|Night|Goes|Higher">The<'),
        (f'<h1 class="sr-only">{TAG_IT}</h1>', f'<h1 class="sr-only">{TAG_EN}</h1>'),
        (">Prossime date<", ">Upcoming dates<"),
        ('href="/tavoli">Prenotazioni</a><h2 class="u-band-a">Riserva</h2>', 'href="/tavoli">VIP Tables</a><h2 class="u-band-a">Elevate</h2>'),
        ('<p class="u-band-b">il tuo spazio</p>', '<p class="u-band-b">Your experience</p>'),
        ('>Tavoli su richiesta, stagione 26-27<', '>Reach new heights with a VIP booking<'),
        ('>Richiedi un tavolo</a>', '>Book a VIP table</a>'),
        (">Tutte le date →<", ">All dates →<"),
    ],
    "apres-ski.html": [
        ("Tutte le date di Disco Pleasure allo Chalet Valentino, a valle delle Gravare (Roccaraso): 5-8 dicembre, dal 26 dicembre al 10 gennaio, poi ogni weekend fino al 14 marzo.",
         "All Disco Pleasure dates at Chalet Valentino, Valle delle Gravare (Roccaraso): December 5-8, from December 26 to January 10, then every weekend until March 14."),
        (">Stagione 26-27<", ">Season 26-27<"),
        (">Dal 5 dicembre al 14 marzo · 12:00 – 19:00<", ">December 5 to March 14 · 12:00 – 19:00<"),
        ('aria-label="Filtra per mese"', 'aria-label="Filter by month"'),
    ],
    "evento.html": [
        ("<title>Evento | Disco Pleasure</title>", "<title>Event | Disco Pleasure</title>"),
        ("Date e tickets | Disco Pleasure", "Dates and tickets | Disco Pleasure"),
        ("Disco Pleasure · Chalet Valentino, a valle delle Gravare · Roccaraso · après-ski all&#x27;aperto dalle 12 alle 19.", "Disco Pleasure · Chalet Valentino, Valle delle Gravare · Roccaraso · outdoor après-ski from noon to 7 pm."),
        ("Disco Pleasure · Chalet Valentino, a valle delle Gravare · Roccaraso · après-ski all'aperto dalle 12 alle 19.", "Disco Pleasure · Chalet Valentino, Valle delle Gravare · Roccaraso · outdoor après-ski from noon to 7 pm."),
        ('id="evTables" href="/tavoli">Tavoli<', 'id="evTables" href="/tavoli">Tables<'),
        ('<h2 class="giant">Date</h2>', '<h2 class="giant">Dates</h2>'),
    ],
    "tavoli.html": [
        ("<title>Tavoli | Disco Pleasure</title>", "<title>Tables | Disco Pleasure</title>"),
        ('content="Tavoli | Disco Pleasure"', 'content="Tables | Disco Pleasure"'),
        ("Prenota il tuo tavolo a Disco Pleasure, Chalet Valentino, a valle delle Gravare, Roccaraso. Nel weekend finiscono presto.", "Request your table at Disco Pleasure, Chalet Valentino, Valle delle Gravare, Roccaraso. At weekends they go fast."),
        (">Richiedi un tavolo per la stagione 26-27<", ">Request a table for the 26-27 season<"),
        ('<h1 class="u-vip-title">Tavoli</h1>', '<h1 class="u-vip-title">Tables</h1>'),
        ('placeholder="Nome" required autocomplete="given-name"><span>Nome</span>', 'placeholder="First name" required autocomplete="given-name"><span>First name</span>'),
        ('placeholder="Cognome" required autocomplete="family-name"><span>Cognome</span>', 'placeholder="Last name" required autocomplete="family-name"><span>Last name</span>'),
        ('for="tablePhone">Telefono<', 'for="tablePhone">Phone<'),
        ('aria-label="Prefisso"', 'aria-label="Country code"'),
        ('placeholder="Numero" required', 'placeholder="Number" required'),
        ('>Numero di persone</span>', '>Number of guests</span>'),
        ('<option value="" disabled selected>Scegli</option>', '<option value="" disabled selected>Choose</option>'),
        ('<span class="u-mono u-cal-label">Data</span>', '<span class="u-mono u-cal-label">Date</span>'),
        (">Scegli una data dal calendario: si possono selezionare solo i giorni in cui si balla.<", ">Choose a date from the calendar: only the days we are open can be selected.<"),
        ('class="u-mono">Note</label><span class="u-mono u-opt">Opzionale</span>', 'class="u-mono">Notes</label><span class="u-mono u-opt">Optional</span>'),
        ("<span>Voglio ricevere novità su date, tavoli ed eventi di Disco Pleasure.</span>", "<span>I'd like to receive news about Disco Pleasure dates, tables and events.</span>"),
        ('<span>Ho letto e accetto la <a href="/privacy" target="_blank">Privacy policy</a>.</span>', '<span>I have read and accept the <a href="/privacy" target="_blank">Privacy policy</a>.</span>'),
        ('type="submit">Invia</button>', 'type="submit">Send</button>'),
        ("Disco Pleasure userà i tuoi dati per gestire la richiesta del tavolo e risponderti. Se hai spuntato la casella, li userà anche per inviarti novità su date, tavoli ed eventi, via email o app di messaggistica: puoi dire di no in qualsiasi momento. La richiesta viene inviata via email al team dei tavoli tramite i servizi Resend o FormSubmit. Puoi chiedere la cancellazione dei tuoi dati scrivendoci. Tutti i dettagli nella",
         "Disco Pleasure will use your data to manage your table request and reply to you. If you ticked the box, it will also use them to send you news about dates, tables and events, by email or messaging apps: you can opt out at any time. The request is emailed to the tables team through the Resend or FormSubmit services. You can ask for your data to be deleted by writing to us. All the details are in the"),
    ],
    "news.html": [
        ("Aggiornamenti e tips di Disco Pleasure: date, tavoli, meteo del weekend e cosa portare.", "Disco Pleasure updates and tips: dates, tables, weekend weather and what to wear."),
        ('aria-label="Filtra le news"', 'aria-label="Filter the news"'),
        ('<button data-f="all">Tutte</button><button data-f="Aggiornamento">Aggiornamenti</button>', '<button data-f="all">All</button><button data-f="Update">Updates</button>'),
    ],
    "articolo.html": [
        ("<title>Articolo | Disco Pleasure</title>", "<title>Article | Disco Pleasure</title>"),
        ('content="Aggiornamenti di Disco Pleasure."', 'content="Disco Pleasure updates."'),
    ],
    "artisti.html": [
        ("Artisti 2026/27 | Disco Pleasure", "Artists 2026/27 | Disco Pleasure"),
        ("Resident e guest di Disco Pleasure, stagione 2026/27.", "Disco Pleasure residents and guests, 2026/27 season."),
        ('<h1 class="u-upd-title">Artisti</h1>', '<h1 class="u-upd-title">Artists</h1>'),
        ('placeholder="Cerca artisti..." aria-label="Cerca artisti"', 'placeholder="Search artists..." aria-label="Search artists"'),
    ],
    "artista.html": [
        ("Artisti 2026/27 | Disco Pleasure", "Artists 2026/27 | Disco Pleasure"),
        ("Resident e guest di Disco Pleasure, stagione 2026/27.", "Disco Pleasure residents and guests, 2026/27 season."),
        ('<h1 class="u-upd-title">Artisti</h1>', '<h1 class="u-upd-title">Artists</h1>'),
        ('placeholder="Cerca artisti..." aria-label="Cerca artisti"', 'placeholder="Search artists..." aria-label="Search artists"'),
    ],
    "chi-siamo.html": [
        ("Chi siamo | Disco Pleasure", "About | Disco Pleasure"),
        ("Chi siamo: Disco Pleasure è l&#x27;après-ski all&#x27;aperto dello Chalet Valentino, a valle delle Gravare, a Roccaraso. La festa all&#x27;aperto, il piazzale, Roccaraso, l&#x27;ora blu.", "About Disco Pleasure, the outdoor après-ski of Chalet Valentino, Valle delle Gravare, Roccaraso. The party outdoors, the square, Roccaraso, the blue hour."),
        ("Chi siamo: Disco Pleasure è l'après-ski all'aperto dello Chalet Valentino, a valle delle Gravare, a Roccaraso. La festa all'aperto, il piazzale, Roccaraso, l'ora blu.", "About Disco Pleasure, the outdoor après-ski of Chalet Valentino, Valle delle Gravare, Roccaraso. The party outdoors, the square, Roccaraso, the blue hour."),
    ],
    "come-arrivare.html": [
        ("Come arrivare | Disco Pleasure", "Getting here | Disco Pleasure"),
        ("Come arrivare allo Chalet Valentino, Viale delle Gravare, Roccaraso: con gli sci dalla pista Valle delle Gravare, in auto fino all&#x27;Aremogna, parcheggio e rientro.", "How to get to Chalet Valentino, Viale delle Gravare, Roccaraso: on skis from the Valle delle Gravare slope, by car up to Aremogna, parking and the way back."),
        ("Come arrivare allo Chalet Valentino, Viale delle Gravare, Roccaraso: con gli sci dalla pista Valle delle Gravare, in auto fino all'Aremogna, parcheggio e rientro.", "How to get to Chalet Valentino, Viale delle Gravare, Roccaraso: on skis from the Valle delle Gravare slope, by car up to Aremogna, parking and the way back."),
    ],
    "privacy.html": [],
    "cookie.html": [],
}
MAIN_REPLACE = {"chi-siamo.html": CHI_EN, "come-arrivare.html": FAQ_EN, "privacy.html": PRIVACY_EN, "cookie.html": COOKIE_EN}


def alternates(slug):
    it = f"{SITE}/{slug}" if slug else f"{SITE}/"
    en = SITE + to_en("/" + slug)
    return (f'<link rel="alternate" hreflang="it" href="{it}">\n<link rel="alternate" hreflang="en" href="{en}">\n'
            f'<link rel="alternate" hreflang="x-default" href="{it}">\n')


def add_alternates(html, slug):
    html = re.sub(r'<link rel="alternate" hreflang="[^"]+" href="[^"]*">\n', "", html)
    return html.replace('<link rel="icon"', alternates(slug) + '<link rel="icon"', 1)


def build(fname, reps):
    path = os.path.join(ROOT, fname)
    src = open(path, encoding="utf-8").read()
    slug = slug_of(fname)
    # le pagine italiane ricevono i link alternativi alla versione inglese
    it = add_alternates(src, slug)
    if it != src:
        open(path, "w", encoding="utf-8").write(it)
    h = add_alternates(src, slug)
    h = h.replace('<html lang="it">', '<html lang="en">', 1)
    h = h.replace('content="it_IT"', 'content="en_GB"')
    h = re.sub(r'(property="og:url" content="https://discopleasure\.com)(/[^"]*)"', lambda m: m.group(1) + to_en(m.group(2)) + '"', h)
    head, body = h.split("<body", 1)
    if fname in MAIN_REPLACE:
        a = body.index("<main"); b = body.index("</main>") + len("</main>")
        body = body[:a] + MAIN_REPLACE[fname] + body[b:]
    h = head + "<body" + body
    for old, new in OG_ALT + reps:
        if old in h:
            h = h.replace(old, new)
        elif not any(old == o for o, _ in OG_ALT):
            raise SystemExit(f"[{fname}] testo non trovato: {old[:80]}")
    # link interni del corpo pagina → indirizzi inglesi
    head, body = h.split("<body", 1)
    body = re.sub(r'href="(/(?!img/|favicon|icon-|manifest|styles)[^"]*)"', lambda m: f'href="{to_en(m.group(1))}"', body)
    h = head + "<body" + body
    # contenuti inglesi dopo data.js
    h = re.sub(r'(<script src="/data\.js(\?v=\d+)?"></script>)', lambda m: m.group(1) + f'\n<script src="/data-en.js{m.group(2) or ""}"></script>', h, count=1)
    os.makedirs(EN_DIR, exist_ok=True)
    open(os.path.join(EN_DIR, FILE_EN.get(fname, fname)), "w", encoding="utf-8").write(h)


# si riparte da zero: le vecchie pagine in /en/ vengono rimosse
if os.path.isdir(EN_DIR):
    for x in os.listdir(EN_DIR):
        if x.endswith(".html"):
            os.remove(os.path.join(EN_DIR, x))
for f, r in PAGES.items():
    build(f, r)
print("pagine inglesi generate:", len(PAGES))
