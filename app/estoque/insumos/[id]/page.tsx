'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { StatusBadge } from '@/components/estoque/StatusBadge'
import { InsumoEspecificacoes } from '@/components/estoque/InsumoEspecificacoes'
import { InsumoEvolucaoChart } from '@/components/estoque/InsumoEvolucaoChart'
import { InsumoMovimentacoesTabela } from '@/components/estoque/InsumoMovimentacoesTabela'
import { useInsumoDetalhe } from '@/hooks/useInsumoDetalhe'

const NAV_HEADER = [
  { label: 'Estoque' },
  { label: 'Insumos', href: '/estoque/insumos' },
  { label: 'Detalhe', active: true },
]

type PageProps = {
  params: Promise<{ id: string }>
}

export default function InsumoDetalhePage({ params }: PageProps) {
  const { id: idStr } = use(params)
  const id = Number(idStr)
  const router = useRouter()

  const { insumo, movimentacoes, consumoMensal, evolucaoEstoque, carregando, erro } =
    useInsumoDetalhe(id)

  // Loading
  if (carregando) {
    return (
      <AppLayout headerNavItems={NAV_HEADER}>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0891b2] border-t-transparent" />
        </div>
      </AppLayout>
    )
  }

  // Error
  if (erro || !insumo) {
    return (
      <AppLayout headerNavItems={NAV_HEADER}>
        <div className="mx-auto max-w-md py-16 text-center">
          <p className="text-4xl">⚠️</p>
          <h2 className="mt-4 text-lg font-bold text-slate-800">
            {erro ?? 'Insumo não encontrado'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Verifique se o insumo existe ou tente novamente.
          </p>
          <Link
            href="/estoque/insumos"
            className="mt-6 inline-block rounded-xl bg-[#0891b2] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0e7490]"
          >
            Voltar para Insumos
          </Link>
        </div>
      </AppLayout>
    )
  }

  // Percentual em relação ao estoque mínimo (para exibição)
  const pctEstoque =
    insumo.estoque_minimo > 0
      ? Math.round((insumo.quantidade_atual / insumo.estoque_minimo) * 100)
      : null

  // Próximo reabastecimento estimado (dias): quantidade_atual / consumo diário médio
  const consumoDiario = consumoMensal / 30
  const diasRestantes =
    consumoDiario > 0 ? Math.floor(insumo.quantidade_atual / consumoDiario) : null

  return (
    <AppLayout headerNavItems={NAV_HEADER}>
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-xs text-slate-400">
        <Link href="/estoque" className="hover:text-[#0891b2]">Estoque</Link>
        <span>›</span>
        <Link href="/estoque/insumos" className="hover:text-[#0891b2]">Insumos</Link>
        <span>›</span>
        <span className="font-semibold text-slate-700">{insumo.nome_insumo}</span>
      </nav>

      {/* Header do insumo */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {insumo.nome_insumo}
            </h1>
            <StatusBadge status={insumo.status_estoque} />
            {pctEstoque !== null && (
              <span className="rounded-full bg-[#0891b2]/10 px-3 py-1 text-xs font-bold text-[#0891b2]">
                {pctEstoque}% do mínimo
              </span>
            )}
          </div>
          {insumo.nome_categoria && (
            <p className="mt-1 text-sm text-slate-500">
              Categoria: <span className="font-semibold">{insumo.nome_categoria}</span>
              {insumo.tipo_categoria && (
                <span className="ml-1 text-slate-400">({insumo.tipo_categoria})</span>
              )}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/estoque/movimentar?insumo=${insumo.id}`)}
            className="rounded-xl bg-[#0891b2] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0e7490]"
          >
            Registrar Movimentação
          </button>
          <Link
            href="/estoque/insumos"
            className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            Voltar
          </Link>
        </div>
      </div>

      {/* Grid principal: quantidade + cards laterais */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Quantidade em destaque */}
        <div className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Quantidade Atual
            </p>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-5xl font-black text-slate-900">
                {insumo.quantidade_atual.toLocaleString('pt-BR')}
              </span>
              <span className="mb-1.5 text-xl font-semibold text-slate-400">{insumo.unidade}</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Mínimo:{' '}
              <span className="font-semibold text-slate-700">
                {insumo.estoque_minimo.toLocaleString('pt-BR')} {insumo.unidade}
              </span>
            </p>
          </div>
          <button
            onClick={() => router.push(`/estoque/movimentar?insumo=${insumo.id}`)}
            className="mt-6 w-full rounded-xl bg-[#1a3a2a] py-3 text-sm font-bold text-white hover:bg-[#0f2419]"
          >
            REGISTRAR SAÍDA / USO
          </button>
        </div>

        {/* Cards laterais */}
        <div className="flex flex-col gap-5">
          {/* Consumo Mensal */}
          <div className="flex-1 rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Consumo Mensal
            </p>
            {consumoMensal > 0 ? (
              <>
                <p className="mt-2 text-3xl font-black text-slate-900">
                  {consumoMensal.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-slate-400">{insumo.unidade} nos últimos 30 dias</p>
              </>
            ) : (
              <>
                <p className="mt-2 text-2xl font-black text-slate-400">0</p>
                <p className="text-xs text-slate-400">sem consumo registrado</p>
              </>
            )}
          </div>

          {/* Próximo Reabastecimento */}
          <div className="flex-1 rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Próximo Reabastecimento
            </p>
            {diasRestantes !== null ? (
              <>
                <p className="mt-2 text-3xl font-black text-[#0891b2]">
                  {diasRestantes}
                </p>
                <p className="text-xs text-slate-400">dias estimados</p>
              </>
            ) : (
              <>
                <p className="mt-2 text-2xl font-black text-slate-400">—</p>
                <p className="text-xs text-slate-400">
                  {consumoMensal === 0 ? 'sem consumo registrado' : 'não calculado'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Gráfico de evolução */}
      <div className="mb-6">
        <InsumoEvolucaoChart evolucaoEstoque={evolucaoEstoque} unidade={insumo.unidade} />
      </div>

      {/* Especificações técnicas */}
      <div className="mb-6">
        <InsumoEspecificacoes insumo={insumo} />
      </div>

      {/* Tabela de movimentações */}
      <InsumoMovimentacoesTabela movimentacoes={movimentacoes} />
    </AppLayout>
  )
}
