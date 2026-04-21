'use client'

import './print.css'
import { useEffect, useRef, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useRelatorios } from '@/hooks/useRelatorios'
import { RelatorioColheitaPorLote } from '@/components/relatorios/RelatorioColheitaPorLote'
import { RelatorioProducaoPorSetor } from '@/components/relatorios/RelatorioProducaoPorSetor'
import { RelatorioVendasPorLote } from '@/components/relatorios/RelatorioVendasPorLote'
import { RelatorioConsolidado } from '@/components/relatorios/RelatorioConsolidado'
import { RelatorioHeader } from '@/components/relatorios/RelatorioHeader'
import {
  exportarColheitaPorLote,
  exportarProducaoPorSetor,
  exportarVendasPorLote,
  exportarConsolidadoPorLote,
} from '@/lib/exportarCSV'

const NAV_HEADER = [
  { label: 'Vendas' },
  { label: 'Colheita-registro' },
  { label: 'Relatórios', active: true },
]

const OPCOES_CSV = [
  { label: 'Colheita-registro por Colheita-campo', key: 'colheita' },
  { label: 'Produção por Setor',                  key: 'producao'    },
  { label: 'Vendas por Lote',                     key: 'vendas'      },
  { label: 'Consolidado por Lote',                key: 'consolidado' },
] as const

type ChaveCSV = typeof OPCOES_CSV[number]['key']

export default function RelatoriosPage() {
  const {
    filtros,
    setLoteId,
    setSetorId,
    setDataInicio,
    setDataFim,
    limparFiltros,
    filtrosAtivos,
    opcoesLote,
    opcoesSetor,
    carregando,
    erro,
    relColheita,
    relProducao,
    relVendas,
    relConsolidado,
    recarregar,
  } = useRelatorios()

  const [menuAberto, setMenuAberto] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAberto(false)
      }
    }
    if (menuAberto) document.addEventListener('mousedown', handleClickFora)
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [menuAberto])

  function handleExportarCSV(chave: ChaveCSV) {
    setMenuAberto(false)
    switch (chave) {
      case 'colheita':    exportarColheitaPorLote(relColheita);       break
      case 'producao':    exportarProducaoPorSetor(relProducao);      break
      case 'vendas':      exportarVendasPorLote(relVendas);           break
      case 'consolidado': exportarConsolidadoPorLote(relConsolidado); break
    }
  }

  function handleExportarPDF() {
    setMenuAberto(false)
    window.print()
  }

  return (
    <AppLayout headerNavItems={NAV_HEADER}>

      {/* Cabeçalho visível apenas na impressão */}
      <div className="print-only">
        <RelatorioHeader filtros={filtros} opcoesLote={opcoesLote} opcoesSetor={opcoesSetor} />
      </div>

      {/* Cabeçalho normal da tela */}
      <div className="no-print mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <span>Relatórios</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">NOLASCO PRODUÇÃO</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Relatório de Produção e Vendas</h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={recarregar}
            className="rounded-xl bg-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-300"
          >
            Atualizar
          </button>

          {/* Dropdown Exportar: CSV + PDF */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuAberto((v) => !v)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0891b2] to-[#0e7490] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition active:scale-95"
            >
              Exportar
              <svg
                className={`h-4 w-4 transition-transform ${menuAberto ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuAberto && (
              <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                {/* Opção PDF */}
                <p className="border-b border-slate-100 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  PDF
                </p>
                <button
                  onClick={handleExportarPDF}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-[#0891b2] hover:bg-slate-50"
                >
                  <span>🖨️</span> Imprimir / Salvar PDF
                </button>

                {/* Opções CSV */}
                <p className="border-b border-t border-slate-100 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  CSV
                </p>
                {OPCOES_CSV.map((opcao) => (
                  <button
                    key={opcao.key}
                    onClick={() => handleExportarCSV(opcao.key)}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    {opcao.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filtros — ocultos na impressão */}
      <div className="no-print mb-8 overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Filtros</h3>
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
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Colheita-campo
            </label>
            <select
              value={filtros.loteId}
              onChange={(e) => setLoteId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0891b2] focus:bg-white focus:ring-2 focus:ring-[#0891b2]/10"
            >
              <option value="">Todos os colheita-campo</option>
              {opcoesLote.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Setor
              <span className="ml-1 normal-case text-slate-400">(afeta produção)</span>
            </label>
            <select
              value={filtros.setorId}
              onChange={(e) => setSetorId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0891b2] focus:bg-white focus:ring-2 focus:ring-[#0891b2]/10"
            >
              <option value="">Todos os setores</option>
              {opcoesSetor.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Período — início
            </label>
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0891b2] focus:bg-white focus:ring-2 focus:ring-[#0891b2]/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Período — fim
            </label>
            <input
              type="date"
              value={filtros.dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0891b2] focus:bg-white focus:ring-2 focus:ring-[#0891b2]/10"
            />
          </div>
        </div>
      </div>

      {erro && (
        <div className="no-print mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      {/* 4 blocos de relatório */}
      <div className="flex flex-col gap-8">
        <div className="relatorio-bloco">
          <RelatorioColheitaPorLote linhas={relColheita} carregando={carregando} />
        </div>
        <div className="relatorio-bloco">
          <RelatorioProducaoPorSetor linhas={relProducao} carregando={carregando} />
        </div>
        <div className="relatorio-bloco">
          <RelatorioVendasPorLote linhas={relVendas} carregando={carregando} />
        </div>
        <div className="relatorio-bloco">
          <RelatorioConsolidado linhas={relConsolidado} carregando={carregando} />
        </div>
      </div>
    </AppLayout>
  )
}
