# Strategiskskole.dk — Claude Code Project

## Ejer
Thomas Kjerstein — thomas@strategiskskole.dk — 61 65 73 65

## Arbejdsstil
- Svar direkte og handlingsorienteret (rød DISC). Handling først, forklaring bagefter.
- Udfør opgaver autonomt — spørg ikke om ting du selv kan løse.
- Hold svar korte og præcise.

## Kerneprodukt — Tirsdag kl. 10-modellen®
6 trin: Spejling → Klarhed → Valg → Struktur → Kernen → Forankring
Testspørgsmål: "Kan vi se strategien i det, der sker tirsdag kl. 10?"
3 roller: Skoleleder, Ledelsesteam, Bestyrelsen
Brug ALTID ® efter "Tirsdag kl. 10-modellen" og korrekte trin-navne med stort forbogstav.

## Projekter i dette repo

### tk10-app/ — Next.js frontend
- Next.js 15 / React 19 / Tailwind 4 / TypeScript
- PWA med manifest og ikoner
- Supabase som database
- `npm run dev` for lokal udvikling
- Deploy: `cd tk10-app && vercel --prod`
- Vercel projekt: strategiskskoledk-app
- Slå ALTID Vercel Authentication fra efter deploy (Settings → Deployment Protection)

### ai-engine-worker/ — Cloudflare Worker backend
- Worker-navn: `strategi-chat`
- Entry: `src/index.js` → bundled til `bundled-worker.js`
- AI: Cloudflare Workers AI (Llama 3.1 8B website, Llama 3.3 70B forløb) — gratis
- Database: Supabase (PostgreSQL) + Cloudflare D1 som fallback
- D1 database: `strategiskskole-ai` (ID: e3b67a7b-5dfd-4be2-8a36-6c0ecf770fdc)
- Cloudflare Account: eb16329845e191549fb80e5b5d629b5b
- CORS: strategiskskole.dk + *.vercel.app
- Endpoints: /api/chat, /api/session, /api/progress, /api/health
- Deploy: `cd ai-engine-worker && npx wrangler deploy`
- Test altid fra strategiskskole.dk (CORS blokerer localhost)

### strategiskskole-app/ — Vercel-deployed app (Vite)
- Self-contained React app med CDN-baseret React 18
- Vite build, Vercel hosting
- Vercel projekt-ID: prj_vVXs7kCM7OqPkarTkaegbsflJek5
- URL: https://strategiskskoledk-app.vercel.app/
- Deploy: `cd strategiskskole-app && vercel --prod`
- Responsive split-view layout (desktop: chat + kort side om side)

### app/ — Simpel HTML/PWA prototype
- Standalone HTML med service worker
- Ældre prototype — tk10-app er den primære frontend

### Rod-filer (website)
- HTML-sider (index.html, ydelser.html, om-os.html, kontakt.html, lp-*.html osv.)
- Hosted på GitHub Pages → strategiskskole.dk
- chatbot.js — chatbot frontend (bruger ai-engine-worker backend)
- chatbot-worker.js — DEPRECATED, brug ai-engine-worker i stedet

## Farvepalette
| Farve | Hex | Brug |
|-------|-----|------|
| Navy | #1A3A5C | Primær, headers |
| Blå | #2E6DA4 | Links, H2 |
| Lys blå | #D5E8F0 | Baggrundsbokse |
| Guld | #C8A84B | Accent, humane kort |
| Grå | #5A5A5A | Brødtekst |
| Varm | #f4ede4 | Baggrund humane kort |

## Fonte
- Merriweather — overskrifter
- Open Sans — brødtekst

## Arkitektur
Tre klienter (website, tk10-app, digitalt-forloeb) → én Cloudflare Worker → Supabase + Workers AI + KV
Klienttype sendes som `source`-header. Hele stakken kører på gratis tiers (0 kr./md).

## Canva
- Proceskort design-ID: DAHEmR5FufQ (376×532 px)
- Brand Kit ID: kAEw2ybOvuw

## Vigtige filer
- `AI-Motor — Systemarkitektur.md` — komplet backend-specifikation (v2.0)
- `System Master - Strategiskskole.dk.docx` — overordnet projektdokumentation
- `supabase-setup.sql` — database-skema
