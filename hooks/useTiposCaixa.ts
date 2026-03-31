'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type TipoCaixa = {
  id: number
  nome: string
  peso_padrao: number | null
  observacao: string | null
  ativo: boolean
  created_at: string
}

export type TipoCaixaInsert = {
  nome: string
  peso_padrao: number | null
  observacao: string | null
  ativo: boolean
}

export function useTiposCaixa() {
  const [registros, setRegistros] = useState<TipoCaixa[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setCarregando(true)
    setErro(null)
    const { data, error } = await supabase
      .from('tipos_caixa')
      .select('*')
      .order('nome', { ascending: true })
    setCarregando(false)
    if (error) { setErro(error.message); return }
    setRegistros((data as TipoCaixa[]) ?? [])
  }

  async function buscarPorId(id: number): Promise<TipoCaixa | null> {
    const { data, error } = await supabase
      .from('tipos_caixa')
      .select('*')
      .eq('id', id)
      .single()
    if (error) { setErro(error.message); return null }
    return data as TipoCaixa
  }

  async function salvar(payload: TipoCaixaInsert, id?: number): Promise<boolean> {
    setSalvando(true)
    setErro(null)
    setMensagem(null)
    const { error } = id
      ? await supabase.from('tipos_caixa').update(payload).eq('id', id)
      : await supabase.from('tipos_caixa').insert([payload])
    setSalvando(false)
    if (error) { setErro(error.message); return false }
    setMensagem(id ? 'Tipo de caixa atualizado com sucesso.' : 'Tipo de caixa cadastrado com sucesso.')
    await carregar()
    return true
  }

  async function excluir(id: number): Promise<boolean> {
    if (!window.confirm('Excluir este tipo de caixa?')) return false
    const { error } = await supabase.from('tipos_caixa').delete().eq('id', id)
    if (error) { setErro(error.message); return false }
    setMensagem('Tipo de caixa excluído com sucesso.')
    await carregar()
    return true
  }

  useEffect(() => { carregar() }, [])

  return { registros, carregando, erro, mensagem, salvando, carregar, buscarPorId, salvar, excluir }
}
