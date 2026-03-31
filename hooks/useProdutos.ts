'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type Produto = {
  id: number
  nome: string
  observacao: string | null
  ativo: boolean
  created_at: string
}

export type ProdutoInsert = {
  nome: string
  observacao: string | null
  ativo: boolean
}

export function useProdutos() {
  const [registros, setRegistros] = useState<Produto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setCarregando(true)
    setErro(null)
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('nome', { ascending: true })
    setCarregando(false)
    if (error) { setErro(error.message); return }
    setRegistros((data as Produto[]) ?? [])
  }

  async function buscarPorId(id: number): Promise<Produto | null> {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', id)
      .single()
    if (error) { setErro(error.message); return null }
    return data as Produto
  }

  async function salvar(payload: ProdutoInsert, id?: number): Promise<boolean> {
    setSalvando(true)
    setErro(null)
    setMensagem(null)
    const { error } = id
      ? await supabase.from('produtos').update(payload).eq('id', id)
      : await supabase.from('produtos').insert([payload])
    setSalvando(false)
    if (error) { setErro(error.message); return false }
    setMensagem(id ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.')
    await carregar()
    return true
  }

  async function excluir(id: number): Promise<boolean> {
    if (!window.confirm('Excluir este produto?')) return false
    const { error } = await supabase.from('produtos').delete().eq('id', id)
    if (error) { setErro(error.message); return false }
    setMensagem('Produto excluído com sucesso.')
    await carregar()
    return true
  }

  useEffect(() => { carregar() }, [])

  return { registros, carregando, erro, mensagem, salvando, carregar, buscarPorId, salvar, excluir }
}
