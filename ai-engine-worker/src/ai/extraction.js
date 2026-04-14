// ============================================================
// Hybrid extraction pipeline (D1-version)
// Fase 1: Regelbaseret (altid, gratis)
// Fase 2: AI-beriget (når kvote tillader)
// ============================================================

import { THEME_TAXONOMY, TRIN_NAVNE } from '../data/model.js'
import { runExtractionAI } from './workers-ai.js'
import {
  insertKeywords, upsertTheme, countMessages, upsertProgressSnapshot,
  insertSharedKnowledge, searchSharedKnowledge
} from '../data/db.js'

// ── Stopord (danske) ──────────────────────────────────────────

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

// ── Kategori-patterns ─────────────────────────────────────────

const CATEGORY_PATTERNS = {
  problem:  /stress|konflikt|udfordr|svært|problem|frustr|presset|overbelast|sygemelding|opsigel|bekymr|vanskelig/i,
  struktur: /struktur|møde|koordin|ansvar|rolle|fordeling|organiser|ramme|system|procedure/i,
  maal:     /mål|ønsk|vision|vil gerne|drøm|ambitio|strategi|retning|priorit|håb/i,
  handling: /beslut|gør|handling|skridt|næste|implementer|ændre|igangsæt|plan|tiltag/i,
  person:   /leder|lærer|bestyrelse|forældre|elev|medarbejder|team|kollega|pædagog/i,
  tema:     /kultur|identitet|tillid|kommunikation|samarbejde|udvikling|forandring|værdi/i
}

// ══════════════════════════════════════════════════════════════
// FASE 1: Regelbaseret extraction
// ══════════════════════════════════════════════════════════════

export function extractKeywordsRule(userMessage) {
  const msg = userMessage.toLowerCase()
  const keywords = []

  // 1. Sætninger med "jeg/vi + verbum" → direkte citater (høj vægt)
  const sentences = msg.split(/[.!?;]/).filter(s => s.trim().length > 15)
  for (const sentence of sentences) {
    const trimmed = sentence.trim()
    if (/\b(jeg|vi)\s+(tror|mener|oplever|føler|ser|tænker|har|synes|vil|ønsker|prøver)\b/.test(trimmed)) {
      keywords.push({
        keyword: trimmed.slice(0, 100),
        category: 'citat',
        weight: 0.9
      })
    }
  }

  // 2. N-gram extraction fra indholdsbærende ord
  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/)
    const contentWords = words.filter(w => !STOPORD.has(w) && w.length > 2)

    for (let i = 0; i < contentWords.length; i++) {
      // Bigrammer
      if (contentWords[i + 1]) {
        const bigram = `${contentWords[i]} ${contentWords[i + 1]}`
        let category = 'auto'
        let weight = 0.5

        for (const [cat, pattern] of Object.entries(CATEGORY_PATTERNS)) {
          if (pattern.test(bigram)) {
            category = cat
            weight = 0.7
            break
          }
        }
        keywords.push({ keyword: bigram, category, weight })
      }

      // Trigrammer
      if (contentWords[i + 1] && contentWords[i + 2]) {
        const trigram = `${contentWords[i]} ${contentWords[i + 1]} ${contentWords[i + 2]}`
        for (const [cat, pattern] of Object.entries(CATEGORY_PATTERNS)) {
          if (pattern.test(trigram)) {
            keywords.push({ keyword: trigram, category: cat, weight: 0.75 })
            break
          }
        }
      }
    }
  }

  return deduplicateKeywords(keywords).slice(0, 10)
}

export function classifyThemesRule(userMessage) {
  const msg = userMessage.toLowerCase()
  const results = []

  for (const [theme, config] of Object.entries(THEME_TAXONOMY)) {
    let score = 0

    if (config.patterns.test(msg)) score += 0.5

    const relatedHits = config.related.filter(word => msg.includes(word))
    score += relatedHits.length * 0.15

    score = Math.min(1.0, score)

    if (score >= 0.3) {
      const sentences = msg.split(/[.!?]/).filter(s => s.length > 10)
      const evidence = sentences.find(s =>
        config.patterns.test(s) || config.related.some(w => s.includes(w))
      ) || ''

      results.push({
        theme,
        score: Math.round(score * 100) / 100,
        evidence: evidence.trim().slice(0, 150)
      })
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 4)
}

export function extractInsightsRule(userMessage) {
  const insights = userMessage
    .split(/[.!?]/)
    .filter(s => /\b(jeg|vi)\s+(har|ser|oplever|tror|mener|vil|indser|erkender)\b/i.test(s))
    .map(s => s.trim().slice(0, 120))
    .filter(s => s.length > 15)
    .slice(0, 3)

  return { insights, carry_forward: insights.slice(0, 2) }
}

// ══════════════════════════════════════════════════════════════
// FASE 2: AI-beriget extraction
// ══════════════════════════════════════════════════════════════

export async function extractKeywordsAI(env, userMessage) {
  const raw = await runExtractionAI(env,
    `Du er en dansk tekst-analysator. Udtræk nøgleord fra brugerens besked.
Returner KUN et JSON-array, intet andet tekst.
Format: [{"keyword": "...", "category": "tema|problem|maal|handling|person|struktur", "weight": 0.0-1.0}]
Fokusér på brugerens EGNE formuleringer, ikke generiske termer.
Max 5 nøgleord. Svar KUN med JSON-array.`,
    userMessage
  )

  return safeParseJSON(raw, [])
}

export async function extractInsightsAI(env, userMessage, trin) {
  const trinNavn = trin >= 1 && trin <= 6 ? TRIN_NAVNE[trin - 1] : ''
  const raw = await runExtractionAI(env,
    `Du er en dansk refleksionsanalytiker.
Udtræk 1-3 centrale erkendelser fra beskeden i konteksten af Tirsdag kl. 10-modellen®, Trin ${trin} (${trinNavn}).
Returner KUN JSON, intet andet tekst.
Format: {"insights": ["erkendelse 1", "..."], "carry_forward": ["vigtig info til næste trin", "..."]}
Svar KUN med JSON.`,
    userMessage
  )

  return safeParseJSON(raw, { insights: [], carry_forward: [] })
}

// ══════════════════════════════════════════════════════════════
// Fuld pipeline: regel + AI hybrid (D1-version)
// ══════════════════════════════════════════════════════════════

export async function runExtractionPipeline(env, db, sessionId, forloebId, userMessage, trin, rolle) {
  // FASE 1: Regelbaseret (altid)
  const ruleKeywords = extractKeywordsRule(userMessage)
  const ruleThemes = classifyThemesRule(userMessage)
  const ruleInsights = extractInsightsRule(userMessage)

  // Persist regel-keywords
  if (ruleKeywords.length > 0) {
    await insertKeywords(db,
      ruleKeywords.map(k => ({
        session_id: sessionId,
        keyword: k.keyword,
        category: k.category,
        weight: k.weight,
        trin
      }))
    )
  }

  // Persist regel-themes
  if (ruleThemes.length > 0) {
    for (const t of ruleThemes) {
      await upsertTheme(db, {
        session_id: sessionId,
        forloeb_id: forloebId,
        theme: t.theme,
        score: t.score,
        evidence: [t.evidence],
        trin
      })
    }
  }

  // Beregn depth score
  const msgCount = await countMessages(db, sessionId)
  const depthScore = Math.min(1.0, (msgCount / 2) * 0.15)

  // FASE 2: AI-beriget
  let insights = ruleInsights
  try {
    const [aiKeywords, aiInsights] = await Promise.all([
      extractKeywordsAI(env, userMessage),
      trin ? extractInsightsAI(env, userMessage, trin) : Promise.resolve(null)
    ])

    // Merge AI-keywords
    if (aiKeywords.length > 0) {
      const existingTexts = new Set(ruleKeywords.map(k => k.keyword.toLowerCase()))
      const newAI = aiKeywords.filter(k => !existingTexts.has(k.keyword?.toLowerCase()))
      if (newAI.length > 0) {
        await insertKeywords(db,
          newAI.map(k => ({
            session_id: sessionId,
            keyword: k.keyword,
            category: k.category || 'ai',
            weight: k.weight || 0.6,
            trin
          }))
        )
      }
    }

    if (aiInsights) insights = aiInsights
  } catch (e) {
    console.log('AI extraction skipped:', e.message)
  }

  // Upsert progress snapshot
  if (trin && rolle) {
    const existing = await db.prepare(
      'SELECT key_insights FROM progress_snapshots WHERE forloeb_id = ? AND rolle = ? AND trin = ?'
    ).bind(forloebId, rolle, trin).first()

    const existingInsights = existing ? safeParseJSON(existing.key_insights, []) : []

    const allInsights = [
      ...existingInsights,
      ...(insights.insights || [])
    ].slice(-10)

    await upsertProgressSnapshot(db, {
      forloeb_id: forloebId,
      rolle,
      trin,
      status: depthScore >= 0.45 ? 'i-gang' : 'ikke-startet',
      depth_score: depthScore,
      key_insights: allInsights,
      carry_forward: insights.carry_forward || []
    })

    // ── Auto-promote: Gem gode erkendelser i shared_knowledge ──
    if (depthScore >= 0.45 && allInsights.length >= 2) {
      const topTheme = ruleThemes[0]?.theme || 'generelt'
      await autoPromoteInsights(db, {
        insights: allInsights,
        tema: topTheme,
        trin,
        rolle,
        userMessage
      })
    }
  }
}

// ══════════════════════════════════════════════════════════════
// Auto-promote: Promovér gode erkendelser til shared_knowledge
// Kører automatisk når dybde-score er høj nok
// ══════════════════════════════════════════════════════════════

async function autoPromoteInsights(db, { insights, tema, trin, rolle, userMessage }) {
  try {
    const toPromote = []

    for (const insight of insights) {
      // Spring korte/generiske erkendelser over
      if (!insight || insight.length < 25) continue

      // Deduplikér: Tjek om lignende indhold allerede findes
      const searchTerm = insight.split(/\s+/).slice(0, 5).join(' ')
      const existing = await searchSharedKnowledge(db, searchTerm, 1)
      if (existing.length > 0) {
        // Tjek for næsten-duplikat (>60% ord overlap)
        const existingWords = new Set(existing[0].indhold.toLowerCase().split(/\s+/))
        const newWords = insight.toLowerCase().split(/\s+/)
        const overlap = newWords.filter(w => existingWords.has(w)).length / newWords.length
        if (overlap > 0.6) continue
      }

      toPromote.push({
        tema,
        trin,
        rolle,
        type: 'indsigt',
        indhold: insight.slice(0, 300),
        kontekst: userMessage ? userMessage.slice(0, 200) : '',
        kilde: 'auto-harvest',
        kvalitet: 0.75
      })
    }

    if (toPromote.length > 0) {
      await insertSharedKnowledge(db, toPromote.slice(0, 3)) // Max 3 per samtale
      console.log(`Auto-promote: ${toPromote.length} erkendelser → shared_knowledge (tema: ${tema})`)
    }
  } catch (e) {
    console.error('Auto-promote fejl:', e.message)
  }
}

// ── Helpers ───────────────────────────────────────────────────

function deduplicateKeywords(keywords) {
  const seen = new Set()
  return keywords.filter(k => {
    const key = k.keyword.toLowerCase().trim()
    if (seen.has(key) || key.length < 4) return false
    seen.add(key)
    return true
  })
}

function safeParseJSON(raw, fallback) {
  try {
    const match = raw.match(/[\[{][\s\S]*[\]}]/)
    if (match) return JSON.parse(match[0])
    return fallback
  } catch {
    return fallback
  }
}
