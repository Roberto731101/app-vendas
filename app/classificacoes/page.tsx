'use client'

import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
import { useClassificacoes } from '@/hooks/useClassificacoes'
import { ClassificacoesTable } from '@/components/classificacoes/ClassificacoesTable'
import { NAV_SIDEBAR } from '@/lib/nav'

const NAV_HEADER = [
  { label: 'Vendas' },
  { label: 'Colheita-registro' },
  { label: 'Classificações', active: true },
]

export default function ClassificacoesPage() {
  const { registros, carregando, erro, mensagem, excluir } = useClassificacoes()

  return (
    <AppLayout sidebarNavItems={NAV_SIDEBAR} headerNavItems={NAV_HEADER}>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <span>Cadastros</span>
            <span>{'>'}</span>
            <span className="font-semibold text-[#0891b2]">Classificações</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Classificações</h1>
        </div>
        <Link
          href="/classificacoes/novo"
          className="rounded-xl bg-[#0891b2] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0e7490]"
        >
          + Nova Classificação
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0891b2]">
            Classificações Cadastradas
          </h3>
          {!carregando && (
            <span className="text-xs text-slate-400">
              {registros.length} {registros.length === 1 ? 'registro' : 'registros'}
            </span>
          )}
        </div>

        {erro && (
          <div className="m-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</div>
        )}
        {mensagem && (
          <div className="m-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{mensagem}</div>
        )}

        {carregando ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">Carregando...</div>
        ) : (
          <ClassificacoesTable registros={registros} onExcluir={excluir} />
        )}
      </div>
    </AppLayout>
  )
}
