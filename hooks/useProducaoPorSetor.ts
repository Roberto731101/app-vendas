'use client'

/**
 * useProducaoPorSetor
 *
 * Fonte de dados para cálculos operacionais de produção por setor e por hectare.
 *
 * SEPARAÇÃO DE RESPONSABILIDADES:
 * - useResumoPorLote  → visão CONSOLIDADA por lote (conferência, peso efetivo, origem)
 * - useProducaoPorSetor → linhas INDIVIDUAIS da view para cálculos de produção
 *
 * Fonte: public.vw_peso_setor_corrigido
 * A view já aplica a regra de peso corrigido (amostra colheita > média venda),
 * calcula ratio, peso base e peso_setor_corrigido por linha de controle_colheita.
 * Não replicar essa lógica aqui — apenas consumir.
 */

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// Espelho das colunas retornadas pela view vw_peso_setor_corrigido
export type LinhaProducaoSetor = {
  controle_colheita_id: number
  lote_id: number | null
  data_colheita: string
  setor_id: number
  numero_cachos: number
  /** Amostra registrada diretamente na linha de colheita. Null quando ausente. */
  amostra_peso_cacho: number | null
  /** Média de cachos do setor nas vendas do lote. */
  media_numero_cachos: number | null
  /** Média de amostra apurada pelas vendas do lote (fallback quando amostra_peso_cacho é null). */
  media_amostra: number | null
  /** Razão peso_vendido / numero_cachos_vendidos calculada pelas vendas. */
  ratio_medio: number | null
  /** Peso total vendido no lote. */
  peso_total_vendido: number | null
  /** Peso médio por cacho via vendas. */
  peso_media: number | null
  /**
   * Peso de cacho efetivo usado na linha:
   *   1. amostra_peso_cacho quando informada
   *   2. media_amostra das vendas como fallback
   * Calculado pela view — não recalcular aqui.
   */
  peso_amostra: number | null
  /** numero_cachos × peso_amostra, antes do ajuste. */
  peso_base: number | null
  /** Resultado bruto antes do ajuste proporcional. */
  resultado_bruto: number | null
  /** Fator de ajuste proporcional ao peso vendido. */
  ajuste: number | null
  /**
   * Produção estimada do setor (kg), já ajustada.
   * Campo principal para cálculos de produção por setor e por hectare.
   */
  peso_setor_corrigido: number | null
}

export function useProducaoPorSetor(loteId?: number) {
  const [linhas, setLinhas] = useState<LinhaProducaoSetor[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  async function carregar() {
    setCarregando(true)
    setErro(null)

    let query = supabase
      .from('vw_peso_setor_corrigido')
      .select('*')
      .order('lote_id', { ascending: true })
      .order('setor_id', { ascending: true })

    if (loteId !== undefined) {
      query = query.eq('lote_id', loteId)
    }

    const { data, error } = await query

    setCarregando(false)

    if (error) {
      setErro(error.message)
      return
    }

    setLinhas((data as LinhaProducaoSetor[]) ?? [])
  }

  useEffect(() => {
    carregar()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loteId])

  return {
    linhas,
    carregando,
    erro,
    recarregar: carregar,
  }
}
