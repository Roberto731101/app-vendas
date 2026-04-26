/**
 * importar-geojson.ts
 *
 * Importa quadras.geojson e linhas_producao.geojson da Fazenda São Jorge
 * para o Supabase:
 *   1. Atualiza setores.poligono com a geometria de cada quadra
 *   2. Insere linhas_producao agrupadas por setor via intersecção espacial
 *
 * Pré-requisito:
 *   - migration-avaliacao.sql já executado no Supabase
 *   - npx tsx scripts/importar-geojson.ts
 */

import fs from 'fs'
import path from 'path'

// ── Config ───────────────────────────────────────────────────────────────────

const SUPABASE_URL   = process.env.NEXT_PUBLIC_SUPABASE_URL   ?? 'https://qpmqagpamycqoxuwptqp.supabase.co'
const SUPABASE_KEY   = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_MNl9bsO3-I06pw-k0tfBNQ_EzYe7rcT'
const GEOJSON_DIR    = 'C:/Projetos/FazendaSaoJorge'
const QUADRAS_FILE   = path.join(GEOJSON_DIR, 'quadras.geojson')
const LINHAS_FILE    = path.join(GEOJSON_DIR, 'linhas_producao.geojson')

// ── Tipos GeoJSON mínimos ────────────────────────────────────────────────────

type Coord2D  = [number, number]
type Ring     = Coord2D[]

interface GeoPolygon  { type: 'Polygon';    coordinates: Ring[] }
interface GeoLine     { type: 'LineString'; coordinates: Coord2D[] }

interface QuadraProps { fid: number; nome: string }
interface QuadraFeature {
  type: 'Feature'
  properties: QuadraProps
  geometry: GeoPolygon
}

interface LinhaFeature {
  type: 'Feature'
  properties: Record<string, unknown>
  geometry: GeoLine
}

interface FeatureCollection<F> {
  type: 'FeatureCollection'
  features: F[]
}

// ── Tipo Supabase setor ──────────────────────────────────────────────────────

interface Setor {
  id: number
  nome: string
}

// ── Helpers espaciais (ray-casting, CRS invariante) ──────────────────────────

function pointInPolygon(pt: Coord2D, ring: Ring): boolean {
  const [px, py] = pt
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

function lineMidpoint(coords: Coord2D[]): Coord2D {
  const mid = Math.floor(coords.length / 2)
  return coords[mid]
}

function findQuadraForLine(line: GeoLine, quadras: QuadraFeature[]): QuadraFeature | null {
  const mid = lineMidpoint(line.coordinates)
  for (const q of quadras) {
    const outerRing = q.geometry.coordinates[0]
    if (pointInPolygon(mid, outerRing)) return q
  }
  // fallback: try first and last point
  for (const pt of [line.coordinates[0], line.coordinates[line.coordinates.length - 1]]) {
    for (const q of quadras) {
      if (pointInPolygon(pt, q.geometry.coordinates[0])) return q
    }
  }
  return null
}

// ── REST helpers ─────────────────────────────────────────────────────────────

async function supabaseGet<T>(path: string): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${await res.text()}`)
  return res.json()
}

async function supabasePatch(tablePath: string, body: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${tablePath}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`PATCH ${tablePath} → ${res.status} ${await res.text()}`)
}

async function supabasePost(table: string, rows: Record<string, unknown>[]): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(rows),
  })
  if (!res.ok) throw new Error(`POST ${table} → ${res.status} ${await res.text()}`)
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Importação GeoJSON → Supabase ===\n')

  // 1. Ler GeoJSONs
  const quadrasGeo: FeatureCollection<QuadraFeature> = JSON.parse(
    fs.readFileSync(QUADRAS_FILE, 'utf8')
  )
  const linhasGeo: FeatureCollection<LinhaFeature> = JSON.parse(
    fs.readFileSync(LINHAS_FILE, 'utf8')
  )
  console.log(`Quadras GeoJSON: ${quadrasGeo.features.length} features`)
  console.log(`Linhas GeoJSON:  ${linhasGeo.features.length} features\n`)

  // 2. Buscar setores no Supabase
  const setores = await supabaseGet<Setor>('setores?select=id,nome&nome=like.Quadra*')
  console.log(`Setores encontrados no Supabase: ${setores.length}`)

  // Mapa nome → setor
  const setorByNome = new Map<string, Setor>(setores.map((s) => [s.nome, s]))

  // 3. Atualizar poligono dos setores e montar mapa quadraNome → setorId
  const quadraSetorMap = new Map<string, number>() // nomequadra → setor_id

  console.log('\n--- Atualizando polígonos dos setores ---')
  for (const feat of quadrasGeo.features) {
    const nomequadra = feat.properties.nome   // ex: "Quadra A"
    const setor = setorByNome.get(nomequadra)

    if (!setor) {
      console.warn(`  ⚠  Sem setor para "${nomequadra}" — pulando`)
      continue
    }

    await supabasePatch(`setores?id=eq.${setor.id}`, {
      poligono: feat.geometry,
    })
    quadraSetorMap.set(nomequadra, setor.id)
    console.log(`  ✓  ${nomequadra} → setor id=${setor.id}`)
  }

  // 4. Classificar cada linha no setor correto
  console.log('\n--- Classificando linhas por setor ---')

  const linhasPorSetor = new Map<number, LinhaFeature[]>()

  let semQuadra = 0
  for (const linha of linhasGeo.features) {
    const quadra = findQuadraForLine(linha.geometry, quadrasGeo.features)
    if (!quadra) {
      semQuadra++
      continue
    }
    const setorId = quadraSetorMap.get(quadra.properties.nome)
    if (!setorId) { semQuadra++; continue }

    const arr = linhasPorSetor.get(setorId) ?? []
    arr.push(linha)
    linhasPorSetor.set(setorId, arr)
  }

  console.log(`  Linhas sem quadra correspondente: ${semQuadra}`)
  for (const [setorId, linhas] of linhasPorSetor) {
    const nomeSetor = setores.find((s) => s.id === setorId)?.nome ?? `id=${setorId}`
    console.log(`  ${nomeSetor}: ${linhas.length} linhas`)
  }

  // 5. Inserir linhas_producao
  console.log('\n--- Inserindo linhas_producao ---')

  // Limpar inserções anteriores para idempotência
  const existentes = await supabaseGet<{ codigo: string }>('linhas_producao?select=codigo')
  const codigosExistentes = new Set(existentes.map((r) => r.codigo))

  let inseridas = 0
  let puladas   = 0

  for (const [setorId, linhas] of linhasPorSetor) {
    const nomeSetor = setores.find((s) => s.id === setorId)?.nome ?? `Setor${setorId}`
    const rows: Record<string, unknown>[] = []

    linhas.forEach((linha, idx) => {
      const numero = idx + 1
      const codigo = `${nomeSetor}/${numero}`

      if (codigosExistentes.has(codigo)) { puladas++; return }

      rows.push({
        setor_id: setorId,
        numero,
        codigo,
        geojson: linha.geometry,
      })
    })

    if (rows.length === 0) continue

    // Inserir em lotes de 100
    for (let i = 0; i < rows.length; i += 100) {
      await supabasePost('linhas_producao', rows.slice(i, i + 100))
    }
    inseridas += rows.length
  }

  console.log(`\n✅ Concluído: ${inseridas} linhas inseridas, ${puladas} puladas (já existiam)`)
}

main().catch((err) => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
