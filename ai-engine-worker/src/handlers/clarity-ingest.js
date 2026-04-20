// ============================================================
// Clarity Ingest Handler
// Henter insights fra Microsoft Clarity Data Export API
// Kører dagligt i nightly cron + manuelt via /api/clarity-ingest
// ============================================================

import { insertSharedKnowledge } from '../data/db.js'

const CLARITY_API = 'https://www.clarity.ms/export-data/api/v1/project-live-insights'

export async function handleClarityIngest(env) {
  const token = env.CLARITY_API_TOKEN
  if (!token) {
    return { ok: false, error: 'CLARITY_API_TOKEN mangler' }
  }

  const db = env.DB
  const today = new Date().toISOString().slice(0, 10)
  const kilde = `clarity:${today}`

  // Ryd tidligere records for samme dato (idempotent)
  try {
    await db.prepare('DELETE FROM shared_knowledge WHERE kilde = ?').bind(kilde).run()
  } catch (e) {
    console.error('Clarity: delete fejl:', e.message)
  }

  const queries = [
    { url: `${CLARITY_API}?numOfDays=3`, label: 'overordnet seneste 3 dage' },
    { url: `${CLARITY_API}?numOfDays=3&dimension1=Page`, label: 'pr. side seneste 3 dage' },
    { url: `${CLARITY_API}?numOfDays=3&dimension1=Device`, label: 'pr. device seneste 3 dage' },
    { url: `${CLARITY_API}?numOfDays=3&dimension1=Country`, label: 'pr. land seneste 3 dage' },
  ]

  const records = []
  let hasTraffic = false

  for (const { url, label } of queries) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) {
        console.error(`Clarity API ${label}: HTTP ${res.status}`)
        continue
      }
      const data = await res.json()
      const extracted = extractInsights(data, label, today)
      if (extracted.some(r => r.hasTraffic)) hasTraffic = true
      records.push(...extracted.map(({ hasTraffic: _, ...r }) => r))
    } catch (e) {
      console.error(`Clarity ${label} fejl:`, e.message)
    }
  }

  // Hvis ingen trafik, log det som indsigt så chatbot'en ved det
  if (!hasTraffic && records.length === 0) {
    records.push({
      tema: 'clarity-status',
      trin: null,
      rolle: null,
      type: 'indsigt',
      indhold: `Clarity-tracking er aktiv på strategiskskole.dk, men ingen trafik registreret seneste 3 dage (pr. ${today}). Når besøgende kommer, bygges indsigter automatisk op her.`,
      kontekst: `Clarity status ${today}`,
      kilde,
      kvalitet: 0.6,
    })
  }

  if (records.length > 0) {
    try {
      await insertSharedKnowledge(db, records)
    } catch (e) {
      console.error('Clarity insert fejl:', e.message)
      return { ok: false, error: 'Insert fejlede: ' + e.message }
    }
  }

  return {
    ok: true,
    dato: today,
    queries: queries.length,
    records_indsat: records.length,
    trafik_fundet: hasTraffic,
  }
}

// Clarity returnerer: [{ metricName: "...", information: [{ ... }] }, ...]
function extractInsights(data, label, today) {
  if (!Array.isArray(data)) return []

  const out = []
  const byMetric = {}
  for (const m of data) {
    if (!m || !m.metricName || !Array.isArray(m.information)) continue
    byMetric[m.metricName] = m.information
  }

  // Traffic (aggregeret eller pr. dimension)
  const traffic = byMetric.Traffic || []
  let hasTraffic = false
  for (const t of traffic) {
    const sessions = toInt(t.totalSessionCount ?? t.sessionsCount)
    if (sessions > 0) hasTraffic = true
    const dimValue = t.Page || t.Device || t.Country
    if (sessions > 0) {
      if (dimValue) {
        out.push({
          hasTraffic: true,
          tema: `traffic-${slugify(dimValue)}`,
          trin: null,
          rolle: null,
          type: 'indsigt',
          indhold: `${label}: ${dimValue} → ${sessions} sessioner${t.distinctUserCount ? `, ${t.distinctUserCount} unikke brugere` : ''}.`,
          kontekst: `Clarity ${today}`,
          kilde: `clarity:${today}`,
          kvalitet: 0.8,
        })
      } else {
        out.push({
          hasTraffic: true,
          tema: 'traffic-total',
          trin: null,
          rolle: null,
          type: 'indsigt',
          indhold: `${label} (total): ${sessions} sessioner, ${t.distinctUserCount || '?'} unikke brugere${t.pagesPerSessionPercentage ? `, ${t.pagesPerSessionPercentage} sider/session` : ''}.`,
          kontekst: `Clarity ${today}`,
          kilde: `clarity:${today}`,
          kvalitet: 0.85,
        })
      }
    }
  }

  // UX-friktion metrics
  const frictionMetrics = [
    { name: 'DeadClickCount', label: 'dead clicks (klik på ikke-klikbare elementer)', kvalitet: 0.9 },
    { name: 'RageClickCount', label: 'rage clicks (frustrations-klik)', kvalitet: 0.95 },
    { name: 'QuickbackClick', label: 'quick-backs (hurtig tilbage-navigation)', kvalitet: 0.9 },
    { name: 'ExcessiveScroll', label: 'excessive scroll (leder efter indhold)', kvalitet: 0.85 },
    { name: 'ScriptErrorCount', label: 'JavaScript-fejl', kvalitet: 0.9 },
    { name: 'ErrorClickCount', label: 'error clicks', kvalitet: 0.85 },
  ]

  for (const fm of frictionMetrics) {
    const info = byMetric[fm.name] || []
    for (const entry of info) {
      const count = toInt(entry.sessionsCount ?? entry.subTotal)
      if (count <= 0) continue
      const dimValue = entry.Page || entry.Device || entry.Country
      out.push({
        hasTraffic: true,
        tema: `ux-friktion${dimValue ? '-' + slugify(dimValue) : ''}`,
        trin: null,
        rolle: null,
        type: 'indsigt',
        indhold: `${dimValue || 'samlet'}: ${count} ${fm.label} (${entry.sessionsWithMetricPercentage || 0}% af sessioner). ${entry.pagesViews ? `Berørte sidevisninger: ${entry.pagesViews}.` : ''}`.trim(),
        kontekst: `Clarity ${today}`,
        kilde: `clarity:${today}`,
        kvalitet: fm.kvalitet,
      })
    }
  }

  // Scroll-dybde
  const scroll = byMetric.ScrollDepth || []
  for (const s of scroll) {
    if (s.averageScrollDepth == null) continue
    const depth = Math.round(s.averageScrollDepth * 100)
    const dimValue = s.Page || s.Device
    let narrative
    if (depth < 40) narrative = `Lav scroll-dybde (${depth}%). Brugerne ser ikke under folden — overvej kortere hero eller stærkere signal øverst.`
    else if (depth < 65) narrative = `Middel scroll-dybde (${depth}%).`
    else narrative = `Høj scroll-dybde (${depth}%) — brugerne læser substantielt af siden.`
    out.push({
      hasTraffic: true,
      tema: `scroll${dimValue ? '-' + slugify(dimValue) : ''}`,
      trin: null,
      rolle: null,
      type: 'indsigt',
      indhold: `${dimValue || 'samlet'}: ${narrative}`,
      kontekst: `Clarity ${today}`,
      kilde: `clarity:${today}`,
      kvalitet: 0.8,
    })
  }

  // Engagement time
  const engage = byMetric.EngagementTime || []
  for (const e of engage) {
    if (e.totalTime == null && e.activeTime == null) continue
    const active = e.activeTime ? Math.round(e.activeTime / 1000) : null
    if (!active) continue
    out.push({
      hasTraffic: true,
      tema: 'engagement-tid',
      trin: null,
      rolle: null,
      type: 'indsigt',
      indhold: `Gennemsnitlig aktiv tid pr. session: ${active} sekunder.`,
      kontekst: `Clarity ${today}`,
      kilde: `clarity:${today}`,
      kvalitet: 0.75,
    })
  }

  // Populære sider
  const popular = byMetric.PopularPages || []
  for (const p of popular) {
    if (!p.Page) continue
    out.push({
      hasTraffic: true,
      tema: `populaer-side-${slugify(p.Page)}`,
      trin: null,
      rolle: null,
      type: 'indsigt',
      indhold: `Populær side: ${p.Page} med ${p.pagesViews || p.sessionsCount || '?'} sidevisninger.`,
      kontekst: `Clarity ${today}`,
      kilde: `clarity:${today}`,
      kvalitet: 0.8,
    })
  }

  // Henvisere
  const referrers = byMetric.ReferrerUrl || []
  for (const r of referrers) {
    if (!r.ReferrerUrl) continue
    out.push({
      hasTraffic: true,
      tema: 'henviser',
      trin: null,
      rolle: null,
      type: 'indsigt',
      indhold: `Henviser: ${r.ReferrerUrl} → ${r.sessionsCount || '?'} sessioner.`,
      kontekst: `Clarity ${today}`,
      kilde: `clarity:${today}`,
      kvalitet: 0.7,
    })
  }

  return out
}

function toInt(v) {
  if (v == null) return 0
  const n = typeof v === 'string' ? parseInt(v, 10) : v
  return Number.isFinite(n) ? n : 0
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/\.html$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50) || 'ukendt'
}
