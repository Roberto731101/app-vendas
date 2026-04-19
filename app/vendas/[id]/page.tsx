'use client'

import { useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { VendaInfoForm } from '@/components/vendas/VendaInfoForm'
import { ItemVendaForm } from '@/components/vendas/ItemVendaForm'
import { ItensVendaTable } from '@/components/vendas/ItensVendaTable'
import { VendaResumo } from '@/components/vendas/VendaResumo'
import { useVendaForm } from '@/hooks/useVendaForm'
import { useVendaAuditoria } from '@/hooks/useVendaAuditoria'
import { VendaAuditoria } from '@/components/vendas/VendaAuditoria'

export default function VendaDetalhe() {
  const params = useParams()
  const router = useRouter()
  const vendaId = Number(params.id)

  const {
    loteId, setLoteId,
    dataVenda, setDataVenda,
    ordemVenda, setOrdemVenda,
    cliente, setCliente,
    observacao, setObservacao,
    lotes,
    clientes,
    produtos,
    tiposCaixa,
    classificacoes,
    vendaAtualId,
    vendaSalva,
    vendaFinalizada,
    produto, setProduto,
    tipoCaixa, setTipoCaixa,
    classificacao, setClassificacao,
    qtdCaixas, setQtdCaixas,
    kgPorCaixa, setKgPorCaixa,
    valorKg, setValorKg,
    itens,
    erro,
    mensagem,
    salvandoItem,
    finalizando,
    itemEditandoId,
    iniciarEdicaoItem,
    cancelarEdicaoItem,
    adicionarItem,
    excluirItem,
    finalizarVenda,
    reabrirVenda,
    excluirVenda,
    resumo,
  } = useVendaForm(vendaId)

  const {
    registros,
    carregando: carregandoAuditoria,
    erro: erroAuditoria,
    recarregar: recarregarAuditoria,
  } = useVendaAuditoria(vendaId)

  // Navega de volta ao histórico após excluir a venda
  const prevVendaAtualId = useRef(vendaAtualId)
  useEffect(() => {
    const prev = prevVendaAtualId.current
    prevVendaAtualId.current = vendaAtualId
    if (prev !== null && vendaAtualId === null) {
      router.push('/vendas')
    }
  }, [vendaAtualId, router])

  if (!vendaId || isNaN(vendaId)) {
    return (
      <AppLayout
        sidebarNavItems={[
          { href: '/vendas', label: 'Vendas' },
          { href: '/colheita', label: 'Colheita-registro' },
          { href: '/setores', label: 'Setores' },
          { href: '/relatorios', label: 'Relatórios' },
        ]}
        headerNavItems={[
          { label: 'Dashboard' },
          { label: 'Vendas', active: true },
          { label: 'Estoque' },
          { label: 'Relatórios' },
        ]}
      >
        <p className="text-sm text-red-600">ID de venda inválido.</p>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      sidebarNavItems={[
        { href: '/vendas', label: 'Vendas' },
        { href: '/colheita', label: 'Colheita-registro' },
        { href: '/setores', label: 'Setores' },
        { href: '/relatorios', label: 'Relatórios' },
      ]}
      headerNavItems={[
        { label: 'Dashboard' },
        { label: 'Vendas', active: true },
        { label: 'Estoque' },
        { label: 'Relatórios' },
      ]}
    >
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <span>Vendas</span>
            <span>{'>'}</span>
            <a
              onClick={() => router.push('/vendas')}
              className="cursor-pointer hover:text-[#063f81]"
            >
              Histórico
            </a>
            <span>{'>'}</span>
            <span className="font-semibold text-[#063f81]">
              Venda #{vendaId}
            </span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {ordemVenda || `Venda #${vendaId}`}
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => router.push('/vendas')}
            className="rounded-xl bg-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-300"
          >
            Voltar
          </button>

          <button
            onClick={excluirVenda}
            disabled={!vendaSalva || vendaFinalizada}
            className={`rounded-xl px-6 py-2.5 text-sm font-bold text-white transition ${
              vendaSalva && !vendaFinalizada
                ? 'bg-red-600 hover:bg-red-700'
                : 'cursor-not-allowed bg-red-300'
            }`}
          >
            Excluir Venda
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <VendaInfoForm
            lotes={lotes}
            clientes={clientes}
            loteId={loteId}
            dataVenda={dataVenda}
            ordemVenda={ordemVenda}
            cliente={cliente}
            observacao={observacao}
            setLoteId={setLoteId}
            setDataVenda={setDataVenda}
            setOrdemVenda={setOrdemVenda}
            setCliente={setCliente}
            setObservacao={setObservacao}
            vendaFinalizada={vendaFinalizada}
            erro={erro}
            mensagem={mensagem}
          />

          <ItemVendaForm
            produtos={produtos}
            tiposCaixa={tiposCaixa}
            classificacoes={classificacoes}
            produto={produto}
            tipoCaixa={tipoCaixa}
            classificacao={classificacao}
            qtdCaixas={qtdCaixas}
            kgPorCaixa={kgPorCaixa}
            valorKg={valorKg}
            setProduto={setProduto}
            setTipoCaixa={setTipoCaixa}
            setClassificacao={setClassificacao}
            setQtdCaixas={setQtdCaixas}
            setKgPorCaixa={setKgPorCaixa}
            setValorKg={setValorKg}
            vendaSalva={vendaSalva}
            salvandoItem={salvandoItem}
            itemEditandoId={itemEditandoId}
            vendaFinalizada={vendaFinalizada}
            onAdicionarItem={adicionarItem}
            onCancelarEdicao={cancelarEdicaoItem}
          />

          <ItensVendaTable
            itens={itens}
            vendaFinalizada={vendaFinalizada}
            onEditarItem={iniciarEdicaoItem}
            onExcluirItem={excluirItem}
          />

          <VendaAuditoria
            registros={registros}
            carregando={carregandoAuditoria}
            erro={erroAuditoria}
            onRecarregar={recarregarAuditoria}
          />
        </div>

        <VendaResumo
          resumo={resumo}
          vendaSalva={vendaSalva}
          vendaFinalizada={vendaFinalizada}
          finalizando={finalizando}
          onFinalizar={finalizarVenda}
          onReabrir={reabrirVenda}
        />
      </div>
    </AppLayout>
  )
}
