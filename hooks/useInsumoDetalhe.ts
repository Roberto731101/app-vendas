'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Insumo } from '@/hooks/useInsumos'
import type { Movimentacao } from '@/hooks/useMovimentacoes'

export type PontoEvolucao = {
  data: string
  quantidade: number
}

export type InsumoDetalheResult = {
  insumo: Insumo | null
  movimentacoes: Movimentacao[]
  consumoMensal: number
  evolucaoEstoque: PontoEvolucao[]
  carregando: boolean
  erro: string | null
}

function calcularStatus(quantidade_atual: number, estoque_minimo: number): Insumo['status_estoque'] {
  if (quantidade_atual <= estoque_minimo) return 'critico'
  if (quantidade_atual <= estoque_minimo * 1.2) return 'alerta'
  return 'ok'
}

async function resolverUsuarios(rows: Record<string, unknown>[]): Promise<Record<string, string>> {
  const uids = [...new Set(rows.map((r) => r['usuario_id']).filter(Boolean))] as string[]
  if (uids.length === 0) return {}
  const { data } = await supabase
    .from('usuarios')
    .select('auth_id, nome')
    .in('auth_id', uids)
  return Object.fromEntries(
    ((data ?? []) as { auth_id: string; nome: string }[]).map((u) => [u.auth_id, u.nome])
  )
}

function mapearMovimentacao(
  row: Record<string, unknown>,
  userMap: Record<string, string>
): Movimentacao {
  const insumo  = row['insumos']  as { nome_insumo: string; unidade: string } | null
  const fazenda = row['fazendas'] as { nome: string } | null
  const area    = row['areas']    as { nome: string } | null
  const setor   = row['setores']  as { nome: string } | null
  const uid     = row['usuario_id'] != null ? String(row['usuario_id']) : null
  return {
    id:                Number(row['id']),
    insumo_id:         Number(row['insumo_id']),
    nome_insumo:       insumo?.nome_insumo ?? '',
    tipo_movimentacao: String(row['tipo_movimentacao']) as Movimentacao['tipo_movimentacao'],
    quantidade:        Number(row['quantidade']),
    unidade:           String(row['unidade'] ?? insumo?.unidade ?? ''),
    data_movimentacao: String(row['data_movimentacao']),
    fazenda_id:        row['fazenda_id'] != null ? Number(row['fazenda_id']) : null,
    fazenda_nome:      fazenda?.nome ?? null,
    area_id:           row['area_id'] != null ? Number(row['area_id']) : null,
    area_nome:         area?.nome ?? null,
    setor_id:          row['setor_id'] != null ? Number(row['setor_id']) : null,
    setor_nome:        setor?.nome ?? null,
    usuario_id:        uid,
    usuario_nome:      uid ? (userMap[uid] ?? null) : null,
    observacao:        row['observacao'] != null ? String(row['observacao']) : null,
    created_at:        String(row['created_at']),
  }
}

/**
 * Deriva pontos de evolução de estoque a partir das movimentações.
 * Reconstrói o saldo cronologicamente (do mais antigo para o mais recente).
 * O ponto de partida é o saldo atual, rebobinado ao passado.
 */
function calcularEvolucao(
  movimentacoes: Movimentacao[],
  quantidadeAtual: number
): PontoEvolucao[] {
  // Rebobinar: partimos do saldo atual e subtraímos/somamos ao contrário
  // do mais novo para o mais antigo
  let saldo = quantidadeAtual
  const saldosReversos: { data: string; quantidade: number }[] = []

  for (let i = movimentacoes.length - 1; i >= 0; i--) {
    const mov = movimentacoes[i]
    saldosReversos.push({ data: mov.data_movimentacao, quantidade: saldo })
    // desfazer a movimentação
    if (mov.tipo_movimentacao === 'entrada') {
      saldo -= mov.quantidade
    } else {
      saldo += mov.quantidade
    }
  }

  // saldosReversos está do mais novo para o mais antigo — inverter
  const resultado = saldosReversos.reverse()

  // Agrupar por data (último saldo do dia) — sem duplicatas de data
  const porData: Record<string, number> = {}
  for (const ponto of resultado) {
    porData[ponto.data] = ponto.quantidade
  }

  // Adicionar saldo atual para a data de hoje
  const hoje = new Date().toISOString().slice(0, 10)
  porData[hoje] = quantidadeAtual

  // Converter para array ordenado por data
  return Object.entries(porData)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([data, quantidade]) => ({ data, quantidade: Math.max(0, quantidade) }))

}

export function useInsumoDetalhe(id: number): InsumoDetalheResult {
  const [insumo, setInsumo] = useState<Insumo | null>(null)
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([])
  const [consumoMensal, setConsumoMensal] = useState(0)
  const [evolucaoEstoque, setEvolucaoEstoque] = useState<PontoEvolucao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    async function carregar() {
      setCarregando(true)
      setErro(null)

      // Buscar insumo com join de categoria
      const { data: insumoData, error: insumoErr } = await supabase
        .from('insumos')
        .select(`
          *,
          categorias_insumos (
            nome_categoria,
            tipo
          )
        `)
        .eq('id', id)
        .single()

      if (insumoErr || !insumoData) {
        setErro(insumoErr?.message ?? 'Insumo não encontrado.')
        setCarregando(false)
        return
      }

      const r = insumoData as Record<string, unknown>
      const cat = r['categorias_insumos'] as { nome_categoria: string; tipo: string } | null
      const qtd = Number(r['quantidade_atual'] ?? 0)
      const min = Number(r['estoque_minimo'] ?? 0)

      const insumoMapeado: Insumo = {
        id:               Number(r['id']),
        nome_insumo:      String(r['nome_insumo'] ?? ''),
        categoria_id:     r['categoria_id'] != null ? Number(r['categoria_id']) : null,
        nome_categoria:   cat?.nome_categoria ?? null,
        tipo_categoria:   cat?.tipo ?? null,
        marca_fornecedor: r['marca_fornecedor'] != null ? String(r['marca_fornecedor']) : null,
        unidade:          String(r['unidade'] ?? ''),
        quantidade_atual: qtd,
        estoque_minimo:   min,
        lote:             r['lote'] != null ? String(r['lote']) : null,
        data_validade:    r['data_validade'] != null ? String(r['data_validade']) : null,
        status_estoque:   calcularStatus(qtd, min),
        ativo:            Boolean(r['ativo']),
        created_at:       String(r['created_at'] ?? ''),
        updated_at:       r['updated_at'] != null ? String(r['updated_at']) : null,
      }
      setInsumo(insumoMapeado)

      // Buscar movimentações dos últimos 30 registros com joins
      const { data: movData, error: movErr } = await supabase
        .from('movimentacoes_estoque')
        .select(`
          *,
          insumos (nome_insumo, unidade),
          fazendas (nome),
          areas (nome),
          setores (nome)
        `)
        .eq('insumo_id', id)
        .order('data_movimentacao', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(30)

      if (movErr) {
        setErro(movErr.message)
        setCarregando(false)
        return
      }

      const rows = (movData ?? []) as Record<string, unknown>[]
      const userMap = await resolverUsuarios(rows)
      const movimentacoesMapeadas = rows.map((row) => mapearMovimentacao(row, userMap))
      setMovimentacoes(movimentacoesMapeadas)

      // Consumo mensal: soma das saídas nos últimos 30 dias
      const trintaDiasAtras = new Date()
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30)
      const dataCorte = trintaDiasAtras.toISOString().slice(0, 10)

      const consumo = movimentacoesMapeadas
        .filter((m) => m.tipo_movimentacao === 'saida' && m.data_movimentacao >= dataCorte)
        .reduce((acc, m) => acc + m.quantidade, 0)
      setConsumoMensal(consumo)

      // Evolução de estoque — derivada das movimentações
      const evolucao = calcularEvolucao(movimentacoesMapeadas, qtd)
      setEvolucaoEstoque(evolucao)

      setCarregando(false)
    }

    carregar()
  }, [id])

  return { insumo, movimentacoes, consumoMensal, evolucaoEstoque, carregando, erro }
}
