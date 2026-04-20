'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { StatusCota } from './useCotasArea'

export type StatusSaude = 'excelente' | 'estavel' | 'critico'

export type PontoGeo = { lat: number; lng: number }

export type AreaGeo = {
  id: number
  fazenda_id: number
  numero: string
  nome: string
  descricao: string | null
  lat: number | null
  lng: number | null
  poligono: PontoGeo[] | null
  hect: number | null
  fazenda_nome: string
  fazenda_lat: number | null
  fazenda_lng: number | null
  status_saude: StatusSaude
  total_cotas: number
  alertas: number
  criticos: number
}

function calcularSaude(alertas: number, criticos: number): StatusSaude {
  if (criticos > 0)  return 'critico'
  if (alertas > 0)   return 'estavel'
  return 'excelente'
}

export function useGestaoAreas(safraId?: number) {
  const [areas, setAreas]           = useState<AreaGeo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro]             = useState<string | null>(null)

  async function carregar() {
    setCarregando(true)
    setErro(null)

    const { data, error } = await supabase
      .from('areas')
      .select(`*, fazendas (nome, lat, lng)`)
      .order('nome', { ascending: true })

    if (error) { setErro(error.message); setCarregando(false); return }

    const rows = (data ?? []) as Record<string, unknown>[]

    const areasComStatus: AreaGeo[] = await Promise.all(
      rows.map(async (row) => {
        const faz = row['fazendas'] as { nome: string; lat: number | null; lng: number | null } | null

        let alertas  = 0
        let criticos = 0
        let total    = 0

        if (safraId) {
          const { data: cotas } = await supabase
            .from('cotas_insumos_area')
            .select(`insumo_id, quantidade_cota, safras (data_inicio, data_fim)`)
            .eq('area_id', Number(row['id']))
            .eq('safra_id', safraId)

          if (cotas && cotas.length > 0) {
            total = cotas.length

            await Promise.all(
              (cotas as Record<string, unknown>[]).map(async (cota) => {
                const safraData = cota['safras'] as { data_inicio: string; data_fim: string } | null
                if (!safraData) return

                const { data: movs } = await supabase
                  .from('movimentacoes_estoque')
                  .select('quantidade')
                  .eq('area_id', Number(row['id']))
                  .eq('insumo_id', Number(cota['insumo_id']))
                  .eq('tipo_movimentacao', 'saida')
                  .gte('data_movimentacao', safraData.data_inicio)
                  .lte('data_movimentacao', safraData.data_fim)

                const consumido  = (movs ?? []).reduce((acc, m) => acc + Number((m as { quantidade: number }).quantidade), 0)
                const cota_qty   = Number(cota['quantidade_cota'])
                const percentual = cota_qty > 0 ? (consumido / cota_qty) * 100 : 0

                const status: StatusCota =
                  percentual >= 100 ? 'critico' : percentual >= 80 ? 'alerta' : 'ok'

                if (status === 'critico') criticos++
                else if (status === 'alerta') alertas++
              })
            )
          }
        }

        let poligono: PontoGeo[] | null = null
        try {
          const raw = row['poligono']
          if (Array.isArray(raw)) poligono = raw as PontoGeo[]
          else if (typeof raw === 'string') poligono = JSON.parse(raw)
        } catch { /* poligono inválido — ignorar */ }

        return {
          id:           Number(row['id']),
          fazenda_id:   Number(row['fazenda_id']),
          numero:       String(row['numero'] ?? ''),
          nome:         String(row['nome'] ?? ''),
          descricao:    row['descricao'] != null ? String(row['descricao']) : null,
          lat:          row['lat'] != null ? Number(row['lat']) : null,
          lng:          row['lng'] != null ? Number(row['lng']) : null,
          poligono,
          hect:         row['hect'] != null ? Number(row['hect']) : null,
          fazenda_nome: faz?.nome ?? '—',
          fazenda_lat:  faz?.lat ?? null,
          fazenda_lng:  faz?.lng ?? null,
          status_saude: calcularSaude(alertas, criticos),
          total_cotas:  total,
          alertas,
          criticos,
        } satisfies AreaGeo
      })
    )

    setAreas(areasComStatus)
    setCarregando(false)
  }

  async function salvarPoligono(areaId: number, pontos: PontoGeo[]): Promise<boolean> {
    const { error } = await supabase
      .from('areas')
      .update({ poligono: pontos })
      .eq('id', areaId)
    if (error) { setErro(error.message); return false }
    await carregar()
    return true
  }

  useEffect(() => { carregar() }, [safraId])

  return { areas, carregando, erro, carregar, salvarPoligono }
}
