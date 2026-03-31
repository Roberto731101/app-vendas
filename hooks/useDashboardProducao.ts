'use client'

/**
 * useDashboardProducao
 *
 * Fonte: public.vw_peso_setor_corrigido + tabela setores
 * Agrega peso_setor_corrigido por setor_id e calcula produtividade (kg/ha)
 * para setores que possuem o campo hect preenchido.
 *
 * Aplica filtro de período sobre data_colheita da view.
 */

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { type Periodo, calcularIntervalo } from '@/hooks/useDashboardVendas'

export type PontoProducaoSetor = {
  setor: string
  peso: number
}

export type PontoProdutividade = {
  setor: string
  kgPorHa: number
}

type Props = {
  periodo: Periodo
  dataInicio?: string
  dataFim?: string
}

export function useDashboardProducao({ periodo, dataInicio, dataFim }: Props) {
  const [producaoPorSetor, setProducaoPorSetor] = useState<PontoProducaoSetor[]>([])
  const [produtividadeHectare, setProdutividadeHectare] = useState<PontoProdutividade[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  async function carregar() {
    if (periodo === 'personalizado' && (!dataInicio || !dataFim)) return

    setCarregando(true)
    setErro(null)

    const { inicio, fim } = calcularIntervalo(periodo, dataInicio, dataFim)

    const [resProducao, resSetores] = await Promise.all([
      supabase
        .from('vw_peso_setor_corrigido')
        .select('setor_id, peso_setor_corrigido')
        .gte('data_colheita', inicio)
        .lte('data_colheita', fim),
      supabase.from('setores').select('id, nome, hect'),
    ])

    if (resProducao.error) {
      setErro(resProducao.error.message)
      setCarregando(false)
      return
    }
    if (resSetores.error) {
      setErro(resSetores.error.message)
      setCarregando(false)
      return
    }

    setCarregando(false)

    const linhas = resProducao.data ?? []
    const setores = resSetores.data ?? []

    const mapaSetores: Record<number, { nome: string; hect: number | null }> = {}
    for (const s of setores) {
      mapaSetores[s.id] = { nome: s.nome, hect: s.hect }
    }

    // Agregar peso_setor_corrigido por setor_id
    const mapaPeso: Record<number, number> = {}
    for (const linha of linhas) {
      if (linha.setor_id == null || linha.peso_setor_corrigido == null) continue
      mapaPeso[linha.setor_id] = (mapaPeso[linha.setor_id] ?? 0) + linha.peso_setor_corrigido
    }

    const producao: PontoProducaoSetor[] = Object.entries(mapaPeso)
      .map(([setorIdStr, peso]) => {
        const setorId = Number(setorIdStr)
        const nome = mapaSetores[setorId]?.nome ?? `Setor ${setorId}`
        return { setor: nome, peso }
      })
      .sort((a, b) => b.peso - a.peso)

    // Apenas setores com hect > 0
    const produtividade: PontoProdutividade[] = Object.entries(mapaPeso)
      .map(([setorIdStr, peso]) => {
        const setorId = Number(setorIdStr)
        const setor = mapaSetores[setorId]
        if (!setor?.hect || setor.hect <= 0) return null
        return { setor: setor.nome, kgPorHa: peso / setor.hect }
      })
      .filter((x): x is PontoProdutividade => x !== null)
      .sort((a, b) => b.kgPorHa - a.kgPorHa)

    setProducaoPorSetor(producao)
    setProdutividadeHectare(produtividade)
  }

  useEffect(() => {
    carregar()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo, dataInicio, dataFim])

  return { producaoPorSetor, produtividadeHectare, carregando, erro, recarregar: carregar }
}
