'use client'

/**
 * useResumoPorLote — visão CONSOLIDADA por lote para conferência.
 *
 * Fonte única: vw_peso_setor_corrigido
 * A view já aplica a regra de prioridade (amostra colheita > média venda) e
 * calcula peso_setor_corrigido. Este hook apenas agrega por lote_id para
 * exibição de conferência. NÃO recalcula peso com média simples de amostras.
 *
 * Para cálculos operacionais linha a linha, usar useProducaoPorSetor.
 */

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  calcularPesoCachoEfetivo,
  type OrigemPesoCacho,
} from '@/lib/pesoCachoEfetivo'

export type ResumoPorLote = {
  lote_id: number
  codigo: string
  totalCachos: number
  quantidadeRegistros: number
  ultimaColheita: string          // ISO date: YYYY-MM-DD

  // --- Peso de cacho efetivo (apenas para conferência visual) ---
  /** Média das amostras informadas nas linhas do lote, conforme a view. */
  amostraInformada: number | null
  /** Peso médio apurado via vendas vinculadas ao lote, conforme a view. */
  mediaAmostraVenda: number | null
  /** Valor efetivo para conferência, após regra de prioridade. */
  pesoCachoEfetivo: number | null
  /** Origem: COLHEITA | VENDA | SEM_BASE */
  origemPesoCacho: OrigemPesoCacho
}

// Linha retornada pela view — campos usados neste hook
type LinhaView = {
  lote_id: number | null
  data_colheita: string
  numero_cachos: number
  /** Amostra da colheita (pode ser null). Usada para determinar origem. */
  amostra_peso_cacho: number | null
  /** Fallback da venda — constante dentro do lote. */
  media_amostra: number | null
}

// Linha de lotes_fechamento para buscar o código do lote
type LinhaLote = {
  id: number
  codigo: string
}

export function useResumoPorLote() {
  const [resumos, setResumos] = useState<ResumoPorLote[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  async function carregar() {
    setCarregando(true)
    setErro(null)

    // Fonte única: vw_peso_setor_corrigido
    // lotes_fechamento apenas para o nome (codigo) do lote
    const [resView, resLotes] = await Promise.all([
      supabase
        .from('vw_peso_setor_corrigido')
        .select('lote_id, data_colheita, numero_cachos, amostra_peso_cacho, media_amostra'),
      supabase
        .from('lotes_fechamento')
        .select('id, codigo'),
    ])

    setCarregando(false)

    if (resView.error) {
      setErro(resView.error.message)
      return
    }

    const codigoPorLote = new Map<number, string>(
      ((resLotes.data as LinhaLote[]) ?? []).map((l) => [l.id, l.codigo])
    )

    const linhas = (resView.data as LinhaView[]) ?? []

    // Agrega por lote_id — todos os valores vêm da view, sem cálculo próprio
    const mapa = new Map<number, {
      totalCachos: number
      quantidade: number
      ultimaColheita: string
      amostrasColheita: number[]   // para calcular amostraInformada de conferência
      mediaVenda: number | null    // constante por lote, vinda da view
    }>()

    for (const linha of linhas) {
      if (linha.lote_id === null) continue

      const id = linha.lote_id
      const entrada = mapa.get(id)

      // media_amostra é constante dentro do lote — qualquer linha serve
      const mediaVenda =
        entrada?.mediaVenda ?? (linha.media_amostra !== null ? Number(linha.media_amostra) : null)

      const amostrasColheita = entrada?.amostrasColheita ?? []
      if (linha.amostra_peso_cacho !== null) {
        amostrasColheita.push(Number(linha.amostra_peso_cacho))
      }

      const ultimaColheita =
        !entrada || linha.data_colheita > entrada.ultimaColheita
          ? linha.data_colheita
          : entrada.ultimaColheita

      mapa.set(id, {
        totalCachos: (entrada?.totalCachos ?? 0) + linha.numero_cachos,
        quantidade: (entrada?.quantidade ?? 0) + 1,
        ultimaColheita,
        amostrasColheita,
        mediaVenda,
      })
    }

    const resultado: ResumoPorLote[] = Array.from(mapa.entries()).map(
      ([lote_id, dados]) => {
        // amostraInformada: média das amostras do lote presentes na view
        // (a view já é a fonte — não buscamos controle_colheita diretamente)
        const amostraInformada =
          dados.amostrasColheita.length > 0
            ? dados.amostrasColheita.reduce((a, b) => a + b, 0) / dados.amostrasColheita.length
            : null

        const mediaAmostraVenda = dados.mediaVenda

        const { pesoCachoEfetivo, origemPesoCacho } =
          calcularPesoCachoEfetivo(amostraInformada, mediaAmostraVenda)

        return {
          lote_id,
          codigo: codigoPorLote.get(lote_id) ?? `Lote ${lote_id}`,
          totalCachos: dados.totalCachos,
          quantidadeRegistros: dados.quantidade,
          ultimaColheita: dados.ultimaColheita,
          amostraInformada,
          mediaAmostraVenda,
          pesoCachoEfetivo,
          origemPesoCacho,
        }
      }
    )

    resultado.sort((a, b) => b.ultimaColheita.localeCompare(a.ultimaColheita))

    setResumos(resultado)
  }

  useEffect(() => {
    carregar()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    resumos,
    carregando,
    erro,
    recarregar: carregar,
  }
}
