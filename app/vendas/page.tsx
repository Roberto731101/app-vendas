'use client'

import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
import { useVendasHistorico } from '@/hooks/useVendasHistorico'

const STATUS_OPCOES: { valor: 'todas' | 'aberta' | 'finalizada'; label: string }[] = [
  { valor: 'todas',      label: 'Todas' },
  { valor: 'aberta',     label: 'Abertas' },
  { valor: 'finalizada', label: 'Finalizadas' },
]

function formatarData(data: string | null) {
  if (!data) return '—'
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

export default function VendasPage() {
  const {
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
    recarregar,
  } = useVendasHistorico()

  return (
    <AppLayout
      sidebarNavItems={[
        { href: '/vendas', label: 'Vendas' },
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
      {/* Cabeçalho */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <span>Vendas</span>
            <span>{'>'}</span>
            <span className="font-semibold text-[#063f81]">Histórico</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Histórico de Vendas
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={recarregar}
            className="rounded-xl bg-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-300"
          >
            Atualizar
          </button>
          <Link
            href="/"
            className="rounded-xl bg-gradient-to-r from-[#063f81] to-[#2b579a] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:opacity-90"
          >
            + Nova Venda
          </Link>
        </div>
      </div>

      {/* Painel de filtros */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Filtros
          </h3>
          {filtrosAtivos && (
            <button
              onClick={limparFiltros}
              className="text-xs font-semibold text-red-500 hover:text-red-700"
            >
              Limpar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Cliente */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Cliente
            </label>
            <input
              type="text"
              value={clienteInput}
              onChange={(e) => atualizarCliente(e.target.value)}
              placeholder="Buscar por cliente..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#063f81] focus:bg-white focus:ring-2 focus:ring-[#063f81]/10"
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Status
            </label>
            <div className="flex rounded-xl bg-slate-100 p-1">
              {STATUS_OPCOES.map((op) => (
                <button
                  key={op.valor}
                  onClick={() => atualizarStatus(op.valor)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                    filtros.status === op.valor
                      ? 'bg-white text-[#063f81] shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {/* Data início */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Data início
            </label>
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => atualizarDataInicio(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#063f81] focus:bg-white focus:ring-2 focus:ring-[#063f81]/10"
            />
          </div>

          {/* Data fim */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Data fim
            </label>
            <input
              type="date"
              value={filtros.dataFim}
              onChange={(e) => atualizarDataFim(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#063f81] focus:bg-white focus:ring-2 focus:ring-[#063f81]/10"
            />
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#063f81]">
            Vendas Registradas
          </h3>
          {!carregando && (
            <span className="text-xs text-slate-400">
              {vendas.length} {vendas.length === 1 ? 'resultado' : 'resultados'}
            </span>
          )}
        </div>

        {erro && (
          <div className="m-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        {carregando ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            Carregando...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-600">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">
                    Ordem de Venda
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider">
                    Data da Venda
                  </th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {vendas.map((venda) => (
                  <tr key={venda.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {venda.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {venda.ordem_venda}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {venda.cliente}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatarData(venda.data_venda)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {venda.finalizada ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700">
                          Finalizada
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                          Aberta
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/vendas/${venda.id}`}
                        className="rounded-lg bg-[#063f81]/10 px-3 py-1.5 text-xs font-bold text-[#063f81] hover:bg-[#063f81]/20"
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}

                {vendas.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                      {filtrosAtivos
                        ? 'Nenhuma venda encontrada para os filtros aplicados.'
                        : 'Nenhuma venda registrada.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
