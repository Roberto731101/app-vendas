'use client'

import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
import { useSetores } from '@/hooks/useSetores'
import { SetoresTable } from '@/components/setores/SetoresTable'
import { NAV_SIDEBAR } from '@/lib/nav'

const NAV_HEADER = [
  { label: 'Vendas' },
  { label: 'Colheita-registro' },
  { label: 'Setores', active: true },
]

export default function SetoresPage() {
  const { registros, carregando, erro, mensagem, excluir } = useSetores()

  return (
    <AppLayout sidebarNavItems={NAV_SIDEBAR} headerNavItems={NAV_HEADER}>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <span>Cadastros</span>
            <span>{'>'}</span>
            <span className="font-semibold text-[#063f81]">Setores</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Setores</h1>
        </div>
        <Link
          href="/setores/novo"
          className="rounded-xl bg-[#063f81] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#052e60]"
        >
          + Novo Setor
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#063f81]">
            Setores Cadastrados
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
          <SetoresTable registros={registros} onExcluir={excluir} />
        )}
      </div>
    </AppLayout>
  )
}
