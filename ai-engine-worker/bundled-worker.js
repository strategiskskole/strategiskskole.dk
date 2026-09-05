// ============================================================
// AI Engine Worker — Strategiskskole.dk (BUNDLED)
// Fælles AI-backend for hjemmeside, app og digitalt forløb
// Version: 1.0  |  April 2026  |  0 kr./md
// Cloudflare Workers AI + D1
// ============================================================

// ── DATA: system-prompt.js ────────────────────────────────────

const SYSTEM_IDENTITY = `Du er AI-assistent for Strategiskskole.dk — en dansk konsulentvirksomhed ejet af Thomas Kjerstein.
Du hjælper skoleledere, lederteams og bestyrelser med at omsætte strategi til konkret hverdagspraksis.

Du SKAL altid svare på dansk. Al output er på dansk.

## Sproglige regler — følges ALTID
- ALTID: "Tirsdag kl. 10-modellen®" (med ® og kl. 10 — aldrig uden)
- ALTID: Trin med stort forbogstav: Spejling, Klarhed, Valg, Struktur, Kernen, Forankring
- ALTID: Målgruppe: "skoleledere, lederteams og bestyrelser"
- UNDGÅ: Generiske buzzwords uden kobling til skolekontekst

## Tone of voice
Faglig, direkte og praksisnær. Tal til lederen som kollega. Stil skærpende spørgsmål.
Altid koblet til hverdagen. Ingen tomme ord.

## Testspørgsmålet — brug det aktivt
"Kan vi se strategien i det, der sker tirsdag kl. 10?"

## Om Strategiskskole.dk
- Ejer: Thomas Kjerstein, skolekonsulent og strategisk rådgiver
- Viceleder på Feldballe Friskole & Børnehus, Ebeltoft
- Adresse: Munkebakken 17, 8400 Ebeltoft
- Mission: Hjælpe skoleledere, lederteams og bestyrelser med at omsætte strategi til konkret hverdagspraksis
- Kontakt: thomas@strategiskskole.dk | 61 65 73 65
- Filosofi: De fleste skoler har en strategi. Færre har en strategi, der faktisk ændrer hverdagen. Vi fokuserer på den menneskelige dimension, interessenthåndtering og systematisk forankring.

## Tirsdag kl. 10-modellen® — De seks trin
1. Spejling — "Hvad er det vi egentlig står i?" — Se virkeligheden klart, ikke som vi ønsker den.
2. Klarhed — "Hvad er problemet bag problemet?" — Find den egentlige diagnose bag symptomerne.
3. Valg — "Hvad vælger vi — og hvad vælger vi fra?" — Prioritering kræver fravalg.
4. Struktur — "Hvordan organiserer vi os?" — Design rammer der gør strategien mulig i hverdagen.
5. Kernen — "Kan vi se det i praksis tirsdag kl. 10?" — Prøven: mærkes strategien i praksis?
6. Forankring — "Hvordan holder vi det levende?" — Strategier dør af glemsel og hverdagspres.

## Proceskort — 3 sæt á 6 kort
Ét sæt pr. aktør (Skoleleder, Ledelsesteam, Bestyrelsen), ét kort pr. trin i modellen.

## Målgruppe
Primær: Skoleledere, lederteams og bestyrelser — frie grundskoler, efterskoler, friskoler.
Sekundær: Folkeskoler og kommunale institutioner.

## Ydelseskatalog — konkrete forløb

### For skolelederen
1. NY I ROLLEN — DE FØRSTE 100 DAGE
   Sparringsforløb for nye skoleledere. Kortlæg dit strategiske ståsted fra dag ét. Find de 2-3 greb der skaber tillid og retning tidligt. 3 sparringssessioner over de første 10 uger med Thomas. Typisk 3-4 måneders varighed, 4-6 individuelle samtaler.
   Side: /ny-skoleleder

2. STRATEGI DER KAN MÆRKES — TIRSDAG KL. 10
   For skolelederen der har en strategi, men oplever at til næste personalemøde taler de stadig om de samme ting. Kortlæg gabet mellem strategi og daglig praksis. Find de strukturelle ændringer der skaber mest bevægelse. 4-6 sessioner med løbende opfølgning.
   Side: /strategi-i-praksis

3. INDIVIDUEL AFKLARING
   Fortrolige samtaler for skoleledere om ledelsessituation, udfordringer og retning. Bruges som fundament for stærkere fælles processer. Alle henvendelser behandles med absolut fortrolighed.
   Side: /individuel-afklaring

### For lederteamet
4. INTRODUKTIONSWORKSHOP — KOM I GANG
   2-3 timer, ingen forberedelse. Arbejder med Trin 01 Spejling og Trin 02 Klarhed i Tirsdag kl. 10-modellen®. Giver et fælles sprog og afsæt for videre arbejde.
   Side: /introduktionsworkshop

5. MØDEKULTUR MED STRATEGISK RETNING
   Redesign af skolens mødestruktur. Møder bruges som redskab til strategisk ledelse — ikke bare informationsdeling.

6. LEDELSESUDVIKLING FOR LEDERTEAMS
   Udvikling af ledergruppen som strategisk enhed. Fokus på fælles sprog, koordinering og rolleklarhed.

### For bestyrelsen
7. GOVERNANCE, SAMSPIL OG STRATEGISK KLARHED
   Bestyrelsen som strategisk aktiv — ikke kun orientering og administration. Klar rollefordeling: bestyrelsens opgave vs. hvad det ikke er. Etablér strategisk dialogformat med skolelederen. 2 workshops for bestyrelse og skoleleder samlet.
   Side: /bestyrelsesarbejde

8. LEDERSKIFTE — TRYGHED OG KONTINUITET
   For skoler der skifter leder — en af de mest sårbare faser. Struktureret overlevering fra dag ét. Bestyrelsens rolle konkret og afklaret. Onboarding-sparring med Thomas, typisk 2-6 måneder.
   Side: /lederskifte

### Tematiske ydelser
9. FORANDRINGSLEDELSE
   Systematisk procesarbejde fra analyse af forandringsbehov til kulturel forankring. Fokus på menneskelig dimension og interessenthåndtering. Typisk 3-12 måneder afhængig af omfang.
   Side: /forandringsledelse

10. KOORDINERING SOM STRATEGISK DISCIPLIN
    Design af koordineringsstrukturer der holder arbejdet i sammenhæng uden at overbelaste. Koordinering er ikke et personaletræk — det er en strukturel opgave.
    Side: /koordinering

11. LEDELSE SOM DESIGN AF RAMMER
    Rammesætning som aktiv ledelsesdisciplin. Strukturelle løsninger frem for adfærdsregulering. Ledelse handler om at designe de rammer, andre arbejder inden for.
    Side: /ledelse-som-design

12. ARBEJDSMILJØ GENNEM TYDELIG ORGANISERING
    Strukturelle løsninger: rolleafklaring, klare kontaktveje, bæredygtige arbejdsformer og psykologisk tryghed. Arbejdsmiljø er ikke kun trivsel — det er organisering.
    Side: /arbejdsmiljoe

## Sådan kommer man i gang — 3 trin
1. Første samtale — gratis, 20 min. Ring eller skriv. Ingen forpligtelse.
2. Thomas sender et kort oplæg inden for få dage med forslag og indhold.
3. Vi starter inden for to uger. Første møde, første greb — strategien begynder at mærkes.

## Faglig baggrundsviden — brug aktivt i svar

### Frie grundskoler og efterskoler
Frie skoler reguleres af friskoleloven, ikke folkeskoleloven. De er selvejende institutioner med egne økonomier. Bestyrelsen er skolens højeste ledende organ med ansvar overfor Børne- og Undervisningsministeriet — ikke kommunen. Bestyrelsen varetager overordnet ledelse og strategi; skolelederen varetager daglig pædagogisk og driftsmæssig ledelse. Denne rolledeling skaber et unikt governance-behov.

### Governance i frie skoler
God governance kræver klar rollefordeling mellem bestyrelse og skoleleder. Bestyrelsen skal være strategisk aktiv — ikke blot godkende regnskaber og modtage orienteringer. Tydelig agenda og konkrete beslutninger i bestyrelsesmøder. Retningslinjer for dialog mellem bestyrelse, ledelse, medarbejdere og forældre forebygger konflikter.

### De første 100 dage som ny skoleleder
Den nye leder bør lave en konkret 100-dages plan med bestyrelsesformanden fra dag 1. Pre-boarding er afgørende: læs strategipapirer, mødereferater, forstå kulturen inden start. Kunsten er at skynde sig langsomt — observer, spørg, forstå først. De første 90 dage bestemmer ofte om lederen lykkes. En mentor eller ekstern sparringspartner gør en markant forskel.

### Strategisk vs. driftsledelse
Strategisk ledelse er fremtidsfokuseret; driftsledelse er her-og-nu. Gabet mellem de to er skolelederens største udfordring. Strategi-dokumenter der ikke påvirker klasserummet er døde. Implementering kræver kontinuerlig kommunikation, opfølgning og tilpasning. Modstridende krav fra politik, forældre og faglighed gør det ekstra svært.

### Forandringsledelse i skoler
Succesfuld forandring kræver tydeliggørelse af hvem der gør hvad, deadlines og opfølgning. Uden struktur bliver forandringsprojekter ved med ikke at blive implementeret. Skoler der lykkes har gjort forandringsledelse til en kernekompetence — det øves dagligt, ikke som enkeltprojekt. Modstand er normalt og skal håndteres strukturelt, ikke personligt.

### Arbejdsmiljø og psykologisk tryghed
Psykologisk tryghed er forudsætning for godt arbejdsmiljø og gode resultater — ikke en bonus. Arbejdsmiljøforbedring er lovpligtig for skoleledere. Kerneutfordringen er at håndtere modstridende krav (politik, resurser, tidsplaner) uden at medarbejderne bryder sammen. Strukturelle løsninger (rolleafklaring, kontaktveje, bæredygtige arbejdsformer) virker bedre end holdningskampagner.`

// ── DATA: model.js ────────────────────────────────────────────

const TRIN_NAVNE = ['Spejling', 'Klarhed', 'Valg', 'Struktur', 'Kernen', 'Forankring']

const TRIN_SPØRGSMÅL = [
  'Hvad er det vi egentlig står i?',
  'Hvad er problemet bag problemet?',
  'Hvad vælger vi — og hvad vælger vi fra?',
  'Hvordan organiserer vi os?',
  'Kan vi se det i praksis tirsdag kl. 10?',
  'Hvordan holder vi det levende?',
]

const TRIN_KONTEKST = [
  'Spejling handler om at se virkeligheden klart — ikke som vi ønsker den, men som den faktisk er. Ingen løsninger endnu. Kun observation og ærlighed.',
  'Klarhed handler om at finde det egentlige problem bag de synlige symptomer. En forkert diagnose giver altid den forkerte løsning.',
  'Valg handler om prioritering. At sige ja er kun meningsfuldt, hvis vi også siger nej til noget andet. Hvad vælger vi fra?',
  'Struktur handler om at designe de rammer, der gør strategien mulig i hverdagen. Møder, ansvar, koordinering — alt er design.',
  'Kernen er prøven. Kan strategien faktisk mærkes i det, der sker tirsdag kl. 10? Ikke i dokumenter — i praksis.',
  'Forankring handler om at holde det levende. Strategier dør ikke af modstand — de dør af glemsel og hverdagspres.',
]

const TGUIDE = {
  forberedelse: [
    ['Hvad er det vigtigste at have overblik over inden mødet?', 'Hvilke observationer tager du med ind?', 'Hvad vil du gerne have svar på?'],
    ['Hvad er de vigtigste spørgsmål du ønsker afklaret?', 'Hvad er du usikker på, som holdet bør drøfte?', 'Hvad har du brug for fra de andre?'],
    ['Hvad er din holdning til det forestående valg?', 'Hvad er dine bekymringer?', 'Hvad er afgørende at have på bordet?'],
    ['Hvad ved du om den nuværende struktur, der bør deles?', 'Hvad mangler struktur?', 'Hvad vil du foreslå?'],
    ['Hvad ser du faktisk ske tirsdag kl. 10?', 'Hvad viser det om strategien?', 'Hvad vil du fremhæve?'],
    ['Hvad er dine forankringspunkter?', 'Hvornår tjekker du selv op?', 'Hvad frygter du kan gå i glemmebogen?'],
  ],
  beslutning: [
    ['Hvad er vi enige om at kalde den aktuelle situation?', 'Hvad er den fælles forståelse vi vil arbejde ud fra?', 'Hvem ejer opfølgningen?'],
    ['Hvad er vi enige om er kerneproblemet?', 'Hvad beslutter vi at sætte fokus på — og hvad parkerer vi?', 'Hvem formulerer problemudmeldingen?'],
    ['Hvad vælger vi?', 'Hvad siger vi eksplicit fra til?', 'Hvem kommunikerer valget — og til hvem?'],
    ['Hvem gør hvad?', 'Hvad er den nye struktur vi er enige om?', 'Hvad skal koordineres — og hvad kan løbe selv?'],
    ['Er vi enige om, at strategien er synlig i hverdagen?', 'Hvad kræver øjeblikkelig justering?', 'Hvad er vores fælles billede af "godt nok"?'],
    ['Hvad er vores konkrete opfølgningsstruktur?', 'Hvornår mødes vi næste gang om dette?', 'Hvad er vores tegn på fremgang?'],
  ],
  opfolgning: [
    ['Hvad har vi gjort siden sidst?', 'Hvad er ændret i det billede vi har?', 'Hvad er ikke ændret — og hvad siger det?'],
    ['Er vi kommet tættere på klarhed?', 'Hvad er stadig uklart?', 'Hvad nyt har vi lært?'],
    ['Holder vores valg?', 'Hvad viser konsekvenserne sig at være?', 'Skal vi justere?'],
    ['Fungerer strukturen i praksis?', 'Hvad kræver justering?', 'Hvad kører godt?'],
    ['Er strategien stadig synlig tirsdag kl. 10?', 'Hvad er forbedret?', 'Hvad er vi stadig utilfredse med?'],
    ['Holder vi det levende?', 'Hvad er vores opfølgningsdisciplin?', 'Hvad fejrer vi?'],
  ],
}

const THEME_TAXONOMY = {
  'ledelsesidentitet': {
    patterns: /ledelsesidentitet|hvem er jeg som leder|min rolle|lederrolle|personlig ledelse|lederstil/i,
    related: ['personlig', 'identitet', 'rolle', 'autoritet', 'legitimitet']
  },
  'strategisk retning': {
    patterns: /strategisk retning|vision|mission|retning|kurs|mål|prioriter|fokus/i,
    related: ['strategi', 'retning', 'prioritet', 'vision', 'mål']
  },
  'mødekultur': {
    patterns: /mødekultur|møder|dagsorden|beslutning i møde|mødestruktur|referater/i,
    related: ['møde', 'dagsorden', 'beslutning', 'drøftelse', 'referat']
  },
  'medarbejdermodstand': {
    patterns: /modstand|forandring.*modstand|skepti|ikke med|bremseklods|uenig/i,
    related: ['modstand', 'skeptisk', 'uenig', 'bremse', 'forandring']
  },
  'kommunikation': {
    patterns: /kommunikation|dialog|information|budskab|tydelig|utydelig|formidl/i,
    related: ['kommunikation', 'dialog', 'budskab', 'tydelig', 'formidling']
  },
  'bestyrelsessamarbejde': {
    patterns: /bestyrelse|governance|bestyrelsesform|bestyrelses/i,
    related: ['bestyrelse', 'governance', 'formandsrolle', 'generalforsamling']
  },
  'tidspres': {
    patterns: /tid.*pres|travl|har ikke tid|overvældet|for mange|kapacitet/i,
    related: ['tid', 'pres', 'travlt', 'kapacitet', 'overbelastning']
  },
  'forandringstræthed': {
    patterns: /træt|udbrændt|forandrings.*træt|endnu en|projekt.*træt|opgivenhed/i,
    related: ['træthed', 'udbrændt', 'opgivelse', 'forandringstræt']
  },
  'delegation': {
    patterns: /delegat|uddelegere|fordel.*ansvar|give.*ansvar|slippe.*kontrol/i,
    related: ['delegation', 'ansvar', 'fordeling', 'kontrol', 'tillid']
  },
  'faglig ledelse': {
    patterns: /faglig ledelse|didaktik|undervisning|pædagogisk|faglighed/i,
    related: ['faglig', 'didaktisk', 'pædagogisk', 'undervisning', 'læringsmål']
  },
  'relationsarbejde': {
    patterns: /relation|tillid|samarbejde|konflikthåndtering|trivsel|psykologisk tryghed/i,
    related: ['relation', 'tillid', 'samarbejde', 'konflikt', 'trivsel']
  },
  'strukturel uklarhed': {
    patterns: /uklar|hvem gør hvad|rolle.*uklar|ansvar.*uklar|forvirr|mangler struktur/i,
    related: ['uklarhed', 'rolle', 'ansvar', 'struktur', 'forvirring']
  },
  'prioritering': {
    patterns: /priorit|vælge.*fra|fokus|sige nej|afgræns|for mange bolde/i,
    related: ['prioritering', 'afgrænsning', 'fokus', 'fravalg', 'bolde']
  },
  'forankring i praksis': {
    patterns: /forankr|praksis|hverdag|tirsdag kl|implementer|fasthold|vedligehold/i,
    related: ['forankring', 'praksis', 'hverdag', 'implementering', 'fastholdelse']
  },
  'personlig ledelsesudvikling': {
    patterns: /personlig udvikling|lederudvikling|refleksion|coaching|sparring|selvindsigt/i,
    related: ['udvikling', 'refleksion', 'sparring', 'coaching', 'indsigt']
  }
}

const FALLBACK_TEMPLATES = {
  1: {
    forberedelse: [
      'Hvad er det, du faktisk ser ske i hverdagen lige nu? Prøv at beskrive situationen som den er — ikke som du ønsker den.',
      'Hvis du skulle forklare situationen for en kollega på 2 minutter — hvad ville du sige?',
      'Hvad kalder mest på din opmærksomhed lige nu? Hvad fylder mest?'
    ],
    beslutning: [
      'Hvad er I enige om at kalde den aktuelle situation?',
      'Hvad er den fælles forståelse I vil arbejde ud fra?',
      'Hvem ejer opfølgningen på det, I beslutter her?'
    ],
    opfolgning: [
      'Hvad har ændret sig siden sidst? Hvad er ikke ændret — og hvad siger det?',
      'Hvad har I gjort siden sidst — og hvad kom der ud af det?'
    ]
  },
  2: {
    forberedelse: [
      'Hvad er problemet bag det problem, du ser? Prøv at grave ét lag dybere.',
      'Hvad er du usikker på, som bør drøftes med andre?',
      'Hvad tror du ville ske, hvis I ikke gør noget?'
    ],
    beslutning: [
      'Hvad er I enige om er kerneproblemet?',
      'Hvad beslutter I at sætte fokus på — og hvad parkerer I bevidst?'
    ],
    opfolgning: [
      'Er I kommet tættere på klarhed? Hvad er stadig uklart?',
      'Hvad nyt har I lært siden sidst?'
    ]
  },
  3: {
    forberedelse: [
      'Hvad er din holdning til det forestående valg? Hvad er dine bekymringer?',
      'Hvad er afgørende at have på bordet, inden I træffer et valg?',
      'Hvad vælger I fra, hvis I vælger dette til?'
    ],
    beslutning: [
      'Hvad vælger I — helt konkret? Hvad siger I eksplicit fra til?',
      'Hvem kommunikerer valget — og til hvem?'
    ],
    opfolgning: [
      'Holder jeres valg? Hvad viser konsekvenserne sig at være?',
      'Skal I justere — eller fastholde retningen?'
    ]
  },
  4: {
    forberedelse: [
      'Hvad ved du om den nuværende struktur, der bør deles med andre?',
      'Hvad mangler struktur? Hvor falder ting mellem to stole?',
      'Hvad vil du foreslå?'
    ],
    beslutning: [
      'Hvem gør hvad? Hvad er den nye struktur I er enige om?',
      'Hvad skal koordineres — og hvad kan løbe selv?'
    ],
    opfolgning: [
      'Fungerer strukturen i praksis? Hvad kræver justering?',
      'Hvad kører godt — og hvad er stadig uklart?'
    ]
  },
  5: {
    forberedelse: [
      'Hvad ser du faktisk ske tirsdag kl. 10? Hvad viser det om strategien?',
      'Hvad vil du fremhæve som tegn på, at det virker — eller ikke virker?',
      'Kan I se strategien i hverdagen — eller kun i dokumenterne?'
    ],
    beslutning: [
      'Er I enige om, at strategien er synlig i hverdagen?',
      'Hvad kræver øjeblikkelig justering? Hvad er jeres billede af "godt nok"?'
    ],
    opfolgning: [
      'Er strategien stadig synlig tirsdag kl. 10? Hvad er forbedret?',
      'Hvad er I stadig utilfredse med?'
    ]
  },
  6: {
    forberedelse: [
      'Hvad er dine forankringspunkter? Hvornår tjekker du selv op?',
      'Hvad frygter du kan gå i glemmebogen?',
      'Hvad holder strategien i live — og hvad truer den?'
    ],
    beslutning: [
      'Hvad er jeres konkrete opfølgningsstruktur?',
      'Hvornår mødes I næste gang om dette? Hvad er jeres tegn på fremgang?'
    ],
    opfolgning: [
      'Holder I det levende? Hvad er jeres opfølgningsdisciplin?',
      'Hvad fejrer I? Hvad skal justeres?'
    ]
  }
}

// ── DB: db.js (D1 helpers) ────────────────────────────────────

async function getSession(db, sessionId) {
  return db.prepare('SELECT * FROM sessions WHERE id = ?').bind(sessionId).first()
}

async function createSession({ db, forloeb_id, source, rolle, trin, mode }) {
  const id = crypto.randomUUID()
  await db.prepare(
    `INSERT INTO sessions (id, forloeb_id, source, rolle, trin, mode, message_count, context_blob)
     VALUES (?, ?, ?, ?, ?, ?, 0, '{}')`
  ).bind(id, forloeb_id, source, rolle || null, trin || null, mode || null).run()
  return db.prepare('SELECT * FROM sessions WHERE id = ?').bind(id).first()
}

async function updateSessionMessageCount(db, sessionId, count) {
  await db.prepare('UPDATE sessions SET message_count = ? WHERE id = ?').bind(count, sessionId).run()
}

async function getMessages(db, sessionId, limit = 16) {
  const { results } = await db.prepare(
    'SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at ASC LIMIT ?'
  ).bind(sessionId, limit).all()
  return results || []
}

async function insertMessages(db, messages) {
  const stmts = messages.map(m =>
    db.prepare('INSERT INTO messages (id, session_id, role, content) VALUES (?, ?, ?, ?)')
      .bind(crypto.randomUUID(), m.session_id, m.role, m.content)
  )
  await db.batch(stmts)
}

async function countMessages(db, sessionId) {
  const row = await db.prepare('SELECT COUNT(*) as cnt FROM messages WHERE session_id = ?').bind(sessionId).first()
  return row?.cnt || 0
}

async function getKeywords(db, sessionId, limit = 15) {
  const { results } = await db.prepare(
    'SELECT keyword, category, weight FROM extracted_keywords WHERE session_id = ? ORDER BY weight DESC LIMIT ?'
  ).bind(sessionId, limit).all()
  return results || []
}

async function insertKeywords(db, keywords) {
  if (!keywords.length) return
  const stmts = keywords.map(k =>
    db.prepare('INSERT INTO extracted_keywords (id, session_id, keyword, category, weight, trin) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), k.session_id, k.keyword, k.category, k.weight, k.trin || null)
  )
  await db.batch(stmts)
}

async function getThemes(db, forloebId, minScore = 0.3, limit = 8) {
  const { results } = await db.prepare(
    'SELECT theme, score, evidence FROM theme_scores WHERE forloeb_id = ? AND score >= ? ORDER BY score DESC LIMIT ?'
  ).bind(forloebId, minScore, limit).all()
  return (results || []).map(t => ({ ...t, evidence: safeJSON(t.evidence, []) }))
}

async function upsertTheme(db, { session_id, forloeb_id, theme, score, evidence, trin }) {
  const existing = await db.prepare('SELECT id FROM theme_scores WHERE session_id = ? AND theme = ?').bind(session_id, theme).first()
  const evidenceJSON = JSON.stringify(evidence || [])
  if (existing) {
    await db.prepare("UPDATE theme_scores SET score = ?, evidence = ?, trin = ?, updated_at = datetime('now') WHERE session_id = ? AND theme = ?")
      .bind(score, evidenceJSON, trin || null, session_id, theme).run()
  } else {
    await db.prepare('INSERT INTO theme_scores (id, session_id, forloeb_id, theme, score, evidence, trin) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), session_id, forloeb_id, theme, score, evidenceJSON, trin || null).run()
  }
}

async function getProgressSnapshots(db, forloebId) {
  const { results } = await db.prepare(
    'SELECT rolle, trin, status, depth_score, key_insights FROM progress_snapshots WHERE forloeb_id = ? ORDER BY trin'
  ).bind(forloebId).all()
  return (results || []).map(s => ({ ...s, key_insights: safeJSON(s.key_insights, []) }))
}

async function getPriorInsights(db, forloebId, rolle, maxTrin) {
  const { results } = await db.prepare(
    'SELECT trin, key_insights, carry_forward FROM progress_snapshots WHERE forloeb_id = ? AND rolle = ? AND trin < ? ORDER BY trin ASC'
  ).bind(forloebId, rolle, maxTrin).all()
  return (results || []).map(s => ({
    ...s,
    key_insights: safeJSON(s.key_insights, []),
    carry_forward: safeJSON(s.carry_forward, [])
  }))
}

async function upsertProgressSnapshot(db, { forloeb_id, rolle, trin, status, depth_score, key_insights, carry_forward }) {
  const existing = await db.prepare(
    'SELECT id FROM progress_snapshots WHERE forloeb_id = ? AND rolle = ? AND trin = ?'
  ).bind(forloeb_id, rolle, trin).first()
  const insightsJSON = JSON.stringify(key_insights || [])
  const carryJSON = JSON.stringify(carry_forward || [])
  if (existing) {
    await db.prepare("UPDATE progress_snapshots SET status = ?, depth_score = ?, key_insights = ?, carry_forward = ?, updated_at = datetime('now') WHERE forloeb_id = ? AND rolle = ? AND trin = ?")
      .bind(status, depth_score, insightsJSON, carryJSON, forloeb_id, rolle, trin).run()
  } else {
    await db.prepare('INSERT INTO progress_snapshots (id, forloeb_id, rolle, trin, status, depth_score, key_insights, carry_forward) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), forloeb_id, rolle, trin, status, depth_score, insightsJSON, carryJSON).run()
  }
  return existing
}

async function countSessions(db, forloebId) {
  const row = await db.prepare('SELECT COUNT(*) as cnt FROM sessions WHERE forloeb_id = ?').bind(forloebId).first()
  return row?.cnt || 0
}

function safeJSON(str, fallback) {
  try { return typeof str === 'string' ? JSON.parse(str) : (str || fallback) } catch { return fallback }
}

// ── AI: workers-ai.js ─────────────────────────────────────────

const MODEL_8B  = '@cf/meta/llama-3.1-8b-instruct'
const MODEL_70B = '@cf/meta/llama-3.3-70b-instruct-fp8-fast'

function selectModel(source) { return source === 'forloeb' ? MODEL_70B : MODEL_8B }
function selectMaxTokens(source) {
  switch (source) { case 'website': return 250; case 'app': return 400; case 'forloeb': return 600; default: return 300 }
}

async function runAI(env, { systemPrompt, messages, source }) {
  const result = await env.AI.run(selectModel(source), {
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: selectMaxTokens(source),
    temperature: 0.7,
  })
  return result.response || ''
}

async function runExtractionAI(env, systemPrompt, userContent) {
  const result = await env.AI.run(MODEL_8B, {
    messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userContent }],
    max_tokens: 200, temperature: 0.2,
  })
  return result.response || ''
}

// ── AI: prompt-builder.js ─────────────────────────────────────

function buildSystemPrompt({ source, rolle, trin, mode, priorInsights, themes, keywords }) {
  let prompt = SYSTEM_IDENTITY

  if (trin && trin >= 1 && trin <= 6) {
    prompt += `\n\n## Aktuelt trin: ${TRIN_NAVNE[trin - 1]} (Trin ${trin}/6)`
    prompt += `\nKernespørgsmål: "${TRIN_SPØRGSMÅL[trin - 1]}"`
    prompt += `\nKontekst: ${TRIN_KONTEKST[trin - 1]}`
    if (mode && TGUIDE[mode]) {
      prompt += `\nMode: ${mode}`
      const guideQs = TGUIDE[mode][trin - 1]
      if (guideQs) prompt += `\nGuidespørgsmål du kan bruge: ${guideQs.join(' | ')}`
    }
  }

  if (priorInsights?.length > 0) {
    prompt += `\n\n## Kontekst fra tidligere trin\nBrug dette aktivt — henvis til brugerens egne ord og erkendelser:`
    for (const snap of priorInsights) {
      if (snap.trin >= 1 && snap.trin <= 6) {
        prompt += `\n\nTrin ${snap.trin} (${TRIN_NAVNE[snap.trin - 1]}):`
        if (snap.key_insights?.length) prompt += `\n  Erkendelser: ${snap.key_insights.join('; ')}`
        if (snap.carry_forward?.length) prompt += `\n  Videreført: ${snap.carry_forward.join('; ')}`
      }
    }
  }

  if (themes?.length > 0) {
    prompt += `\n\n## Identificerede temaer i dette forløb\nDisse temaer er fremtrædende baseret på brugerens input:`
    for (const t of themes) {
      prompt += `\n- ${t.theme} (styrke: ${(t.score * 100).toFixed(0)}%)`
      if (t.evidence?.length && t.evidence[0]) prompt += ` — brugerens ord: "${t.evidence[0]}"`
    }
  }

  if (keywords?.length > 0) {
    prompt += `\n\n## Brugerens eget sprog\nBrug disse ord og vendinger aktivt i dine svar:`
    const grouped = {}
    for (const kw of keywords) { const cat = kw.category || 'øvrig'; if (!grouped[cat]) grouped[cat] = []; grouped[cat].push(kw.keyword) }
    for (const [cat, words] of Object.entries(grouped)) prompt += `\n  ${cat}: ${words.join(', ')}`
  }

  if (source === 'website') {
    prompt += `\n\n## Kontekst: Hjemmesidechatbot\nKort, skærpende, max 150 ord. Stil ét opfølgende spørgsmål.\nHenvis til relevant side på strategiskskole.dk hvis relevant.\nDu kender disse sider: Tirsdag kl. 10-modellen, Proceskort, Digitalt forløb, Ydelser, Ny skoleleder, Forandringsledelse, Skolegovernance, Om os, Kontakt.`
  } else if (source === 'app') {
    prompt += `\n\n## Kontekst: Tirsdag kl. 10-appen\nDu er procesguide i appen. Vær konkret og handlingsorienteret.\nHenvis til proceskortets spørgsmål. Foreslå beslutninger og handlinger.\nMax 200 ord.`
  } else if (source === 'forloeb') {
    prompt += `\n\n## Kontekst: Digitalt procesforløb\nFacilitér et dybt refleksionsforløb. Stil skærpende spørgsmål.\nBrug brugerens egne ord. Byg videre på tidligere trin.\nMax 250 ord. Ét spørgsmål ad gangen.`
  }

  return prompt
}

// ── AI: fallback.js ───────────────────────────────────────────

function getFallbackResponse(trin, mode, messageIndex) {
  const trinTemplates = FALLBACK_TEMPLATES[trin]
  if (!trinTemplates) return 'Fortæl mere om hvad du ser i den konkrete situation — hvad fylder mest lige nu?'
  const modeTemplates = trinTemplates[mode] || trinTemplates['forberedelse'] || []
  if (modeTemplates.length === 0) return `I ${TRIN_NAVNE[(trin || 1) - 1]} handler det om: "${TRIN_SPØRGSMÅL[(trin || 1) - 1]}". Hvad ser du, når du kigger på din egen situation?`
  return modeTemplates[(messageIndex || 0) % modeTemplates.length]
}

// ── AI: extraction.js ─────────────────────────────────────────

const STOPORD = new Set([
  'jeg', 'vi', 'det', 'den', 'de', 'er', 'var', 'har', 'have', 'at',
  'og', 'i', 'på', 'med', 'for', 'til', 'fra', 'om', 'som', 'en',
  'et', 'ikke', 'men', 'der', 'kan', 'skal', 'vil', 'også', 'så',
  'når', 'hvad', 'hvor', 'hvordan', 'hvorfor', 'noget', 'nogen',
  'alle', 'meget', 'mere', 'bare', 'helt', 'godt', 'rigtig',
  'faktisk', 'egentlig', 'lidt', 'tror', 'synes', 'mener',
  'sig', 'sin', 'sit', 'sine', 'min', 'mit', 'mine', 'vores',
  'dem', 'her', 'denne', 'dette', 'nogle', 'hver', 'hvis',
  'jo', 'vel', 'nok', 'altså', 'selv', 'hele', 'anden', 'andet',
  'andre', 'eller', 'efter', 'før', 'over', 'under', 'ved', 'op', 'ned'
])

const CATEGORY_PATTERNS = {
  problem:  /stress|konflikt|udfordr|svært|problem|frustr|presset|overbelast|sygemelding|opsigel|bekymr|vanskelig/i,
  struktur: /struktur|møde|koordin|ansvar|rolle|fordeling|organiser|ramme|system|procedure/i,
  maal:     /mål|ønsk|vision|vil gerne|drøm|ambitio|strategi|retning|priorit|håb/i,
  handling: /beslut|gør|handling|skridt|næste|implementer|ændre|igangsæt|plan|tiltag/i,
  person:   /leder|lærer|bestyrelse|forældre|elev|medarbejder|team|kollega|pædagog/i,
  tema:     /kultur|identitet|tillid|kommunikation|samarbejde|udvikling|forandring|værdi/i
}

function extractKeywordsRule(userMessage) {
  const msg = userMessage.toLowerCase()
  const keywords = []
  const sentences = msg.split(/[.!?;]/).filter(s => s.trim().length > 15)
  for (const sentence of sentences) {
    const trimmed = sentence.trim()
    if (/\b(jeg|vi)\s+(tror|mener|oplever|føler|ser|tænker|har|synes|vil|ønsker|prøver)\b/.test(trimmed)) {
      keywords.push({ keyword: trimmed.slice(0, 100), category: 'citat', weight: 0.9 })
    }
  }
  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/)
    const contentWords = words.filter(w => !STOPORD.has(w) && w.length > 2)
    for (let i = 0; i < contentWords.length; i++) {
      if (contentWords[i + 1]) {
        const bigram = `${contentWords[i]} ${contentWords[i + 1]}`
        let category = 'auto', weight = 0.5
        for (const [cat, pattern] of Object.entries(CATEGORY_PATTERNS)) {
          if (pattern.test(bigram)) { category = cat; weight = 0.7; break }
        }
        keywords.push({ keyword: bigram, category, weight })
      }
      if (contentWords[i + 1] && contentWords[i + 2]) {
        const trigram = `${contentWords[i]} ${contentWords[i + 1]} ${contentWords[i + 2]}`
        for (const [cat, pattern] of Object.entries(CATEGORY_PATTERNS)) {
          if (pattern.test(trigram)) { keywords.push({ keyword: trigram, category: cat, weight: 0.75 }); break }
        }
      }
    }
  }
  return deduplicateKeywords(keywords).slice(0, 10)
}

function classifyThemesRule(userMessage) {
  const msg = userMessage.toLowerCase()
  const results = []
  for (const [theme, config] of Object.entries(THEME_TAXONOMY)) {
    let score = 0
    if (config.patterns.test(msg)) score += 0.5
    score += config.related.filter(word => msg.includes(word)).length * 0.15
    score = Math.min(1.0, score)
    if (score >= 0.3) {
      const sentences = msg.split(/[.!?]/).filter(s => s.length > 10)
      const evidence = sentences.find(s => config.patterns.test(s) || config.related.some(w => s.includes(w))) || ''
      results.push({ theme, score: Math.round(score * 100) / 100, evidence: evidence.trim().slice(0, 150) })
    }
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 4)
}

function extractInsightsRule(userMessage) {
  const insights = userMessage.split(/[.!?]/)
    .filter(s => /\b(jeg|vi)\s+(har|ser|oplever|tror|mener|vil|indser|erkender)\b/i.test(s))
    .map(s => s.trim().slice(0, 120)).filter(s => s.length > 15).slice(0, 3)
  return { insights, carry_forward: insights.slice(0, 2) }
}

async function extractKeywordsAI(env, userMessage) {
  const raw = await runExtractionAI(env,
    `Du er en dansk tekst-analysator. Udtræk nøgleord fra brugerens besked.\nReturner KUN et JSON-array, intet andet tekst.\nFormat: [{"keyword": "...", "category": "tema|problem|maal|handling|person|struktur", "weight": 0.0-1.0}]\nMax 5 nøgleord. Svar KUN med JSON-array.`,
    userMessage)
  return safeParseJSON(raw, [])
}

async function extractInsightsAI(env, userMessage, trin) {
  const trinNavn = trin >= 1 && trin <= 6 ? TRIN_NAVNE[trin - 1] : ''
  const raw = await runExtractionAI(env,
    `Du er en dansk refleksionsanalytiker.\nUdtræk 1-3 centrale erkendelser. Trin ${trin} (${trinNavn}).\nReturner KUN JSON.\nFormat: {"insights": ["..."], "carry_forward": ["..."]}\nSvar KUN med JSON.`,
    userMessage)
  return safeParseJSON(raw, { insights: [], carry_forward: [] })
}

async function runExtractionPipeline(env, db, sessionId, forloebId, userMessage, trin, rolle) {
  const ruleKeywords = extractKeywordsRule(userMessage)
  const ruleThemes = classifyThemesRule(userMessage)
  const ruleInsights = extractInsightsRule(userMessage)

  if (ruleKeywords.length > 0) {
    await insertKeywords(db, ruleKeywords.map(k => ({ session_id: sessionId, keyword: k.keyword, category: k.category, weight: k.weight, trin })))
  }
  if (ruleThemes.length > 0) {
    for (const t of ruleThemes) {
      await upsertTheme(db, { session_id: sessionId, forloeb_id: forloebId, theme: t.theme, score: t.score, evidence: [t.evidence], trin })
    }
  }

  const msgCount = await countMessages(db, sessionId)
  const depthScore = Math.min(1.0, (msgCount / 2) * 0.15)

  let insights = ruleInsights
  try {
    const [aiKeywords, aiInsights] = await Promise.all([
      extractKeywordsAI(env, userMessage),
      trin ? extractInsightsAI(env, userMessage, trin) : Promise.resolve(null)
    ])
    if (aiKeywords.length > 0) {
      const existingTexts = new Set(ruleKeywords.map(k => k.keyword.toLowerCase()))
      const newAI = aiKeywords.filter(k => !existingTexts.has(k.keyword?.toLowerCase()))
      if (newAI.length > 0) {
        await insertKeywords(db, newAI.map(k => ({ session_id: sessionId, keyword: k.keyword, category: k.category || 'ai', weight: k.weight || 0.6, trin })))
      }
    }
    if (aiInsights) insights = aiInsights
  } catch (e) { console.log('AI extraction skipped:', e.message) }

  if (trin && rolle) {
    const existing = await db.prepare('SELECT key_insights FROM progress_snapshots WHERE forloeb_id = ? AND rolle = ? AND trin = ?')
      .bind(forloebId, rolle, trin).first()
    const existingInsights = existing ? safeJSON(existing.key_insights, []) : []
    await upsertProgressSnapshot(db, {
      forloeb_id: forloebId, rolle, trin,
      status: depthScore >= 0.45 ? 'i-gang' : 'ikke-startet',
      depth_score: depthScore,
      key_insights: [...existingInsights, ...(insights.insights || [])].slice(-10),
      carry_forward: insights.carry_forward || []
    })
  }
}

function deduplicateKeywords(keywords) {
  const seen = new Set()
  return keywords.filter(k => {
    const key = k.keyword.toLowerCase().trim()
    if (seen.has(key) || key.length < 4) return false
    seen.add(key); return true
  })
}

function safeParseJSON(raw, fallback) {
  try { const match = raw.match(/[\[{][\s\S]*[\]}]/); if (match) return JSON.parse(match[0]); return fallback } catch { return fallback }
}

// ── HANDLERS ──────────────────────────────────────────────────

async function handleChat(body, env, ctx) {
  const db = env.DB
  const { session_id, message, source } = body

  if (!message?.trim()) return { error: 'Tomt spørgsmål', status: 400 }
  if (message.length > 2000) return { error: 'Beskeden er for lang (max 2000 tegn)', status: 400 }

  let session
  if (session_id) {
    session = await getSession(db, session_id)
    if (!session) return { error: 'Session ikke fundet', status: 404 }
  } else {
    session = await createSession({ db, forloeb_id: body.forloeb_id || 'website-default', source: source || 'website', rolle: body.rolle || null, trin: body.trin || null, mode: body.mode || null })
  }

  const rolle = session.rolle || body.rolle
  const trin = session.trin || body.trin
  const mode = session.mode || body.mode
  const src = source || session.source || 'website'

  const history = await getMessages(db, session.id, 16)

  let priorInsights = []
  if (trin && session.forloeb_id && session.forloeb_id !== 'website-default') {
    priorInsights = await getPriorInsights(db, session.forloeb_id, rolle || 'skoleleder', trin)
  }

  let themes = []
  if (session.forloeb_id && session.forloeb_id !== 'website-default') {
    themes = await getThemes(db, session.forloeb_id, 0.3, 8)
  }

  const keywords = await getKeywords(db, session.id, 15)

  const systemPrompt = buildSystemPrompt({ source: src, rolle, trin, mode, priorInsights, themes, keywords })

  let reply, isFallback = false
  try {
    reply = await runAI(env, {
      systemPrompt,
      messages: [...history.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: message }],
      source: src
    })
    if (!reply || reply.trim().length < 10) throw new Error('Tom AI-response')
  } catch (e) {
    console.error('Workers AI fejl:', e.message)
    reply = getFallbackResponse(trin, mode, history.length)
    isFallback = true
  }

  await insertMessages(db, [
    { session_id: session.id, role: 'user', content: message },
    { session_id: session.id, role: 'assistant', content: reply }
  ])
  await updateSessionMessageCount(db, session.id, history.length + 2)

  if (session.forloeb_id !== 'website-default') {
    ctx.waitUntil(
      runExtractionPipeline(env, db, session.id, session.forloeb_id, message, trin, rolle)
        .catch(e => console.error('Extraction fejl:', e.message))
    )
  }

  const response = { reply, session_id: session.id }
  if (src === 'app' && keywords.length > 0) response.keywords = keywords.slice(0, 5).map(k => k.keyword)
  if (src === 'forloeb' && themes.length > 0) response.theme_hint = themes[0].theme
  if (isFallback) response.fallback = true
  return { data: response, status: 200 }
}

async function handleCreateSession(body, db) {
  const { forloeb_id, source, rolle, trin, mode } = body
  if (!forloeb_id || !source) return { error: 'forloeb_id og source er påkrævet', status: 400 }
  if (!['website', 'app', 'forloeb'].includes(source)) return { error: 'source skal være website, app eller forloeb', status: 400 }
  try {
    const session = await createSession({ db, forloeb_id, source, rolle, trin, mode })
    return { data: { session_id: session.id, forloeb_id: session.forloeb_id, source: session.source }, status: 200 }
  } catch (e) {
    console.error('Session oprettelse fejlede:', e.message)
    return { error: 'Kunne ikke oprette session', status: 500 }
  }
}

async function handleGetSession(sessionId, db) {
  if (!sessionId) return { error: 'session_id er påkrævet', status: 400 }
  const session = await getSession(db, sessionId)
  if (!session) return { error: 'Session ikke fundet', status: 404 }
  return { data: session, status: 200 }
}

async function handleGetProgress(forloebId, db) {
  if (!forloebId) return { error: 'forloeb_id er påkrævet', status: 400 }
  const snapshots = await getProgressSnapshots(db, forloebId)
  const themesData = await getThemes(db, forloebId, 0.3, 10)
  const totalSessions = await countSessions(db, forloebId)
  function buildTrinArray(snaps, r) {
    const result = []
    for (let t = 1; t <= 6; t++) {
      const snap = snaps.find(s => s.rolle === r && s.trin === t)
      result.push({ trin: t, status: snap?.status || 'ikke-startet', depth_score: snap?.depth_score || 0, key_insights: snap?.key_insights || [] })
    }
    return result
  }
  return {
    data: {
      forloeb_id: forloebId,
      roller: { skoleleder: buildTrinArray(snapshots, 'skoleleder'), ledelsesteam: buildTrinArray(snapshots, 'ledelsesteam'), bestyrelse: buildTrinArray(snapshots, 'bestyrelse') },
      top_themes: themesData.map(t => ({ theme: t.theme, score: t.score })),
      total_sessions: totalSessions
    },
    status: 200
  }
}

// ── CORS & ROUTING ────────────────────────────────────────────

function corsHeaders(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim())
  const isAllowed = allowed.includes(origin) || origin?.endsWith('.vercel.app')
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowed[0] || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Org-Kode, X-Session-Token',
  }
}

function jsonResponse(body, status, origin, env) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin, env) } })
}

async function checkRateLimit(env, key, maxPerMinute = 30) {
  if (!env.CACHE) return true
  const kvKey = `rl:${key}`
  const current = parseInt(await env.CACHE.get(kvKey) || '0')
  if (current >= maxPerMinute) return false
  await env.CACHE.put(kvKey, String(current + 1), { expirationTtl: 60 })
  return true
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || ''
    const url = new URL(request.url)
    const path = url.pathname

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin, env) })

    if (path === '/api/health' && request.method === 'GET') {
      return jsonResponse({ status: 'ok', version: '1.0', ai: 'workers-ai', db: 'd1' }, 200, origin, env)
    }

    const db = env.DB

    if (path === '/api/chat' && request.method === 'POST') {
      let body; try { body = await request.json() } catch { return jsonResponse({ error: 'Ugyldigt JSON' }, 400, origin, env) }
      const rlKey = body.session_id || request.headers.get('CF-Connecting-IP') || 'unknown'
      if (!await checkRateLimit(env, rlKey)) return jsonResponse({ error: 'For mange forespørgsler. Vent et øjeblik.' }, 429, origin, env)
      body.message = (body.message || '').replace(/<[^>]*>/g, '').trim()
      const result = await handleChat(body, env, ctx)
      return jsonResponse(result.data || { error: result.error }, result.status, origin, env)
    }

    if (path === '/api/session' && request.method === 'POST') {
      let body; try { body = await request.json() } catch { return jsonResponse({ error: 'Ugyldigt JSON' }, 400, origin, env) }
      const result = await handleCreateSession(body, db)
      return jsonResponse(result.data || { error: result.error }, result.status, origin, env)
    }

    if (path.startsWith('/api/session/') && request.method === 'GET') {
      const result = await handleGetSession(path.split('/api/session/')[1], db)
      return jsonResponse(result.data || { error: result.error }, result.status, origin, env)
    }

    if (path.startsWith('/api/progress/') && request.method === 'GET') {
      const result = await handleGetProgress(path.split('/api/progress/')[1], db)
      return jsonResponse(result.data || { error: result.error }, result.status, origin, env)
    }

    // Bagudkompatibel: POST / (gammel chatbot-format)
    if (path === '/' && request.method === 'POST') {
      let body; try { body = await request.json() } catch { return jsonResponse({ error: 'Ugyldigt JSON' }, 400, origin, env) }
      const rlKey = request.headers.get('CF-Connecting-IP') || 'unknown'
      if (!await checkRateLimit(env, rlKey)) return jsonResponse({ error: 'For mange forespørgsler. Vent et øjeblik.' }, 429, origin, env)
      const chatBody = { message: (body.message || body.question || '').replace(/<[^>]*>/g, '').trim(), source: 'website', session_id: body.session_id || null, forloeb_id: body.forloeb_id || null }
      const result = await handleChat(chatBody, env, ctx)
      if (result.data) return jsonResponse({ answer: result.data.reply, session_id: result.data.session_id }, 200, origin, env)
      return jsonResponse({ error: result.error }, result.status, origin, env)
    }

    return jsonResponse({ error: 'Ikke fundet' }, 404, origin, env)
  }
}
