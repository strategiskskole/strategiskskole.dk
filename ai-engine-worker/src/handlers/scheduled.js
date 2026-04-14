// ============================================================
// Scheduled Handler — Nightly promotion job
// Kører hver nat kl. 02:00 UTC via Cloudflare Cron Trigger
// Promoverer gode erkendelser fra progress_snapshots → shared_knowledge
// Rydder op i lav-kvalitet shared_knowledge
// ============================================================

import { searchSharedKnowledge, insertSharedKnowledge } from '../data/db.js'

export async function handleScheduled(env) {
  const db = env.DB
  const stats = { promoted: 0, cleaned: 0, deduplicated: 0 }

  // ── FASE 1: Promovér gode erkendelser fra progress_snapshots ──
  try {
    // Find snapshots med høj dybde og erkendelser fra de seneste 7 dage
    const { results: snapshots } = await db.prepare(
      `SELECT forloeb_id, rolle, trin, depth_score, key_insights, carry_forward
       FROM progress_snapshots
       WHERE depth_score >= 0.45
         AND key_insights IS NOT NULL
         AND key_insights != '[]'
         AND updated_at >= datetime('now', '-7 days')
       ORDER BY depth_score DESC
       LIMIT 50`
    ).all()

    for (const snapshot of (snapshots || [])) {
      const insights = safeJSON(snapshot.key_insights, [])
      if (insights.length < 2) continue

      for (const insight of insights) {
        if (!insight || insight.length < 25) continue

        // Deduplikér: Tjek om lignende indhold allerede findes
        const searchTerm = insight.split(/\s+/).slice(0, 5).join(' ')
        const existing = await searchSharedKnowledge(db, searchTerm, 1)

        if (existing.length > 0) {
          const existingWords = new Set(existing[0].indhold.toLowerCase().split(/\s+/))
          const newWords = insight.toLowerCase().split(/\s+/)
          const overlap = newWords.filter(w => existingWords.has(w)).length / newWords.length
          if (overlap > 0.5) continue
        }

        await insertSharedKnowledge(db, [{
          tema: 'generelt',
          trin: snapshot.trin,
          rolle: snapshot.rolle,
          type: 'indsigt',
          indhold: insight.slice(0, 300),
          kontekst: `Promoveret fra forløb (dybde: ${snapshot.depth_score})`,
          kilde: 'nightly-promote',
          kvalitet: 0.8
        }])
        stats.promoted++
      }
    }
  } catch (e) {
    console.error('Nightly promote fejl:', e.message)
  }

  // ── FASE 2: Ryd op i lav-kvalitet entries ─────────────────────
  try {
    // Slet entries med meget lav kvalitet der aldrig er brugt
    const { meta } = await db.prepare(
      `DELETE FROM shared_knowledge
       WHERE kvalitet < 0.5
         AND brugt_antal = 0
         AND created_at < datetime('now', '-14 days')`
    ).run()
    stats.cleaned = meta?.changes || 0
  } catch (e) {
    console.error('Nightly cleanup fejl:', e.message)
  }

  // ── FASE 3: Deduplikér shared_knowledge ───────────────────────
  try {
    // Find og fjern eksakte duplikater (behold den med højest kvalitet)
    const { meta } = await db.prepare(
      `DELETE FROM shared_knowledge
       WHERE id NOT IN (
         SELECT MIN(id) FROM shared_knowledge
         GROUP BY indhold
       )`
    ).run()
    stats.deduplicated = meta?.changes || 0
  } catch (e) {
    console.error('Nightly dedup fejl:', e.message)
  }

  // ── Statistik ─────────────────────────────────────────────────
  const { results: countResult } = await db.prepare(
    'SELECT COUNT(*) as cnt FROM shared_knowledge'
  ).all()
  const total = countResult?.[0]?.cnt || 0

  console.log(`Nightly job færdig: +${stats.promoted} promoted, -${stats.cleaned} cleaned, -${stats.deduplicated} deduped. Total: ${total}`)

  return stats
}

function safeJSON(str, fallback) {
  try {
    return typeof str === 'string' ? JSON.parse(str) : (str || fallback)
  } catch {
    return fallback
  }
}
