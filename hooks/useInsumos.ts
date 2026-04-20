'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type StatusEstoque = 'ok' | 'alerta' | 'critico'

export type Insumo = {
  id: number
  nome_insumo: string
  categoria_id: number | null
  nome_categoria: string | null
  tipo_categoria: string | null
  marca_fornecedor: string | null
  unidade: string
  quantidade_atual: number
  estoque_minimo: number
  lote: string | null
  data_validade: string | null
  status_estoque: StatusEstoque
  ativo: boolean
  created_at: string
  updated_at: string | null
}

export type InsumoInsert = {
  nome_insumo: string
  categoria_id: number | null
  marca_fornecedor: string | null
  unidade: string
  quantidade_atual: number
  estoque_minimo: number
  lote: string | null
  data_validade: string | null
  ativo: boolean
}

export type FiltrosInsumo = {
  categoriaId: string
  status: string
  busca: string
  apenasAtivos: boolean
}

function calcularStatus(quantidade_atual: number, estoque_minimo: number): StatusEstoque {
  if (quantidade_atual <= estoque_minimo) return 'critico'
  if (quantidade_atual <= estoque_minimo * 1.2) return 'alerta'
  return 'ok'
}

const FILTROS_INICIAIS: FiltrosInsumo = {
  categoriaId: '',
  status: '',
  busca: '',
  apenasAtivos: true,
}

export function useInsumos() {
  const [todos, setTodos] = useState<Insumo[]>([])
  const [registros, setRegistros] = useState<Insumo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [filtros, setFiltros] = useState<FiltrosInsumo>(FILTROS_INICIAIS)

  async function carregar() {
    setCarregando(true)
    setErro(null)
    const { data, error } = await supabase
      .from('insumos')
      .select(`
        *,
        categorias_insumos (
          nome_categoria,
          tipo
        )
      `)
      .order('nome_insumo', { ascending: true })
    setCarregando(false)
    if (error) { setErro(error.message); return }

    const mapeados: Insumo[] = ((data as unknown[]) ?? []).map((row: unknown) => {
      const r = row as Record<string, unknown>
      const cat = r['categorias_insumos'] as { nome_categoria: string; tipo: string } | null
      const qtd = Number(r['quantidade_atual'] ?? 0)
      const min = Number(r['estoque_minimo'] ?? 0)
      return {
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
    })
    setTodos(mapeados)
  }

  // Aplicar filtros client-side
  useEffect(() => {
    let lista = todos
    if (filtros.apenasAtivos) lista = lista.filter((i) => i.ativo)
    if (filtros.categoriaId)  lista = lista.filter((i) => String(i.categoria_id) === filtros.categoriaId)
    if (filtros.status)       lista = lista.filter((i) => i.status_estoque === filtros.status)
    if (filtros.busca) {
      const t = filtros.busca.toLowerCase()
      lista = lista.filter(
        (i) => i.nome_insumo.toLowerCase().includes(t) || (i.marca_fornecedor ?? '').toLowerCase().includes(t)
      )
    }
    setRegistros(lista)
  }, [todos, filtros])

  async function salvar(payload: InsumoInsert, id?: number): Promise<boolean> {
    setSalvando(true)
    setErro(null)
    setMensagem(null)
    const { error } = id
      ? await supabase.from('insumos').update(payload).eq('id', id)
      : await supabase.from('insumos').insert([payload])
    setSalvando(false)
    if (error) { setErro(error.message); return false }
    setMensagem(id ? 'Insumo atualizado com sucesso.' : 'Insumo cadastrado com sucesso.')
    await carregar()
    return true
  }

  async function excluir(id: number): Promise<boolean> {
    const { count, error: checkError } = await supabase
      .from('movimentacoes_estoque')
      .select('id', { count: 'exact', head: true })
      .eq('insumo_id', id)
    if (checkError) { setErro(checkError.message); return false }
    if ((count ?? 0) > 0) {
      setErro('Não é possível excluir este insumo pois ele possui movimentações registradas.')
      return false
    }
    if (!window.confirm('Excluir este insumo?')) return false
    const { error } = await supabase.from('insumos').delete().eq('id', id)
    if (error) { setErro(error.message); return false }
    setMensagem('Insumo excluído com sucesso.')
    await carregar()
    return true
  }

  function setBusca(v: string)       { setFiltros((f) => ({ ...f, busca: v })) }
  function setCategoriaId(v: string) { setFiltros((f) => ({ ...f, categoriaId: v })) }
  function setStatus(v: string)      { setFiltros((f) => ({ ...f, status: v })) }
  function limparFiltros()           { setFiltros(FILTROS_INICIAIS) }

  // Derivados para o painel
  const totalAtivos   = todos.filter((i) => i.ativo).length
  const emAlerta      = todos.filter((i) => i.ativo && i.status_estoque === 'alerta').length
  const emCritico     = todos.filter((i) => i.ativo && i.status_estoque === 'critico').length
  const criticos      = todos.filter((i) => i.ativo && i.status_estoque === 'critico')

  useEffect(() => { carregar() }, [])

  return {
    registros, todos, carregando, erro, mensagem, salvando, filtros,
    carregar, salvar, excluir,
    setBusca, setCategoriaId, setStatus, limparFiltros,
    totalAtivos, emAlerta, emCritico, criticos,
    setErro, setMensagem,
  }
}
