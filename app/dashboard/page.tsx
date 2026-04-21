'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useDashboardVendas, PERIODOS } from '@/hooks/useDashboardVendas'
import { useDashboardProducao } from '@/hooks/useDashboardProducao'
import { GraficoEvolucaoVendas } from '@/components/dashboard/GraficoEvolucaoVendas'
import { GraficoPesoVendido } from '@/components/dashboard/GraficoPesoVendido'
import { GraficoProducaoSetor } from '@/components/dashboard/GraficoProducaoSetor'
import { GraficoProdutividadeHectare } from '@/components/dashboard/GraficoProdutividadeHectare'
import { GraficoClassificacao } from '@/components/dashboard/GraficoClassificacao'
import { GraficoTopClientes } from '@/components/dashboard/GraficoTopClientes'
import { GraficoTopProdutos } from '@/components/dashboard/GraficoTopProdutos'

function moeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function numero(valor: number, casas = 2) {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
}

const NAV_HEADER = [
  { label: 'Dashboard', active: true },
  { label: 'Vendas' },
  { label: 'Estoque' },
  { label: 'Relatórios' },
]

type CardProps = {
  titulo: string
  valor: string
  descricao?: string
  destaque?: boolean
}

function Card({ titulo, valor, descricao, destaque }: CardProps) {
  return (
    <div
      className={`rounded-2xl p-6 shadow-sm ${
        destaque ? 'border-t-4 border-[#0891b2] bg-white' : 'bg-white'
      }`}
    >
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {titulo}
      </p>
      <p className={`text-3xl font-black tracking-tight ${destaque ? 'text-[#0891b2]' : 'text-slate-900'}`}>
        {valor}
      </p>
      {descricao && <p className="mt-1 text-xs text-slate-400">{descricao}</p>}
    </div>
  )
}

function SecaoHeader({ children }: { children: string }) {
  return (
    <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
      {children}
    </h2>
  )
}

function ChartCard({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="mb-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {titulo}
      </p>
      {children}
    </div>
  )
}

export default function DashboardPage() {
  const {
    dados, carregando, erro, periodo, selecionarPeriodo, recarregar,
    dataInicio, dataFim, aplicarPersonalizado,
  } = useDashboardVendas()

  const {
    producaoPorSetor,
    produtividadeHectare,
    carregando: carregandoProducao,
  } = useDashboardProducao({ periodo, dataInicio, dataFim })

  const [localInicio, setLocalInicio] = useState(dataInicio)
  const [localFim, setLocalFim] = useState(dataFim)

  return (
    <AppLayout headerNavItems={NAV_HEADER}>
      {/* Cabeçalho + filtro de período */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-[#0891b2]">Dashboard</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Dashboard
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap rounded-xl bg-slate-100 p-1">
            {PERIODOS.map((p) => (
              <button
                key={p.valor}
                onClick={() => selecionarPeriodo(p.valor)}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                  periodo === p.valor
                    ? 'bg-white text-[#0891b2] shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {periodo === 'personalizado' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={localInicio}
                onChange={(e) => setLocalInicio(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
              />
              <span className="text-xs text-slate-400">até</span>
              <input
                type="date"
                value={localFim}
                onChange={(e) => setLocalFim(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
              />
              <button
                onClick={() => aplicarPersonalizado(localInicio, localFim)}
                disabled={!localInicio || !localFim}
                className="rounded-lg bg-[#0891b2] px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-40 hover:bg-[#0e7490]"
              >
                Aplicar
              </button>
            </div>
          )}

          <button
            onClick={recarregar}
            className="rounded-xl bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-300"
          >
            Atualizar
          </button>
        </div>
      </div>

      {erro && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      {carregando ? (
        <div className="flex items-center justify-center py-24 text-sm text-slate-500">
          Carregando indicadores...
        </div>
      ) : (
        <div className="space-y-10">

          {/* Resumo numérico */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card titulo="Total de Vendas" valor={String(dados.totalVendas).padStart(2, '0')} />
            <Card titulo="Abertas" valor={String(dados.vendasAbertas).padStart(2, '0')} descricao="Aguardando finalização" />
            <Card titulo="Finalizadas" valor={String(dados.vendasFinalizadas).padStart(2, '0')} descricao="Encerradas" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card titulo="Valor Total Vendido" valor={moeda(dados.valorTotalVendido)} destaque />
            <Card titulo="Peso Total Vendido" valor={`${numero(dados.pesoTotalVendido)} Kg`} destaque />
          </div>

          {/* Bloco 1 — Tendência */}
          <div>
            <SecaoHeader>Tendência</SecaoHeader>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ChartCard titulo="Evolução de Vendas (R$)">
                <GraficoEvolucaoVendas dados={dados.vendasPorDia} />
              </ChartCard>
              <ChartCard titulo="Evolução do Peso Vendido (kg)">
                <GraficoPesoVendido dados={dados.pesosPorDia} />
              </ChartCard>
            </div>
          </div>

          {/* Bloco 2 — Produção */}
          <div>
            <SecaoHeader>Produção</SecaoHeader>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ChartCard titulo="Produção por Setor (kg)">
                <GraficoProducaoSetor dados={producaoPorSetor} carregando={carregandoProducao} />
              </ChartCard>
              <ChartCard titulo="Produtividade por Hectare (kg/ha)">
                <GraficoProdutividadeHectare dados={produtividadeHectare} carregando={carregandoProducao} />
              </ChartCard>
            </div>
          </div>

          {/* Bloco 3 — Comercial */}
          <div>
            <SecaoHeader>Comercial</SecaoHeader>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <ChartCard titulo="Participação por Classificação">
                <GraficoClassificacao dados={dados.porClassificacao} />
              </ChartCard>
              <ChartCard titulo="Top 5 Clientes por Valor">
                <GraficoTopClientes dados={dados.topClientes} />
              </ChartCard>
              <ChartCard titulo="Top 5 Produtos por Peso">
                <GraficoTopProdutos dados={dados.topProdutosPeso} />
              </ChartCard>
            </div>
          </div>

        </div>
      )}
    </AppLayout>
  )
}
