'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { NAV_SIDEBAR, isGroup, isSubGroup } from '@/lib/nav'
import { useAuthContext } from '@/contexts/AuthContext'
import type { NavGroup, NavItem } from '@/lib/nav'

type Props = {
  isOpen: boolean
  onClose: () => void
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3 w-3 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export function Sidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname()

  function isAtivo(href: string) {
    return href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(href + '/')
  }

  function grupoTemAtivo(grupo: NavGroup): boolean {
    return grupo.items.some((item) => {
      if (isSubGroup(item)) return item.items.some((i) => isAtivo(i.href))
      return isAtivo((item as NavItem).href)
    })
  }

  function secaoTemAtivo(entries: (NavGroup | NavItem)[]): boolean {
    return entries.some((entry) => {
      if (isGroup(entry)) return grupoTemAtivo(entry)
      return isAtivo((entry as NavItem).href)
    })
  }

  // Estado único para todos os níveis de acordeon (seção, grupo, sub-grupo)
  const [abertos, setAbertos] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    for (const section of NAV_SIDEBAR) {
      init[section.section] = secaoTemAtivo(section.entries)
      for (const entry of section.entries) {
        if (isGroup(entry)) {
          init[entry.group] = grupoTemAtivo(entry)
          for (const item of entry.items) {
            if (isSubGroup(item)) {
              init[item.subgroup] = item.items.some((i) => isAtivo(i.href))
            }
          }
        }
      }
    }
    return init
  })

  const { user, logout } = useAuthContext()
  const router = useRouter()

  function toggle(key: string) {
    setAbertos((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-[#F8F9FA] transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Fechar — mobile */}
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

        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5">
          <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
          <div>
            <h1 className="text-lg font-bold text-[#063f81]">Gestão de Frutas</h1>
            <p className="text-[10px] font-bold uppercase text-slate-500">Painel Administrativo</p>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex flex-1 flex-col overflow-y-auto py-3">
          {NAV_SIDEBAR.map((section) => {
            const secAberta = abertos[section.section] ?? false
            const secAtiva  = secaoTemAtivo(section.entries)

            return (
              <div key={section.section} className="mb-0.5">

                {/* ── Nível 1: Seção (acordeon principal) ───────────────── */}
                <button
                  type="button"
                  onClick={() => toggle(section.section)}
                  className={`flex w-full items-center justify-between px-4 pb-1 pt-3 text-left transition-colors ${
                    secAtiva ? 'text-[#063f81]' : 'text-slate-400 hover:text-slate-500'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {section.section}
                  </span>
                  <Chevron open={secAberta} />
                </button>

                {secAberta && (
                  <div className="flex flex-col gap-0.5 px-2 pb-1">
                    {section.entries.map((entry) => {

                      // ── Link direto na seção (sem grupo) ──────────────
                      if (!isGroup(entry)) {
                        return (
                          <Link
                            key={entry.href}
                            href={entry.href}
                            onClick={onClose}
                            className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                              isAtivo(entry.href)
                                ? 'bg-white font-semibold text-[#063f81] shadow-sm'
                                : 'text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {entry.label}
                          </Link>
                        )
                      }

                      // ── Nível 2: Grupo (sub-acordeon) ─────────────────
                      const grupoAberto = abertos[entry.group] ?? false
                      const grupoAtivo  = grupoTemAtivo(entry)

                      return (
                        <div key={entry.group}>
                          <button
                            type="button"
                            onClick={() => toggle(entry.group)}
                            className={`flex w-full items-center justify-between rounded-lg pl-2 pr-3 py-2 text-left text-sm transition-colors ${
                              grupoAtivo
                                ? 'font-semibold text-[#063f81]'
                                : 'text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <span>{entry.group}</span>
                            <Chevron open={grupoAberto} />
                          </button>

                          {grupoAberto && (
                            <div className="ml-2 mt-0.5 flex flex-col gap-0.5 border-l-2 border-slate-200 pl-3">
                              {entry.items.map((item) => {

                                // ── Nível 3: Sub-grupo (acordeon folha) ──
                                if (isSubGroup(item)) {
                                  const subAberto = abertos[item.subgroup] ?? false
                                  const subAtivo  = item.items.some((i) => isAtivo(i.href))

                                  return (
                                    <div key={item.subgroup}>
                                      <button
                                        type="button"
                                        onClick={() => toggle(item.subgroup)}
                                        className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                                          subAtivo
                                            ? 'font-semibold text-[#063f81]'
                                            : 'text-slate-600 hover:bg-slate-200'
                                        }`}
                                      >
                                        <span>{item.subgroup}</span>
                                        <Chevron open={subAberto} />
                                      </button>

                                      {subAberto && (
                                        <div className="ml-2 mt-0.5 flex flex-col gap-0.5 border-l-2 border-slate-200 pl-3">
                                          {item.items.map((i) => (
                                            <Link
                                              key={i.href}
                                              href={i.href}
                                              onClick={onClose}
                                              className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                                                isAtivo(i.href)
                                                  ? 'bg-white font-semibold text-[#063f81] shadow-sm'
                                                  : 'text-slate-600 hover:bg-slate-200'
                                              }`}
                                            >
                                              {i.label}
                                            </Link>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )
                                }

                                // ── Item simples ─────────────────────────
                                return (
                                  <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                                      isAtivo(item.href)
                                        ? 'bg-white font-semibold text-[#063f81] shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    {item.label}
                                  </Link>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-100 px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#063f81] text-sm font-bold text-white">
              {user?.nome?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800 leading-tight">
                {user?.nome ?? '—'}
              </p>
              {user?.cargo && (
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {user.cargo}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold text-red-500 hover:bg-red-50"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
