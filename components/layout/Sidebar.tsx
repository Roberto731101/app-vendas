'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { NAV_SIDEBAR, isGroup } from '@/lib/nav'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname()

  const cadastrosHrefs = NAV_SIDEBAR
    .flatMap((e) => (isGroup(e) ? e.items.map((i) => i.href) : []))

  const dentroDoGrupo = cadastrosHrefs.some(
    (href) => pathname === href || pathname.startsWith(href + '/'),
  )

  const [aberto, setAberto] = useState(dentroDoGrupo)

  function isAtivo(href: string) {
    return href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(href + '/')
  }

  function handleLinkClick() {
    onClose()
  }

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-[#F8F9FA] p-6 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Botão fechar — mobile apenas */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar menu"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 lg:hidden"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-10 flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
          <div>
            <h1 className="text-lg font-bold text-[#063f81]">
              Gestão de Frutas
            </h1>
            <p className="text-[10px] font-bold uppercase text-slate-500">
              Painel Administrativo
            </p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {NAV_SIDEBAR.map((entry) => {
            if (isGroup(entry)) {
              const grupoAtivo = entry.items.some((i) => isAtivo(i.href))
              return (
                <div key={entry.group} className="mt-2">
                  <button
                    type="button"
                    onClick={() => setAberto((v) => !v)}
                    className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors ${
                      grupoAtivo
                        ? 'font-semibold text-[#063f81]'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{entry.group}</span>
                    <svg
                      className={`h-4 w-4 transition-transform ${aberto ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {aberto && (
                    <div className="ml-2 mt-1 flex flex-col gap-1 border-l-2 border-slate-200 pl-3">
                      {entry.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={handleLinkClick}
                          className={
                            isAtivo(item.href)
                              ? 'rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#063f81] shadow'
                              : 'rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-200'
                          }
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={handleLinkClick}
                className={
                  isAtivo(entry.href)
                    ? 'rounded-lg bg-white px-4 py-3 font-semibold text-[#063f81] shadow'
                    : 'rounded-lg px-4 py-3 text-slate-600 hover:bg-slate-200'
                }
              >
                {entry.label}
              </Link>
            )
          })}
        </nav>

        <button className="mt-auto rounded-lg bg-blue-700 py-3 text-xs font-bold text-white">
          Exportar Dados
        </button>
      </aside>
    </>
  )
}
