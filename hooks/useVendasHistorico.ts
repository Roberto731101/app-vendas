'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Venda } from '@/types/venda-form'

export type StatusFiltro = 'todas' | 'aberta' | 'finalizada'

export type FiltrosHistorico = {
  cliente: string
  status: StatusFiltro
  dataInicio: string
  dataFim: string
}

const FILTROS_INICIAIS: FiltrosHistorico = {
  cliente: '',
  status: 'todas',
  dataInicio: '',
  dataFim: '',
}

export function useVendasHistorico() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // clienteInput: valor imediato do campo de texto (exibido no input)
  // filtros.cliente: valor aplicado na query (atualizado com debounce)
  const [clienteInput, setClienteInput] = useState('')
  const [filtros, setFiltros] = useState<FiltrosHistorico>(FILTROS_INICIAIS)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function carregar(f: FiltrosHistorico) {
    setCarregando(true)
    setErro(null)

    let query = supabase
      .from('vendas')
      .select('*')
      .order('id', { ascending: false })

    if (f.cliente.trim()) {
      query = query.ilike('cliente', `%${f.cliente.trim()}%`)
    }
    if (f.status === 'aberta') {
      query = query.eq('finalizada', false)
    } else if (f.status === 'finalizada') {
      query = query.eq('finalizada', true)
    }
    if (f.dataInicio) {
      query = query.gte('data_venda', f.dataInicio)
    }
    if (f.dataFim) {
      query = query.lte('data_venda', f.dataFim)
    }

    const { data, error } = await query

    setCarregando(false)

    if (error) {
      setErro(error.message)
      return
    }

    setVendas((data as Venda[]) || [])
  }

  // Recarrega automaticamente sempre que os filtros aplicados mudam
  useEffect(() => {
    carregar(filtros)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros])

  function atualizarCliente(valor: string) {
    setClienteInput(valor)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setFiltros((prev) => ({ ...prev, cliente: valor }))
    }, 350)
  }

  function atualizarStatus(valor: StatusFiltro) {
    setFiltros((prev) => ({ ...prev, status: valor }))
  }

  function atualizarDataInicio(valor: string) {
    setFiltros((prev) => ({ ...prev, dataInicio: valor }))
  }

  function atualizarDataFim(valor: string) {
    setFiltros((prev) => ({ ...prev, dataFim: valor }))
  }

  function limparFiltros() {
    setClienteInput('')
    setFiltros(FILTROS_INICIAIS)
  }

  const filtrosAtivos =
    filtros.cliente !== '' ||
    filtros.status !== 'todas' ||
    filtros.dataInicio !== '' ||
    filtros.dataFim !== ''

  return {
    vendas,
    carregando,
    erro,
    clienteInput,
    filtros,
    filtrosAtivos,
    atualizarCliente,
    atualizarStatus,
    atualizarDataInicio,
    atualizarDataFim,
    limparFiltros,
    recarregar: () => carregar(filtros),
  }
}
