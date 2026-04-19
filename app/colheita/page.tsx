'use client'

import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
import { useColheitasHistorico } from '@/hooks/useColheitasHistorico'
import { useResumoPorLote } from '@/hooks/useResumoPorLote'
import { useProducaoPorSetor } from '@/hooks/useProducaoPorSetor'
import { ColheitasHistoricoTable } from '@/components/colheita/ColheitasHistoricoTable'
import { ResumoPorLote } from '@/components/colheita/ResumoPorLote'
import { ProducaoPorSetor } from '@/components/colheita/ProducaoPorSetor'

const NAV_SIDEBAR = [
  { href: '/vendas',     label: 'Vendas' },
  { href: '/colheita',   label: 'Colheita-registro' },
  { href: '/setores',    label: 'Setores' },
  { href: '/relatorios', label: 'Relatórios' },
]

const NAV_HEADER = [
  { label: 'Dashboard' },
  { label: 'Vendas' },
  { label: 'Colheita-registro', active: true },
  { label: 'Relatórios' },
]

export default function ColheitaPage() {
  const {
    colheitas,
    setores,
    lotes,
    carregando,
    erro,
    buscaInput,
    filtros,
    filtrosAtivos,
    atualizarBusca,
    atualizarSetorId,
    atualizarLoteId,
    atualizarDataInicio,
    atualizarDataFim,
    limparFiltros,
    recarregar,
  } = useColheitasHistorico()

  const {
    resumos,
    carregando: carregandoResumo,
    erro: erroResumo,
  } = useResumoPorLote()

  const {
    linhas: linhasProducao,
    carregando: carregandoProducao,
    erro: erroProducao,
  } = useProducaoPorSetor()

  return (
    <AppLayout sidebarNavItems={NAV_SIDEBAR} headerNavItems={NAV_HEADER}>
      {/* Cabeçalho */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <span>Colheita-registro</span>
            <span>{'>'}</span>
            <span className="font-semibold text-[#063f81]">Histórico</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Histórico de Colheita-registros
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/colheita/nova"
            className="rounded-xl bg-[#063f81] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#052e60]"
          >
            Nova Colheita-registro
          </Link>
          <button
            onClick={recarregar}
            className="rounded-xl bg-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-300"
          >
            Atualizar
          </button>
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

        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-5">
          {/* Busca */}
          <div className="lg:col-span-1">
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Busca
            </label>
            <input
              type="text"
              value={buscaInput}
              onChange={(e) => atualizarBusca(e.target.value)}
              placeholder="Buscar por observação..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#063f81] focus:bg-white focus:ring-2 focus:ring-[#063f81]/10"
            />
          </div>

          {/* Setor */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Setor
            </label>
            <select
              value={filtros.setorId}
              onChange={(e) => atualizarSetorId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#063f81] focus:bg-white focus:ring-2 focus:ring-[#063f81]/10"
            >
              <option value="">Todos os setores</option>
              {setores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} — Nº {s.numero}
                </option>
              ))}
            </select>
          </div>

          {/* Colheita-campo */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Colheita-campo
            </label>
            <select
              value={filtros.loteId}
              onChange={(e) => atualizarLoteId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#063f81] focus:bg-white focus:ring-2 focus:ring-[#063f81]/10"
            >
              <option value="">Todos os colheita-campo</option>
              {lotes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.codigo}
                </option>
              ))}
            </select>
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
            Colheita-registros Registradas
          </h3>
          {!carregando && (
            <span className="text-xs text-slate-400">
              {colheitas.length} {colheitas.length === 1 ? 'registro' : 'registros'}
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
          <ColheitasHistoricoTable
            colheitas={colheitas}
            filtrosAtivos={filtrosAtivos}
          />
        )}
      </div>

      {/* Resumo por lote */}
      <div className="mt-8">
        <ResumoPorLote
          resumos={resumos}
          carregando={carregandoResumo}
          erro={erroResumo}
        />
      </div>

      {/* Produção por setor */}
      <div className="mt-8">
        <ProducaoPorSetor
          linhas={linhasProducao}
          setores={setores}
          carregando={carregandoProducao}
          erro={erroProducao}
        />
      </div>
    </AppLayout>
  )
}
