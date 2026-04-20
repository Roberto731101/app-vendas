'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type Categoria = {
  id: number
  nome_categoria: string
  descricao: string | null
  tipo: string | null
  ativo: boolean
  created_at: string
  updated_at: string | null
}

export type CategoriaInsert = {
  nome_categoria: string
  descricao: string | null
  tipo: string | null
  ativo: boolean
}

export function useCategorias() {
  const [registros, setRegistros] = useState<Categoria[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setCarregando(true)
    setErro(null)
    const { data, error } = await supabase
      .from('categorias_insumos')
      .select('*')
      .order('nome_categoria', { ascending: true })
    setCarregando(false)
    if (error) { setErro(error.message); return }
    setRegistros((data as Categoria[]) ?? [])
  }

  async function salvar(payload: CategoriaInsert, id?: number): Promise<boolean> {
    setSalvando(true)
    setErro(null)
    setMensagem(null)
    const { error } = id
      ? await supabase.from('categorias_insumos').update(payload).eq('id', id)
      : await supabase.from('categorias_insumos').insert([payload])
    setSalvando(false)
    if (error) { setErro(error.message); return false }
    setMensagem(id ? 'Categoria atualizada com sucesso.' : 'Categoria cadastrada com sucesso.')
    await carregar()
    return true
  }

  async function excluir(id: number): Promise<boolean> {
    const { count, error: checkError } = await supabase
      .from('insumos')
      .select('id', { count: 'exact', head: true })
      .eq('categoria_id', id)
    if (checkError) { setErro(checkError.message); return false }
    if ((count ?? 0) > 0) {
      setErro('Não é possível excluir esta categoria pois ela possui insumos vinculados.')
      return false
    }
    if (!window.confirm('Excluir esta categoria?')) return false
    const { error } = await supabase.from('categorias_insumos').delete().eq('id', id)
    if (error) { setErro(error.message); return false }
    setMensagem('Categoria excluída com sucesso.')
    await carregar()
    return true
  }

  useEffect(() => { carregar() }, [])

  return { registros, carregando, erro, mensagem, salvando, carregar, salvar, excluir, setErro, setMensagem }
}
