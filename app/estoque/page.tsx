'use client'

import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
import { useInsumos } from '@/hooks/useInsumos'
import { useMovimentacoes } from '@/hooks/useMovimentacoes'
import { useCategorias } from '@/hooks/useCategorias'
import { EstoqueResumoCards } from '@/components/estoque/EstoqueResumoCards'
import { AlertaCritico } from '@/components/estoque/AlertaCritico'
import { InsumoCard } from '@/components/estoque/InsumoCard'
import { useRouter } from 'next/navigation'

const NAV_HEADER = [
  { label: 'Estoque', active: true },
  { label: 'Painel' },
]

export default function EstoquePage() {
  const router = useRouter()
  const { registros, todos, carregando, filtros, totalAtivos, emAlerta, emCritico, criticos, setBusca, setCategoriaId } = useInsumos()
  const { totalHoje } = useMovimentacoes()
  const { registros: categorias } = useCategorias()

  function handleCategoria(id: string) {
    setCategoriaId(id)
  }

  return (
    <AppLayout headerNavItems={NAV_HEADER}>
      <div className="mb-6">
        <nav className="mb-1 flex items-center gap-2 text-xs text-slate-400">
          <span>Estoque</span>
        </nav>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Painel de Estoque</h1>
            <p className="mt-1 text-sm text-slate-500">Visão geral dos insumos e movimentações</p>
          </div>
          <Link
            href="/estoque/movimentar"
            className="rounded-xl bg-[#1a3a2a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f2419]"
          >
            + Nova Movimentação
          </Link>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="mb-6">
        <EstoqueResumoCards
          totalAtivos={totalAtivos}
          emAlerta={emAlerta}
          emCritico={emCritico}
          movimentacoesHoje={totalHoje}
        />
      </div>

      {/* Alerta crítico */}
      {criticos.length > 0 && (
        <div className="mb-6">
          <AlertaCritico criticos={criticos} />
        </div>
      )}

      {/* Lista de insumos */}
      <div className="rounded-2xl bg-white shadow-sm">
        {/* Busca e filtros */}
        <div className="border-b border-slate-100 p-5 space-y-4">
          <input
            type="text"
            value={filtros.busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por insumo ou marca..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1a3a2a] focus:bg-white focus:ring-2 focus:ring-[#1a3a2a]/10"
          />

          {/* Pills de categoria */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoria('')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                filtros.categoriaId === ''
                  ? 'bg-[#1a3a2a] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos
            </button>
            {categorias.filter((c) => c.ativo).map((c) => (
              <button
                key={c.id}
                onClick={() => handleCategoria(String(c.id))}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  filtros.categoriaId === String(c.id)
                    ? 'bg-[#1a3a2a] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.nome_categoria}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        <div className="divide-y divide-slate-50 p-4 space-y-3">
          {carregando ? (
            <div className="py-12 text-center text-sm text-slate-400">Carregando...</div>
          ) : registros.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">Nenhum insumo encontrado.</div>
          ) : (
            registros.map((i) => (
              <InsumoCard
                key={i.id}
                insumo={i}
                onMovimentar={() => router.push(`/estoque/movimentar?insumo=${i.id}`)}
              />
            ))
          )}
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
          <p className="text-xs text-slate-400">
            {registros.length} de {todos.filter((i) => i.ativo).length} insumos ativos
          </p>
          {todos.filter((i) => i.ativo && i.status_estoque !== 'ok').length > 0 && (
            <p className="text-xs font-semibold text-amber-600">
              {todos.filter((i) => i.ativo && i.status_estoque !== 'ok').length} abaixo do nível mínimo
            </p>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
