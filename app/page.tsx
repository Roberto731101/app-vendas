'use client'

import { useVendaForm } from '@/hooks/useVendaForm'
import { AppLayout } from '@/components/layout/AppLayout'
import { VendaInfoForm } from '@/components/vendas/VendaInfoForm'
import { ItemVendaForm } from '@/components/vendas/ItemVendaForm'
import { ItensVendaTable } from '@/components/vendas/ItensVendaTable'
import { VendaResumo } from '@/components/vendas/VendaResumo'

export default function Home() {
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
    salvandoVenda,
    salvandoItem,
    finalizando,
    itemEditandoId,
    iniciarEdicaoItem,
    cancelarEdicaoItem,
    salvarVenda,
    adicionarItem,
    excluirItem,
    limparFormulario,
    finalizarVenda,
    excluirVenda,
    reabrirVenda,
    resumo,
  } = useVendaForm()

  return (
    <AppLayout
      sidebarNavItems={[
        { href: '/', label: 'Vendas' },
        { href: '/colheita', label: 'Colheita' },
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
                <span className="font-semibold text-[#063f81]">
                  Registro de Venda de Frutas
                </span>
              </nav>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Registro de Venda de Frutas
              </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={limparFormulario}
                className="rounded-xl bg-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-300"
              >
                Cancelar
              </button>

              <button
                onClick={excluirVenda}
                disabled={!vendaAtualId}
                className={`rounded-xl px-6 py-2.5 text-sm font-bold text-white transition ${
                  vendaAtualId
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-red-300 cursor-not-allowed'
                }`}
              >
                Excluir Venda
              </button>

              <button
                onClick={salvarVenda}
                disabled={salvandoVenda || vendaSalva}
                className="rounded-xl bg-gradient-to-r from-[#063f81] to-[#2b579a] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition active:scale-95 disabled:opacity-70"
              >
                {salvandoVenda ? 'Salvando...' : vendaSalva ? 'Venda Salva' : 'Salvar Venda'}
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