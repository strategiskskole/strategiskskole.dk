// ============================================================
// AI Engine Worker — Strategiskskole.dk
// Fælles AI-backend for hjemmeside, app og digitalt forløb
// Version: 1.0  |  April 2026
// Pris: 0 kr./md — Cloudflare Workers AI + D1 (gratis)
// ============================================================

import { handleChat } from './handlers/chat.js'
import { handleCreateSession, handleGetSession } from './handlers/session.js'
import { handleGetProgress } from './handlers/progress.js'
import { handleScheduled } from './handlers/scheduled.js'

// ── CORS ──────────────────────────────────────────────────────

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
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin, env),
    }
  })
}

// ── Rate Limiting (KV-baseret) ────────────────────────────────

async function checkRateLimit(env, key, maxPerMinute = 30) {
  if (!env.CACHE) return true
  const kvKey = `rl:${key}`
  const current = parseInt(await env.CACHE.get(kvKey) || '0')
  if (current >= maxPerMinute) return false
  await env.CACHE.put(kvKey, String(current + 1), { expirationTtl: 60 })
  return true
}

// ── Routing ───────────────────────────────────────────────────

export default {
  // ── Nightly cron job (kl. 02:00 UTC) ─────────────────────────
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleScheduled(env))
  },

  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || ''
    const url = new URL(request.url)
    const path = url.pathname

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin, env) })
    }

    // Health check
    if (path === '/api/health' && request.method === 'GET') {
      return jsonResponse({
        status: 'ok',
        version: '1.0',
        ai: 'workers-ai',
        db: 'd1'
      }, 200, origin, env)
    }

    // D1 database via env.DB binding
    const db = env.DB

    // ── POST /api/chat ────────────────────────────────────────
    if (path === '/api/chat' && request.method === 'POST') {
      let body
      try {
        body = await request.json()
      } catch {
        return jsonResponse({ error: 'Ugyldigt JSON' }, 400, origin, env)
      }

      const rlKey = body.session_id || request.headers.get('CF-Connecting-IP') || 'unknown'
      if (!await checkRateLimit(env, rlKey)) {
        return jsonResponse({ error: 'For mange forespørgsler. Vent et øjeblik.' }, 429, origin, env)
      }

      const cleanMessage = (body.message || '').replace(/<[^>]*>/g, '').trim()
      body.message = cleanMessage

      const result = await handleChat(body, env, ctx)
      return jsonResponse(result.data || { error: result.error }, result.status, origin, env)
    }

    // ── POST /api/session ─────────────────────────────────────
    if (path === '/api/session' && request.method === 'POST') {
      let body
      try {
        body = await request.json()
      } catch {
        return jsonResponse({ error: 'Ugyldigt JSON' }, 400, origin, env)
      }

      const result = await handleCreateSession(body, db)
      return jsonResponse(result.data || { error: result.error }, result.status, origin, env)
    }

    // ── GET /api/session/:id ──────────────────────────────────
    if (path.startsWith('/api/session/') && request.method === 'GET') {
      const sessionId = path.split('/api/session/')[1]
      const result = await handleGetSession(sessionId, db)
      return jsonResponse(result.data || { error: result.error }, result.status, origin, env)
    }

    // ── GET /api/progress/:forloeb_id ─────────────────────────
    if (path.startsWith('/api/progress/') && request.method === 'GET') {
      const forloebId = path.split('/api/progress/')[1]
      const result = await handleGetProgress(forloebId, db)
      return jsonResponse(result.data || { error: result.error }, result.status, origin, env)
    }

    // ── Bagudkompatibel: POST / (gammel chatbot-format) ───────
    if (path === '/' && request.method === 'POST') {
      let body
      try {
        body = await request.json()
      } catch {
        return jsonResponse({ error: 'Ugyldigt JSON' }, 400, origin, env)
      }

      const rlKey = request.headers.get('CF-Connecting-IP') || 'unknown'
      if (!await checkRateLimit(env, rlKey)) {
        return jsonResponse({ error: 'For mange forespørgsler. Vent et øjeblik.' }, 429, origin, env)
      }

      // Konvertér gammelt format til nyt
      const chatBody = {
        message: (body.message || body.question || '').replace(/<[^>]*>/g, '').trim(),
        source: 'website',
        session_id: body.session_id || null,
        forloeb_id: body.forloeb_id || null,
      }

      const result = await handleChat(chatBody, env, ctx)

      // Returner i gammelt format (answer i stedet for reply)
      if (result.data) {
        return jsonResponse({
          answer: result.data.reply,
          session_id: result.data.session_id
        }, 200, origin, env)
      }
      return jsonResponse({ error: result.error }, result.status, origin, env)
    }

    // ── 404 ───────────────────────────────────────────────────
    return jsonResponse({ error: 'Ikke fundet' }, 404, origin, env)
  }
}
