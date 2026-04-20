'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type StatusCota = 'ok' | 'alerta' | 'critico'

export type CotaInsumo = {
  id: number
  area_id: number
  insumo_id: number
  safra_id: number
  quantidade_cota: number
  unidade: string
  observacao: string | null
  created_at: string
  // joins
  insumo_nome: string
  area_nome: string
  safra_nome: string
  // calculados
  consumido: number
  percentual: number
  status_cota: StatusCota
}

export type CotaInsert = {
  area_id: number
  insumo_id: number
  safra_id: number
  quantidade_cota: number
  unidade: string
  observacao: string | null
}

function calcularStatus(percentual: number): StatusCota {
  if (percentual >= 100) return 'critico'
  if (percentual >= 80)  return 'alerta'
  return 'ok'
}

export function useCotasArea(areaId?: number, safraId?: number) {
  const [registros, setRegistros]   = useState<CotaInsumo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro]             = useState<string | null>(null)
  const [mensagem, setMensagem]     = useState<string | null>(null)
  const [salvando, setSalvando]     = useState(false)

  async function carregar() {
    if (!areaId || !safraId) { setRegistros([]); setCarregando(false); return }
    setCarregando(true)
    setErro(null)

    const { data, error } = await supabase
      .from('cotas_insumos_area')
      .select(`*, insumos (nome_insumo), areas (nome), safras (nome, data_inicio, data_fim)`)
      .eq('area_id', areaId)
      .eq('safra_id', safraId)
      .order('created_at', { ascending: true })

    if (error) { setErro(error.message); setCarregando(false); return }

    const rows = (data ?? []) as Record<string, unknown>[]

    const cotasComConsumo = await Promise.all(
      rows.map(async (row) => {
        const safraData = row['safras'] as { nome: string; data_inicio: string; data_fim: string } | null
        const insumo    = row['insumos'] as { nome_insumo: string } | null
        const area      = row['areas']   as { nome: string } | null

        let consumido = 0
        if (safraData) {
          const { data: movs } = await supabase
            .from('movimentacoes_estoque')
            .select('quantidade')
            .eq('area_id', areaId)
            .eq('insumo_id', Number(row['insumo_id']))
            .eq('tipo_movimentacao', 'saida')
            .gte('data_movimentacao', safraData.data_inicio)
            .lte('data_movimentacao', safraData.data_fim)
          consumido = (movs ?? []).reduce((acc, m) => acc + Number((m as { quantidade: number }).quantidade), 0)
        }

        const cota       = Number(row['quantidade_cota'])
        const percentual = cota > 0 ? (consumido / cota) * 100 : 0

        return {
          id:             Number(row['id']),
          area_id:        Number(row['area_id']),
          insumo_id:      Number(row['insumo_id']),
          safra_id:       Number(row['safra_id']),
          quantidade_cota: cota,
          unidade:        String(row['unidade'] ?? ''),
          observacao:     row['observacao'] != null ? String(row['observacao']) : null,
          created_at:     String(row['created_at']),
          insumo_nome:    insumo?.nome_insumo ?? '—',
          area_nome:      area?.nome ?? '—',
          safra_nome:     safraData?.nome ?? '—',
          consumido,
          percentual,
          status_cota:    calcularStatus(percentual),
        } satisfies CotaInsumo
      })
    )

    setRegistros(cotasComConsumo)
    setCarregando(false)
  }

  async function salvar(payload: CotaInsert, id?: number): Promise<boolean> {
    setSalvando(true)
    setErro(null)
    setMensagem(null)
    const { error } = id
      ? await supabase.from('cotas_insumos_area').update(payload).eq('id', id)
      : await supabase.from('cotas_insumos_area').insert([payload])
    setSalvando(false)
    if (error) { setErro(error.message); return false }
    setMensagem(id ? 'Cota atualizada.' : 'Cota definida com sucesso.')
    await carregar()
    return true
  }

  async function excluir(id: number): Promise<boolean> {
    if (!window.confirm('Excluir esta cota?')) return false
    const { error } = await supabase.from('cotas_insumos_area').delete().eq('id', id)
    if (error) { setErro(error.message); return false }
    setMensagem('Cota excluída.')
    await carregar()
    return true
  }

  useEffect(() => { carregar() }, [areaId, safraId])

  return { registros, carregando, erro, mensagem, salvando, carregar, salvar, excluir, setErro, setMensagem }
}
