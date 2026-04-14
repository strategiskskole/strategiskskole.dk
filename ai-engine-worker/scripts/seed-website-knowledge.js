#!/usr/bin/env node
// ============================================================
// Seed Website Knowledge — Scraper alt indhold fra website-sider
// og indsætter som shared_knowledge med type 'website'
// Brug: node scripts/seed-website-knowledge.js
// ============================================================

import { execSync } from 'child_process'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const DB_NAME = 'strategiskskole-ai'
// Repo root: gå op fra ai-engine-worker/ i worktree til hovedrepoet
const WEBSITE_DIR = 'C:/Users/ThomasKjerstein/Documents/Claude/Projects/Strategiskskole.dk'

function d1Execute(sql) {
  const oneLine = sql.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
  try {
    execSync(
      `npx wrangler d1 execute ${DB_NAME} --remote --command="${oneLine.replace(/"/g, '\\"')}"`,
      { encoding: 'utf-8', timeout: 30000, stdio: ['pipe', 'pipe', 'pipe'] }
    )
    return true
  } catch (e) {
    console.error('  ✗ Insert fejl:', e.message?.substring(0, 80))
    return false
  }
}

function d1Query(sql) {
  const oneLine = sql.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
  try {
    const result = execSync(
      `npx wrangler d1 execute ${DB_NAME} --remote --json --command="${oneLine.replace(/"/g, '\\"')}"`,
      { encoding: 'utf-8', timeout: 30000, stdio: ['pipe', 'pipe', 'pipe'] }
    )
    const parsed = JSON.parse(result)
    return parsed[0]?.results || []
  } catch (e) {
    return []
  }
}

function escapeSql(str) {
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\')
}

// Udtræk synligt tekstindhold fra HTML (strip tags, scripts, styles)
function extractText(html) {
  return html
    // Fjern script, style, nav, footer, head
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    // Fjern HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Dekod HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/®/g, '®')
    // Fjern overflødig whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

// Udtræk titel fra HTML
function extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (match) return match[1].replace(/\s*[|–—]\s*Strategiskskole\.dk/i, '').trim()
  const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
  if (h1) return h1[1].trim()
  return null
}

// Udtræk meta description
function extractDescription(html) {
  const match = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
  return match ? match[1].trim() : null
}

// Kategorisér side baseret på filnavn og indhold
function categorize(filename, text) {
  const f = filename.toLowerCase()
  const t = text.toLowerCase()
  if (f.includes('tirsdag-kl10') || f.includes('tk10')) return 'tirsdag_kl10'
  if (f.includes('lp-') || f.includes('landing')) return 'ydelse'
  if (f.includes('forandring')) return 'forandringsledelse'
  if (f.includes('ny-leder') || f.includes('skoleleder')) return 'ny_leder'
  if (f.includes('governance') || f.includes('bestyrelse')) return 'governance'
  if (f.includes('moede') || f.includes('koordin')) return 'moedekultur'
  if (f.includes('ydelser')) return 'ydelser'
  if (f.includes('kontakt')) return 'kontakt'
  if (f.includes('om-os')) return 'om_os'
  if (f.includes('arbejdsmilj')) return 'trivsel'
  if (f.includes('strategi')) return 'strategisk_retning'
  if (t.includes('inklusion')) return 'inklusion'
  if (t.includes('rekrutter')) return 'rekruttering'
  return 'generelt'
}

async function main() {
  console.log('=== Seed Website Knowledge ===\n')

  // Ryd gamle website-entries
  console.log('Rydder gamle website-entries...')
  d1Execute(`DELETE FROM shared_knowledge WHERE kilde = 'website'`)

  // Find alle HTML-filer i repo root
  const files = readdirSync(WEBSITE_DIR).filter(f => f.endsWith('.html') && !f.startsWith('.'))

  console.log(`Fundet ${files.length} HTML-filer\n`)

  let inserted = 0
  const skipFiles = ['tak.html', 'strategiskskole-app-review.html', 'Tirsdag kl. 10-appen.html']

  for (const file of files) {
    if (skipFiles.includes(file)) continue

    let html
    try {
      html = readFileSync(join(WEBSITE_DIR, file), 'utf-8')
    } catch {
      console.log(`  ✗ Kan ikke læse ${file}`)
      continue
    }

    const title = extractTitle(html) || file.replace('.html', '')
    const description = extractDescription(html)
    const text = extractText(html)
    const tema = categorize(file, text)
    const slug = file.replace('.html', '')
    const url = `https://strategiskskole.dk/${slug === 'index' ? '' : slug + '.html'}`

    // Split i chunks af max 400 tegn (for shared_knowledge)
    const chunks = []

    // Chunk 1: Side-oversigt (titel + beskrivelse)
    if (description) {
      chunks.push(`Side: ${title}. ${description}`)
    }

    // Chunk 2-N: Indhold i bidder
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.length > 20)
    let current = ''
    for (const sentence of sentences) {
      if (current.length + sentence.length > 350) {
        if (current.length > 30) chunks.push(current.trim())
        current = sentence
      } else {
        current += ' ' + sentence
      }
    }
    if (current.length > 30) chunks.push(current.trim())

    // Begræns til max 5 chunks per side
    const topChunks = chunks.slice(0, 5)

    console.log(`${file}: ${topChunks.length} chunks (tema: ${tema})`)

    for (const chunk of topChunks) {
      const safe = escapeSql(chunk.substring(0, 400))
      const safeTitle = escapeSql(title)
      const ok = d1Execute(
        `INSERT INTO shared_knowledge (id, tema, type, indhold, kontekst, kilde, kvalitet) VALUES (lower(hex(randomblob(16))), '${tema}', 'website', '${safe}', 'Fra ${safeTitle} (${url})', 'website', 0.9)`
      )
      if (ok) inserted++
    }
  }

  console.log(`\n=== Færdig ===`)
  console.log(`Indsat: ${inserted} website-chunks i shared_knowledge`)

  const count = d1Query(`SELECT COUNT(*) as cnt FROM shared_knowledge`)
  console.log(`Total i shared_knowledge: ${count[0]?.cnt || 0}`)
}

main().catch(console.error)
