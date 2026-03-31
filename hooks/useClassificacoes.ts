'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type Classificacao = {
  id: number
  nome: string
  observacao: string | null
  ativo: boolean
  created_at: string
}

export type ClassificacaoInsert = {
  nome: string
  observacao: string | null
  ativo: boolean
}

export function useClassificacoes() {
  const [registros, setRegistros] = useState<Classificacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setCarregando(true)
    setErro(null)
    const { data, error } = await supabase
      .from('classificacoes')
      .select('*')
      .order('nome', { ascending: true })
    setCarregando(false)
    if (error) { setErro(error.message); return }
    setRegistros((data as Classificacao[]) ?? [])
  }

  async function buscarPorId(id: number): Promise<Classificacao | null> {
    const { data, error } = await supabase
      .from('classificacoes')
      .select('*')
      .eq('id', id)
      .single()
    if (error) { setErro(error.message); return null }
    return data as Classificacao
  }

  async function salvar(payload: ClassificacaoInsert, id?: number): Promise<boolean> {
    setSalvando(true)
    setErro(null)
    setMensagem(null)
    const { error } = id
      ? await supabase.from('classificacoes').update(payload).eq('id', id)
      : await supabase.from('classificacoes').insert([payload])
    setSalvando(false)
    if (error) { setErro(error.message); return false }
    setMensagem(id ? 'Classificação atualizada com sucesso.' : 'Classificação cadastrada com sucesso.')
    await carregar()
    return true
  }

  async function excluir(id: number): Promise<boolean> {
    if (!window.confirm('Excluir esta classificação?')) return false
    const { error } = await supabase.from('classificacoes').delete().eq('id', id)
    if (error) { setErro(error.message); return false }
    setMensagem('Classificação excluída com sucesso.')
    await carregar()
    return true
  }

  useEffect(() => { carregar() }, [])

  return { registros, carregando, erro, mensagem, salvando, carregar, buscarPorId, salvar, excluir }
}
