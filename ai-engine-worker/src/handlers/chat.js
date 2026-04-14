// ============================================================
// ChatHandler — hovedflow for AI-samtale
// Bruges af alle tre klienter: website, app, forloeb
// D1-version (Cloudflare D1 / SQLite)
// ============================================================

import { buildSystemPrompt } from '../ai/prompt-builder.js'
import { runAI } from '../ai/workers-ai.js'
import { runExtractionPipeline } from '../ai/extraction.js'
import { getFallbackResponse } from '../ai/fallback.js'
import { THEME_TAXONOMY } from '../data/model.js'
import {
  getSession, createSession, updateSessionMessageCount,
  getMessages, insertMessages,
  getPriorInsights, getThemes, getKeywords,
  getSharedKnowledge, searchSharedKnowledge,
  insertSharedKnowledge
} from '../data/db.js'

// ── Tema-extraction fra brugerens besked ──────────────────────
function extractTema(message) {
  if (!message) return null
  const msg = message.toLowerCase()
  let best = null
  let bestScore = 0

  for (const [theme, config] of Object.entries(THEME_TAXONOMY)) {
    let score = 0
    if (config.patterns.test(msg)) score += 0.5
    const hits = config.related.filter(word => msg.includes(word))
    score += hits.length * 0.15
    if (score > bestScore) {
      bestScore = score
      best = theme
    }
  }
  return bestScore >= 0.3 ? best : null
}

export async function handleChat(body, env, ctx) {
  const db = env.DB
  const { session_id, message, source } = body

  // ── Validering ──────────────────────────────────────────────
  if (!message?.trim()) {
    return { error: 'Tomt spørgsmål', status: 400 }
  }

  if (message.length > 2000) {
    return { error: 'Beskeden er for lang (max 2000 tegn)', status: 400 }
  }

  // ── Hent eller opret session ────────────────────────────────
  let session
  if (session_id) {
    session = await getSession(db, session_id)
    if (!session) {
      return { error: 'Session ikke fundet', status: 404 }
    }
  } else {
    // Brug forloeb_id fra request body hvis tilgængeligt (delt på tværs af kort)
    session = await createSession({
      db,
      forloeb_id: body.forloeb_id || 'website-default',
      source: source || 'website',
      rolle: body.rolle || null,
      trin: body.trin || null,
      mode: body.mode || null
    })
  }

  const rolle = session.rolle || body.rolle
  const trin = session.trin || body.trin
  const mode = session.mode || body.mode
  const src = source || session.source || 'website'
  const forloebId = body.forloeb_id || session.forloeb_id

  // ── Hent samtalehistorik ────────────────────────────────────
  const history = await getMessages(db, session.id, 16)

  // ── Hent carry-forward fra tidligere trin ────────────────────
  let priorInsights = []
  if (trin && forloebId && forloebId !== 'website-default') {
    priorInsights = await getPriorInsights(db, forloebId, rolle || 'skoleleder', trin)
  }

  // ── Hent temaer ─────────────────────────────────────────────
  let themes = []
  if (forloebId && forloebId !== 'website-default') {
    themes = await getThemes(db, forloebId, 0.3, 8)
  }

  // ── Hent nøgleord ───────────────────────────────────────────
  const keywords = await getKeywords(db, session.id, 15)

  // ── Hent delt viden (med tema-extraction) ───────────────────
  let sharedKnowledge = []
  try {
    // Udtræk tema fra brugerens besked
    const tema = extractTema(message)

    // Hent viden relevant for aktuelt trin, rolle og tema
    sharedKnowledge = await getSharedKnowledge(db, { tema, trin, rolle, limit: 5 })

    // Website-chatbot: Hent også website-indhold (bredere søgning)
    if (src === 'website') {
      const searchWords = message.split(/\s+/).filter(w => w.length > 3).slice(0, 8).join(' ')
      const websiteKnowledge = await searchSharedKnowledge(db, searchWords, 5)
      const existingIds = new Set(sharedKnowledge.map(k => k.indhold))
      for (const w of websiteKnowledge) {
        if (!existingIds.has(w.indhold)) sharedKnowledge.push(w)
      }
    }

    // Supplér med tekstsøgning baseret på brugerens besked
    if (sharedKnowledge.length < 3) {
      const searchWords = message.split(/\s+/).filter(w => w.length > 3).slice(0, 6).join(' ')
      const extra = await searchSharedKnowledge(db, searchWords, 3)
      const existingIds = new Set(sharedKnowledge.map(k => k.indhold))
      for (const e of extra) {
        if (!existingIds.has(e.indhold)) sharedKnowledge.push(e)
      }
    }
  } catch (e) {
    // Shared knowledge er optional — fejl stopper ikke samtalen
    console.error('Shared knowledge fejl:', e.message)
  }

  // ── Byg system prompt ───────────────────────────────────────
  const systemPrompt = buildSystemPrompt({
    source: src,
    rolle,
    trin,
    mode,
    priorInsights,
    themes,
    keywords,
    kort: body.kort || null,
    kort_type: body.kort_type || null,
    sharedKnowledge,
    messageCount: history.length
  })

  // ── Kald Workers AI (med fallback) ──────────────────────────
  let reply
  let isFallback = false

  try {
    reply = await runAI(env, {
      systemPrompt,
      messages: [
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: message }
      ],
      source: src
    })

    if (!reply || reply.trim().length < 10) {
      throw new Error('Tom AI-response')
    }
  } catch (e) {
    console.error('Workers AI fejl:', e.message)
    reply = getFallbackResponse(trin, mode, history.length)
    isFallback = true
  }

  // ── Persist beskeder ────────────────────────────────────────
  await insertMessages(db, [
    { session_id: session.id, role: 'user', content: message },
    { session_id: session.id, role: 'assistant', content: reply }
  ])

  // Opdater message_count
  await updateSessionMessageCount(db, session.id, history.length + 2)

  // ── Kør extraction pipeline (SYNKRONT for carry-forward) ────
  if (forloebId !== 'website-default') {
    try {
      await runExtractionPipeline(
        env, db, session.id, forloebId,
        message, trin, rolle
      )
    } catch (e) {
      console.error('Extraction fejl:', e.message)
    }
  }

  // ── Auto-promote gode AI-svar (dybe samtaler) ──────────────
  if (!isFallback && history.length >= 6 && reply.length >= 80 && reply.length <= 400 && forloebId !== 'website-default') {
    try {
      const tema = extractTema(message) || 'generelt'
      const searchTerm = reply.split(/\s+/).slice(0, 5).join(' ')
      const existing = await searchSharedKnowledge(db, searchTerm, 1)
      if (existing.length === 0) {
        await insertSharedKnowledge(db, [{
          tema,
          trin,
          rolle,
          type: 'godt_svar',
          indhold: reply.slice(0, 400),
          kontekst: message.slice(0, 200),
          kilde: 'auto-harvest',
          kvalitet: 0.8
        }])
      }
    } catch (e) {
      // Auto-promote er optional — fejl stopper ikke samtalen
    }
  }

  // ── Response ────────────────────────────────────────────────
  const response = {
    reply,
    session_id: session.id,
  }

  // Tilføj ekstra data baseret på kilde
  if (src === 'app' && keywords.length > 0) {
    response.keywords = keywords.slice(0, 5).map(k => k.keyword)
  }
  if (src === 'forloeb' && themes.length > 0) {
    response.theme_hint = themes[0].theme
  }
  if (isFallback) {
    response.fallback = true
  }

  return { data: response, status: 200 }
}
