'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type {
  Venda,
  ItemVenda,
  Cliente,
  Produto,
  TipoCaixa,
  Classificacao,
  LoteOpcao,
} from '@/types/venda-form'

export function useVendaForm(vendaId?: number) {
  // --- Estado do cabeçalho da venda ---
  const [loteId, setLoteId] = useState<string>('')
  const [dataVenda, setDataVenda] = useState('')
  const [ordemVenda, setOrdemVenda] = useState('')
  const [cliente, setCliente] = useState('')
  const [observacao, setObservacao] = useState('')

  // --- Dados de lookup (selects) ---
  const [lotes, setLotes] = useState<LoteOpcao[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [tiposCaixa, setTiposCaixa] = useState<TipoCaixa[]>([])
  const [classificacoes, setClassificacoes] = useState<Classificacao[]>([])

  // --- Controle da venda atual ---
  const [vendas, setVendas] = useState<Venda[]>([])
  const [vendaAtualId, setVendaAtualId] = useState<number | null>(vendaId ?? null)
  const [vendaSalva, setVendaSalva] = useState(false)
  const [vendaFinalizada, setVendaFinalizada] = useState(false)

  // --- Estado do formulário de item ---
  const [produto, setProduto] = useState('')
  const [tipoCaixa, setTipoCaixa] = useState('')
  const [classificacao, setClassificacao] = useState('')
  const [qtdCaixas, setQtdCaixas] = useState('')
  const [kgPorCaixa, setKgPorCaixa] = useState('')
  const [valorKg, setValorKg] = useState('')

  // --- Itens da venda atual ---
  const [itens, setItens] = useState<ItemVenda[]>([])

  // --- Edição de item ---
  const [itemEditandoId, setItemEditandoId] = useState<number | null>(null)

  // --- Feedback de UI ---
  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [salvandoVenda, setSalvandoVenda] = useState(false)
  const [salvandoItem, setSalvandoItem] = useState(false)
  const [finalizando, setFinalizando] = useState(false)

  // --- Auditoria ---

  async function registrarEvento(
    idVenda: number,
    evento: string,
    detalhes?: Record<string, unknown>
  ) {
    await supabase.from('vendas_auditoria').insert({
      venda_id: idVenda,
      evento,
      detalhes: detalhes ?? null,
    })
    // Falhas de auditoria são silenciosas para não interromper o fluxo principal
  }

  // --- Funções auxiliares ---

  function limparCamposItem() {
    setItemEditandoId(null)
    setProduto('')
    setTipoCaixa('')
    setClassificacao('')
    setQtdCaixas('')
    setKgPorCaixa('')
    setValorKg('')
  }

  // --- Funções de carregamento ---

  async function carregarLotes() {
    const { data, error } = await supabase
      .from('lotes_fechamento')
      .select('id, codigo')
      .order('id', { ascending: false })

    if (error) {
      setErro(error.message)
      return
    }

    setLotes((data as LoteOpcao[]) || [])
  }

  async function carregarClientes() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('ativo', true)
      .order('nome', { ascending: true })

    if (error) {
      setErro(error.message)
      return
    }

    setClientes((data as Cliente[]) || [])
  }

  async function carregarProdutos() {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('ativo', true)
      .order('nome', { ascending: true })

    if (error) {
      setErro(error.message)
      return
    }

    setProdutos((data as Produto[]) || [])
  }

  async function carregarTiposCaixa() {
    const { data, error } = await supabase
      .from('tipos_caixa')
      .select('*')
      .eq('ativo', true)
      .order('nome', { ascending: true })

    if (error) {
      setErro(error.message)
      return
    }

    setTiposCaixa((data as TipoCaixa[]) || [])
  }

  async function carregarClassificacoes() {
    const { data, error } = await supabase
      .from('classificacoes')
      .select('*')
      .eq('ativo', true)
      .order('nome', { ascending: true })

    if (error) {
      setErro(error.message)
      return
    }

    setClassificacoes((data as Classificacao[]) || [])
  }

  async function carregarVendas() {
    const { data, error } = await supabase
      .from('vendas')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      setErro(error.message)
      setVendas([])
      return
    }

    setVendas((data as Venda[]) || [])
  }

  async function carregarItens(idVenda: number) {
    const { data, error } = await supabase
      .from('itens_venda')
      .select('*')
      .eq('venda_id', idVenda)
      .order('id', { ascending: true })

    if (error) {
      setErro(error.message)
      setItens([])
      return
    }

    setItens((data as ItemVenda[]) || [])
  }

  async function carregarVendaAtual(idVenda: number) {
    const { data, error } = await supabase
      .from('vendas')
      .select('*')
      .eq('id', idVenda)
      .single()

    if (error) {
      setErro(error.message)
      return
    }

    if (data) {
      setLoteId(data.lote_id != null ? String(data.lote_id) : '')
      setDataVenda(data.data_venda || '')
      setOrdemVenda(data.ordem_venda || '')
      setCliente(data.cliente || '')
      setObservacao(data.observacao || '')
      setVendaFinalizada(Boolean(data.finalizada))
      setVendaSalva(true)
    }
  }
  async function registrarAuditoria(evento: string, detalhes: any = {}){
     if (!vendaAtualId) return

    await supabase.from('vendas_auditoria').insert({
    venda_id: vendaAtualId,
    evento,
    detalhes
    })
  }

  // --- Efeitos ---

  useEffect(() => {
    carregarLotes()
    carregarVendas()
    carregarClientes()
    carregarProdutos()
    carregarTiposCaixa()
    carregarClassificacoes()
  }, [])

  // Sincroniza o hook quando a rota /vendas/[id] mudar
  useEffect(() => {
    if (typeof vendaId === 'number' && !Number.isNaN(vendaId)) {
      setVendaAtualId(vendaId)
    } else {
      setVendaAtualId(null)
    }
  }, [vendaId])

  useEffect(() => {
    if (vendaAtualId) {
      carregarItens(vendaAtualId)
      carregarVendaAtual(vendaAtualId)
    } else {
      setItens([])
      setVendaSalva(false)
      setVendaFinalizada(false)
      limparCamposItem()
    }
  }, [vendaAtualId])

  // --- Handlers de negócio ---

  async function salvarVenda() {
    if (vendaFinalizada) {
      setErro('Esta venda já foi finalizada e não pode ser alterada.')
      setMensagem(null)
      return
    }

    if (vendaSalva && vendaAtualId) {
      setMensagem(`Venda já salva com ID ${vendaAtualId}. Agora você pode adicionar itens.`)
      setErro(null)
      return
    }

    if (!loteId) {
      setErro('Selecione o Lote vinculado a esta venda.')
      setMensagem(null)
      return
    }

    if (!dataVenda || !ordemVenda.trim() || !cliente.trim()) {
      setErro('Preencha Data da Venda, Ordem de Venda e Cliente.')
      setMensagem(null)
      return
    }

    setSalvandoVenda(true)
    setErro(null)
    setMensagem(null)

    const { data, error } = await supabase
      .from('vendas')
      .insert([
        {
          lote_id: Number(loteId),
          data_venda: dataVenda,
          ordem_venda: ordemVenda.trim(),
          cliente: cliente.trim(),
          observacao: observacao.trim() || null,
          finalizada: false,
        },
      ])
      .select()
      .single()

    setSalvandoVenda(false)

    if (error) {
      setErro(error.message)
      return
    }

    if (data?.id) {
      setVendaAtualId(data.id)
      setVendaSalva(true)
      setVendaFinalizada(Boolean(data.finalizada))
      await registrarEvento(data.id, 'venda_criada', {
        ordem_venda: data.ordem_venda,
        cliente: data.cliente,
        data_venda: data.data_venda,
      })
      await carregarVendas()
      await carregarItens(data.id)
      setMensagem(`Venda salva com sucesso. ID da venda: ${data.id}. Agora adicione os itens.`)
    }
  }

  function iniciarEdicaoItem(item: ItemVenda) {
    if (vendaFinalizada) {
      setErro('Venda finalizada não permite edição de itens.')
      setMensagem(null)
      return
    }

    setItemEditandoId(item.id)
    setProduto(item.produto)
    setTipoCaixa(item.tipo_caixa)
    setClassificacao(item.classificacao)
    setQtdCaixas(String(item.qtd_caixas))
    setKgPorCaixa(String(item.kg_por_caixa))
    setValorKg(String(item.valor_kg))
    setErro(null)
    setMensagem(null)
  }

  function cancelarEdicaoItem() {
    limparCamposItem()
    setErro(null)
    setMensagem(null)
  }

  async function adicionarItem() {
    if (vendaFinalizada) {
      setErro('Venda finalizada não permite adicionar ou editar itens.')
      setMensagem(null)
      return
    }

    if (!vendaSalva || !vendaAtualId) {
      setErro('Salve a venda primeiro antes de adicionar itens.')
      setMensagem(null)
      return
    }

    if (
      !produto.trim() ||
      !tipoCaixa.trim() ||
      !classificacao.trim() ||
      !qtdCaixas.trim() ||
      !kgPorCaixa.trim() ||
      !valorKg.trim()
    ) {
      setErro('Preencha todos os campos do item.')
      setMensagem(null)
      return
    }

    const qtd = Number(qtdCaixas)
    const kg = Number(kgPorCaixa)
    const vlr = Number(valorKg)

    if (Number.isNaN(qtd) || Number.isNaN(kg) || Number.isNaN(vlr)) {
      setErro('Quantidade, Kg por Caixa e Valor/Kg precisam ser numéricos.')
      setMensagem(null)
      return
    }

    const pesoTotal = qtd * kg
    const valorTotal = pesoTotal * vlr

    setSalvandoItem(true)
    setErro(null)
    setMensagem(null)

    if (itemEditandoId !== null) {
      const { error } = await supabase
        .from('itens_venda')
        .update({
          produto: produto.trim(),
          tipo_caixa: tipoCaixa.trim(),
          classificacao: classificacao.trim(),
          qtd_caixas: qtd,
          kg_por_caixa: kg,
          valor_kg: vlr,
          peso_total: pesoTotal,
          valor_total: valorTotal,
        })
        .eq('id', itemEditandoId)

      setSalvandoItem(false)

      if (error) {
        setErro(error.message)
        return
      }

      await registrarEvento(vendaAtualId, 'item_editado', {
        item_id: itemEditandoId,
        produto: produto.trim(),
        classificacao: classificacao.trim(),
        qtd_caixas: qtd,
        kg_por_caixa: kg,
        valor_kg: vlr,
        valor_total: valorTotal,
      })
      limparCamposItem()
      await carregarItens(vendaAtualId)
      setMensagem('Item atualizado com sucesso.')
      return
    }

    const { error } = await supabase.from('itens_venda').insert([
      {
        venda_id: vendaAtualId,
        produto: produto.trim(),
        tipo_caixa: tipoCaixa.trim(),
        classificacao: classificacao.trim(),
        qtd_caixas: qtd,
        kg_por_caixa: kg,
        valor_kg: vlr,
        peso_total: pesoTotal,
        valor_total: valorTotal,
      },
    ])

    setSalvandoItem(false)

    if (error) {
      setErro(error.message)
      return
    }

    await registrarEvento(vendaAtualId, 'item_adicionado', {
      produto: produto.trim(),
      classificacao: classificacao.trim(),
      qtd_caixas: qtd,
      kg_por_caixa: kg,
      valor_kg: vlr,
      valor_total: valorTotal,
    })
    limparCamposItem()
    await carregarItens(vendaAtualId)
    setMensagem('Item adicionado com sucesso.')
  }

  async function excluirItem(itemId: number) {
    if (vendaFinalizada) {
      setErro('Venda finalizada não permite excluir itens.')
      setMensagem(null)
      return
    }

    const confirmar = window.confirm('Deseja realmente excluir este item?')
    if (!confirmar) return

    setErro(null)
    setMensagem(null)

    const itemParaLog = itens.find((i) => i.id === itemId)

    const { error } = await supabase
      .from('itens_venda')
      .delete()
      .eq('id', itemId)

    if (error) {
      setErro(error.message)
      return
    }

    if (vendaAtualId) {
      await registrarEvento(vendaAtualId, 'item_excluido', {
        item_id: itemId,
        produto: itemParaLog?.produto,
        classificacao: itemParaLog?.classificacao,
        qtd_caixas: itemParaLog?.qtd_caixas,
        valor_total: itemParaLog?.valor_total,
      })
      await carregarItens(vendaAtualId)
    }

    setMensagem('Item excluído com sucesso.')
  }

  function limparFormulario() {
    setLoteId('')
    setDataVenda('')
    setOrdemVenda('')
    setCliente('')
    setObservacao('')
    setErro(null)
    setMensagem(null)

    setVendaAtualId(null)
    setVendaSalva(false)
    setVendaFinalizada(false)

    limparCamposItem()
    setItens([])
  }

  async function finalizarVenda() {
    if (!vendaSalva || !vendaAtualId) {
      setErro('Salve a venda antes de finalizar.')
      setMensagem(null)
      return
    }

    if (vendaFinalizada) {
      setErro('Esta venda já está finalizada.')
      setMensagem(null)
      return
    }

    setFinalizando(true)
    setErro(null)
    setMensagem(null)

    const { error } = await supabase
      .from('vendas')
      .update({ finalizada: true })
      .eq('id', vendaAtualId)

    setFinalizando(false)

    if (error) {
      setErro(error.message)
      return
    }

    setVendaFinalizada(true)
    await registrarEvento(vendaAtualId, 'venda_finalizada', {
      ordem_venda: ordemVenda,
      total_itens: itens.length,
    })
    await carregarVendas()
    setMensagem(`Venda ${ordemVenda || vendaAtualId} finalizada com sucesso.`)
  }

  async function reabrirVenda() {
    if (!vendaSalva || !vendaAtualId) {
      setErro('Nenhuma venda carregada para reabrir.')
      setMensagem(null)
      return
    }

    if (!vendaFinalizada) {
      setErro('A venda já está aberta.')
      setMensagem(null)
      return
    }

    const confirmar = window.confirm('Deseja reabrir esta venda para edição?')
    if (!confirmar) return

    setErro(null)
    setMensagem(null)

    const { error } = await supabase
      .from('vendas')
      .update({ finalizada: false })
      .eq('id', vendaAtualId)

    if (error) {
      setErro(error.message)
      return
    }

    setVendaFinalizada(false)
    await registrarEvento(vendaAtualId, 'venda_reaberta', {
      ordem_venda: ordemVenda,
    })
    await carregarVendas()
    setMensagem(`Venda ${ordemVenda || vendaAtualId} reaberta para edição.`)
  }

  async function excluirVenda() {
    if (!vendaAtualId) {
      setErro('Nenhuma venda selecionada para excluir.')
      setMensagem(null)
      return
    }

    const confirmar = window.confirm(
      `Deseja realmente excluir a venda ${ordemVenda || vendaAtualId} e todos os itens dela?`
    )

    if (!confirmar) return

    setErro(null)
    setMensagem(null)

    await registrarEvento(vendaAtualId, 'venda_excluida', {
      ordem_venda: ordemVenda,
      total_itens: itens.length,
    })

    const { error: errorItens } = await supabase
      .from('itens_venda')
      .delete()
      .eq('venda_id', vendaAtualId)

    if (errorItens) {
      setErro(errorItens.message)
      return
    }

    const { error: errorVenda } = await supabase
      .from('vendas')
      .delete()
      .eq('id', vendaAtualId)

    if (errorVenda) {
      setErro(errorVenda.message)
      return
    }

    limparFormulario()
    await carregarVendas()
    setMensagem('Venda excluída com sucesso.')
  }

  // --- Valores derivados ---

  const resumo = useMemo(() => {
    const totalItens = itens.length
    const totalCaixas = itens.reduce((acc, item) => acc + item.qtd_caixas, 0)
    const pesoLiquidoTotal = itens.reduce((acc, item) => acc + item.peso_total, 0)
    const valorTotalGeral = itens.reduce((acc, item) => acc + item.valor_total, 0)

    const porClassificacao = itens.reduce<Record<string, number>>((acc, item) => {
      acc[item.classificacao] = (acc[item.classificacao] || 0) + item.valor_total
      return acc
    }, {})

    return {
      totalItens,
      totalCaixas,
      pesoLiquidoTotal,
      valorTotalGeral,
      porClassificacao,
    }
  }, [itens])

  return {
    // Estado: cabeçalho da venda
    loteId,
    setLoteId,
    dataVenda,
    setDataVenda,
    ordemVenda,
    setOrdemVenda,
    cliente,
    setCliente,
    observacao,
    setObservacao,

    // Dados de lookup
    lotes,
    clientes,
    produtos,
    tiposCaixa,
    classificacoes,

    // Controle da venda atual
    vendas,
    vendaAtualId,
    setVendaAtualId,
    vendaSalva,
    vendaFinalizada,

    // Estado: formulário de item
    produto,
    setProduto,
    tipoCaixa,
    setTipoCaixa,
    classificacao,
    setClassificacao,
    qtdCaixas,
    setQtdCaixas,
    kgPorCaixa,
    setKgPorCaixa,
    valorKg,
    setValorKg,

    // Itens da venda
    itens,

    // Feedback
    erro,
    mensagem,
    salvandoVenda,
    salvandoItem,
    finalizando,

    // Edição de item
    itemEditandoId,
    iniciarEdicaoItem,
    cancelarEdicaoItem,

    // Handlers
    salvarVenda,
    adicionarItem,
    excluirItem,
    limparFormulario,
    finalizarVenda,
    reabrirVenda,
    excluirVenda,

    // Loaders expostos se precisar em telas futuras
    carregarVendaAtual,
    carregarItens,
    carregarVendas,

    // Valores derivados
    resumo,
  }
}