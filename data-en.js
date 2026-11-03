/* =========================================================
   CONTENUTI IN INGLESE: caricato solo dalle pagine in /en/, dopo data.js.
   Sovrascrive nomi di giorni e mesi, titoli delle date, Home, artisti e News.
   ========================================================= */

// giorni e mesi (gli indirizzi delle date restano in italiano, vedi MESI_URL)
GIORNI.splice(0, 7, "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
GIORNI_BREVI.splice(0, 7, "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
MESI.splice(0, 12, "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
MESI_BREVI.splice(0, 12, "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");

const SPECIAL_TITLES_EN = {
  "2026-12-05": "Opening",
  "2026-12-08": "Immaculate Conception",
  "2026-12-26": "St Stephen's Day",
  "2026-12-31": "New Year's Eve",
  "2027-01-01": "New Year's Day",
  "2027-01-06": "Epiphany",
  "2027-03-14": "Closing",
};
const PHASE_EN = { ponte: "Opening weekend", feste: "The holidays", weekend: "Weekends" };
EVENTS.forEach((e) => {
  const d = e.date, m = d.getMonth(), dd = d.getDate(), y = d.getFullYear();
  e.title = SPECIAL_TITLES_EN[e.id] || "Disco Pleasure";
  e.tag = SPECIAL_TITLES_EN[e.id] || null;
  e.phase = PHASE_EN[e.phaseKey];
  e.weekday = GIORNI[d.getDay()];
  e.short = `${GIORNI_BREVI[d.getDay()]} ${dd}.${m + 1}`;
  e.long = `${GIORNI[d.getDay()]} ${dd} ${MESI[m]} ${y}`;
  e.card = `${GIORNI_BREVI[d.getDay()]}, ${dd} ${MESI_BREVI[m]} ${y}`;
  e.lineup = [{ area: "Line-up", names: ["Resident", "Guest TBA"] }];
  e.entry = ["Entry info coming soon", "Tables on request"];
});

// Home
Object.assign(HOME.residencies[0], { day: "December 5 – 8", title: "Opening" });
Object.assign(HOME.residencies[1], { day: "December 26 – January 10", title: "The holidays" });
Object.assign(HOME.residencies[2], { day: "December 31 · January 1", title: "New Year" });
Object.assign(HOME.residencies[3], { day: "Until March 14", title: "Weekends" });
HOME.tickets.forEach((t, i) => { const e = EVENTS.find((x) => x.url === t.href); if (e) Object.assign(t, { day: e.short, title: e.title }); });

// Artisti
const ARTISTS_EN = {
  "marco-tropeano": { origin: "Naples", genres: ["House"], bio: [
    "Marco Tropeano is a Naples-born DJ and producer whose identity is deeply rooted in house music: underground grooves, infectious energy and the unmistakable character of his Mediterranean background.",
    "Raised within the vibrant club culture of Naples, he turned an early obsession with electronic music into a career that has taken him from his hometown to some of the most influential dancefloors in Europe and beyond. Today his project moves between Ibiza and the international circuit, keeping the raw, dancefloor-focused approach that has defined his sound from the start.",
    "A defining chapter is his relationship with Joseph Capriati's Metamorfosi: he has become a recurring presence in Ibiza, playing venues such as Amnesia and Hï Ibiza alongside some of the most established names in electronic music.",
    "As a producer he has released on Metamorfosi Records, The Martinez Brothers' Cuttin' Headz, Franky Rizardo's LTF Records, Nervous Records and Insomniac Records. He is also the founder of Ojomarino Records, an imprint born as an extension of his musical vision.",
    "Constantly moving between studio and dancefloor, he is now entering a new phase: pushing his sound forward, growing internationally and building an identity defined by one essential element, the music."] },
  "ale-de-tuglie": { origin: "Italy", genres: ["Techno", "House"], bio: [
    "Ale De Tuglie fell for electronic music at just 14. He soon decided to turn that passion, and the desire to see people dance under his guidance, into what he loves most, quickly standing out on the scene and ending up playing among the giants.",
    "As a DJ and as a producer, his style is unique and without boundaries: a precise balance of rhythm, groove and distinctive detail.",
    "Recognition came fast, taking him to some of Italy's best-known clubs such as Cromie, Spazio Novecento and Clorophilla. His sets are full of high-quality electronic music, energy and passion, with one mission: to guarantee the party and blow up the dancefloor every time.",
    "In 2021 that mission took him on tour with Marco Carola, a global heavyweight of techno, through clubs such as Ushuaïa Ibiza and Soho Garden in Dubai, earning a place on the line-ups of Music On, Carola's long-running concept born in 2012, and, in April 2022, at Printworks London."] },
  "jesse-calosso": { origin: "New York, USA", genres: ["House"], bio: [
    "Born and raised in New York, Jesse Calosso built his foundation in the city's uncompromising underground before expanding globally. Now dividing his time between Miami and Europe, he is a proven force on international dancefloors, trusted to command peak time without chasing trends.",
    "His sets move with intention: sudden shifts in tempo, pressure building and dissolving, rare selections colliding with timeless records, always groove-led and never predictable. He introduces dancers to records they didn't know they loved.",
    "His footprint spans Sunwaves, Coachella, Sonus, UNUM and Toffler Festival. Ibiza remains a defining territory: from Hï Ibiza with The Martinez Brothers and Music On at Pacha to Paradise at UNVRS, after earlier appearances at Circoloco DC-10. He has played back to back with The Martinez Brothers, Jean Pierre, Jamie Jones and Mason Collective.",
    "With releases on Cuttin' Headz, Hot Creations, Hottrax, V-House Sound, Tuskegee and more, from \"Do You Miss Brooklyn?\" to \"This Is 140\", \"Not Valid\" and \"Small Talk\", he is also the founder of Boogeyman, a cult imprint in its fifth year growing into a wider creative platform."] },
  "jean-pierre": { origin: "New York, USA", genres: ["Deep house", "Techno"], bio: [
    "If one word describes Jean Pierre, it is passion. Born and raised in Queens, New York, he has lived and breathed music for over fifteen years, always hunting for unique records that turn his sets into musical journeys, from emotional deep house to big-room techno.",
    "He rose quickly through the competitive New York club circuit, setting himself apart above all with his productions: from his debut on Younan Music to releases on Cuttin' Headz, Desolat, Transmit Recordings, Waveform Recordings, Defected, Deeperfect Records and Terminator Records, supported by Marco Carola, The Martinez Brothers, Loco Dice, Jamie Jones, Victor Calderone, Luciano and Steve Lawler.",
    "From New York dancefloors such as Electric Zoo (Awakenings stage), Pacha, Cielo, Output, Marquee and Space Ibiza New York, he has played in Spain, Germany, Venezuela, Ecuador, Colombia, Mexico (BPM Festival) and Puerto Rico (Movement Festival), with a sound that blends his New York upbringing and his Colombian roots.",
    "Holding a post at Halcyon, the renowned Brooklyn record store, he has become one of the most distinguished selectors of his generation."] },
  "italobros": { origin: "Scalea, Italy", genres: ["Techno", "Deep"], bio: [
    "ItaloBros were born in the late 1980s in Scalea, a small town in southern Italy. DJs, producers and remixers in constant musical evolution, they approach their work with new goals and new stimuli, exploring new paths and reinventing new languages.",
    "They don't like limits or a single genre label, but their roots are clear: old school, shaped by the most contemporary techno and deep sounds. Eclectic, creative and curious, they bring passion and adrenaline to the dancefloor.",
    "Their strength, their drive and their determination come from that passion, which gives them the courage to experiment and to be different."] },
  "dzeko": { origin: "Toronto, Canada", genres: ["Electronic", "Pop", "Hip-hop"], bio: [
    "Dzeko is a multi-platinum DJ and producer from Toronto with over 5 billion streams worldwide. Known for bridging electronic music with pop and hip-hop, he has collaborated with Tiësto, Post Malone, Lil Yachty, Swae Lee, Keith Urban, Loud Luxury, Kool & The Gang, Roy Woods and John Denver.",
    "His breakout hit \"Jackie Chan\" with Tiësto, Post Malone and Preme passed 1.2 billion streams and views and earned multiple platinum certifications around the world.",
    "After years of touring, festivals and chart success, Dzeko is now launching a new DJ project, GATANO: the start of a fresh creative chapter and sound direction in electronic music."] },
  "mario-bianco-gabriele-del-prete": { origin: "Naples", genres: ["House"], bio: [
    "Mario Bianco and Gabriele Del Prete play together as Putacaso, bringing their dynamic performances across Italy, starting from Naples.",
    "Mario Bianco began his journey as a DJ, producer and remixer in 2000, immersed in house and electronic music. His passion and enthusiasm led him to found his own label, Roundans. Known for blending timeless classics with innovative sounds, he has worked with labels such as Poker Flat Recordings, Do Not Sit On The Furniture and Stereo Productions, and over twenty years has shared the stage with some of the most influential names in house.",
    "Gabriele Del Prete has been behind the decks since the age of 14, building a career marked by high-energy sets, flawless mixing and ever-evolving selections. Drawn to house for its emotional depth, he has become a prominent figure on the scene. He is also the CEO of Club Tropicana, a staple of summer parties in southern Italy."] },
};
ARTISTS.forEach((a) => Object.assign(a, ARTISTS_EN[a.slug] || {}));

// News
const NEWS_EN = {
  "apriamo-il-5": { tag: "Update", date: "November 15, 2026", title: "The return, at 1,500 metres",
    lead: "On Saturday, December 5, Chalet Valentino opens the season. Four days of long weekend, from noon to 7 pm, with snow as the set and afternoon light as the only dress code.",
    intro: [
      "Those who were there know: at the Gravare, après-ski is not the pause between one run and the next, it is the reason to come up. Technical jackets open over knitwear, mirrored goggles pushed up on the forehead, a glass in hand and the low sun cutting across the valley.",
      "This year the curtain rises with the Immaculate Conception long weekend. Two notes before you load the skis into the car."],
    sections: [
      { h: "Four days, four moods", label: "December 5 · 6 · 7 · 8", text: [
        "Saturday is the debut, full of anticipation. Sunday and Monday find their rhythm, slower and longer. Tuesday the 8th closes the long weekend with the Immaculate Conception holiday, the last light before the break.",
        "Four dates, four different line-ups. The names are revealed one by one in the calendar: if you have already picked your day, keep an eye on it, the news lands there first."] },
      { h: "Getting in", label: "Tickets", text: [
        "One event per date on Eventbrite, with the link on each day's page. For those who prefer a fixed spot on the platform, a table can be requested through the form: we reply personally."] }] },
  "tavoli": { tag: "Update", date: "November 20, 2026", title: "The table, a user's guide",
    lead: "The platform is made for dancing: tables are few, set around the edges, and on the busiest days they go fast. Here is how to secure one.",
    intro: ["Up here, a table is an address. The place to leave helmets and jackets, where the group meets when everyone comes down from the slopes at different times, where you return between sets with cheeks red from the cold."],
    sections: [
      { h: "When to book", label: "Weekends and holidays", text: [
        "Saturdays, the Immaculate Conception weekend, New Year and Epiphany are the days when the platform fills up early in the afternoon. For large groups, booking makes the difference between a comfortable afternoon and one spent with a backpack on your shoulders.",
        "Weekdays in January are quieter, but a request before you come up is always an elegant gesture."] },
      { h: "How to request one", label: "The form", text: [
        "From the Tables page: name, contact details, how many you are, up to fifteen, and the date chosen from the calendar, where only the days we are open can be selected.",
        "We reply with availability. If the date you had in mind is full, we suggest the closest one."] },
      { h: "On the day", label: "On arrival", text: [
        "At the entrance just give the name on the booking and we will walk you to your table. If your plans change, let us know so we can give the spot to someone else.",
        "A regular's tip: the table is your base, but the party is on the dancefloor. Don't stay seated too long."] }] },
  "meteo-weekend": { tag: "Tips", date: "Every Friday", title: "The sky, first of all",
    lead: "At 1,500 metres the weather changes within the hour, and so does your wardrobe. The hour-by-hour Gravare forecast is on the Getting here page: check it before you leave.",
    intro: ["The midday sun is a charmer. On the platform you're fine in a sweater while the light hits the snow, then the sun slips behind the ridge and the temperature drops. Knowing what to expect is the first form of style."],
    sections: [
      { h: "Where to check", label: "Getting here", text: [
        "On the Getting here page, under \"What's the weather like up there?\", you'll find the next twenty-four hours, the seven-day outlook and the details that matter: sunrise and sunset, wind, freezing level.",
        "Each date's page also shows the forecast for that day, starting sixteen days ahead."] },
      { h: "The hour to remember", label: "Sunset", text: [
        "In December the sun leaves the platform around 4:40 pm. That's when the lights come on and the afternoon changes skin.",
        "On clear days it's worth being there a little earlier: the blue hour on the snow can't be described, it has to be seen."] },
      { h: "If the weather changes its mind", label: "Changes of plan", text: [
        "If wind or snow make us change the hours, we post it here in the News and on social media the same morning.",
        "The hourly forecast is the most reliable: check it before you leave, not the night before."] }] },
  "cosa-portare": { tag: "Tips", date: "Season 2026/27", title: "Dressing for -6°",
    lead: "We dance outdoors from noon to 7 pm. At midday the sun is generous, after sunset it isn't: what you wear makes the difference.",
    intro: ["No warm cloakroom, no indoor dancefloor: Disco Pleasure is real après-ski, on the snow. A few style rules from people who spend the whole season up here."],
    sections: [
      { h: "The art of layering", label: "The basic rule", text: [
        "Three light layers beat one heavy down jacket: a technical base layer, a warm mid layer and a shell that stops the wind. Take one off in the sun, put it back at sunset, and it's already a choreography.",
        "Cotton against the skin is the only real mistake: it gets wet while you dance and freezes the moment you stop."] },
      { h: "Hands, head, eyes", label: "The details", text: [
        "After 4 pm gloves and a beanie stop being accessories. Sunglasses are needed until the last ray: snow reflects more than you think, and a mirrored lens does the rest.",
        "A pair of thin gloves in your pocket is the secret to using your phone without sacrificing your fingers."] },
      { h: "On your feet", label: "Ski boots or shoes", text: [
        "If you come from the slopes, keep your ski boots on: you're in excellent company. If you walk up, choose a sole that grips on packed snow: at sunset the ground freezes.",
        "Wool or technical socks, always. Cold feet are the number one reason people leave the party too early."] }] },
  "dal-26": { tag: "Update", date: "December 1, 2026", title: "Sixteen days, no breaks",
    lead: "From December 26 to January 10 we don't stop: Disco Pleasure is open every day, from noon to 7 pm. Then every weekend, until March 14.",
    intro: ["The Christmas holidays are when Roccaraso fills with lights, voices and skis propped against the fences. We're there every day, with line-ups that change from one afternoon to the next."],
    sections: [
      { h: "The holidays", label: "December 26 - January 10", text: [
        "We start on St Stephen's Day and carry on until Sunday, January 10. Sixteen afternoons, same hours, always outdoors.",
        "In the calendar every date has its Eventbrite event and the table request form."] },
      { h: "Dates to circle", label: "December 31, January 1 and 6", text: [
        "New Year's Eve, New Year's Day and Epiphany are the most awaited days of the season. Programmes and line-ups are announced here and on social media as soon as they are confirmed.",
        "They are also the first to sell out their tables: if you're coming as a group, move early."] },
      { h: "Then the weekends", label: "Until March 14", text: [
        "After January 10 we meet on Saturdays and Sundays, from mid-January through February, until the closing on March 13 and 14.",
        "Every weekend has its own programme: you'll find it in the calendar, month by month."] }] },
};
NEWS.forEach((n) => {
  const t = NEWS_EN[n.id]; if (!t) return;
  const imgs = n.sections.map((s) => s.img);
  Object.assign(n, { tag: t.tag, date: t.date, title: t.title, lead: t.lead, intro: t.intro });
  n.sections = t.sections.map((s, i) => ({ ...s, img: imgs[i] }));
});
