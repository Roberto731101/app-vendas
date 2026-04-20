'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { NAV_SIDEBAR, isGroup, isSubGroup } from '@/lib/nav'
import type { NavGroup, NavItem } from '@/lib/nav'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname()

  function isAtivo(href: string) {
    return href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(href + '/')
  }

  // Verifica se algum item de um grupo está ativo (incluindo sub-grupos)
  function grupoTemAtivo(grupo: NavGroup): boolean {
    return grupo.items.some((item) => {
      if (isSubGroup(item)) return item.items.some((i) => isAtivo(i.href))
      return isAtivo(item.href)
    })
  }

  // Verifica se alguma entrada de seção está ativa
  function secaoTemAtivo(entries: (NavGroup | NavItem)[]): boolean {
    return entries.some((entry) => {
      if (isGroup(entry)) return grupoTemAtivo(entry)
      return isAtivo(entry.href)
    })
  }

  // Estado por grupo: inicia aberto se o grupo contém a rota atual
  const [abertos, setAbertos] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    for (const section of NAV_SIDEBAR) {
      for (const entry of section.entries) {
        if (isGroup(entry)) {
          init[entry.group] = grupoTemAtivo(entry)
        }
      }
    }
    return init
  })

  function toggleGrupo(grupo: string) {
    setAbertos((prev) => ({ ...prev, [grupo]: !prev[grupo] }))
  }

  function handleLinkClick() {
    onClose()
  }

  return (
    <>
      {/* Overlay mobile */}
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

        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5">
          <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
          <div>
            <h1 className="text-lg font-bold text-[#063f81]">Gestão de Frutas</h1>
            <p className="text-[10px] font-bold uppercase text-slate-500">Painel Administrativo</p>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex flex-1 flex-col gap-0 overflow-y-auto py-4">
          {NAV_SIDEBAR.map((section) => {
            const secAtiva = secaoTemAtivo(section.entries)

            return (
              <div key={section.section} className="mb-1">
                {/* Label da seção */}
                <p className={`px-5 pb-1 pt-3 text-[9px] font-black uppercase tracking-widest ${
                  secAtiva ? 'text-[#063f81]' : 'text-slate-400'
                }`}>
                  {section.section}
                </p>

                {/* Entradas da seção */}
                <div className="flex flex-col gap-0.5 px-2">
                  {section.entries.map((entry) => {
                    // ── Link direto (sem grupo) ──────────────────────────
                    if (!isGroup(entry)) {
                      return (
                        <Link
                          key={entry.href}
                          href={entry.href}
                          onClick={handleLinkClick}
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

                    // ── Grupo expansível (accordion) ─────────────────────
                    const estaAberto = abertos[entry.group] ?? false
                    const grupoAtivo = grupoTemAtivo(entry)

                    return (
                      <div key={entry.group}>
                        <button
                          type="button"
                          onClick={() => toggleGrupo(entry.group)}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                            grupoAtivo
                              ? 'font-semibold text-[#063f81]'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span>{entry.group}</span>
                          <svg
                            className={`h-3.5 w-3.5 shrink-0 transition-transform ${estaAberto ? 'rotate-180' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {estaAberto && (
                          <div className="ml-2 mt-0.5 flex flex-col gap-0.5 border-l-2 border-slate-200 pl-3">
                            {entry.items.map((item) => {
                              // ── Sub-grupo (label + itens indentados) ──
                              if (isSubGroup(item)) {
                                const subAtivo = item.items.some((i) => isAtivo(i.href))
                                return (
                                  <div key={item.subgroup}>
                                    <p className={`px-3 pb-0.5 pt-2 text-[9px] font-black uppercase tracking-widest ${
                                      subAtivo ? 'text-[#063f81]' : 'text-slate-400'
                                    }`}>
                                      {item.subgroup}
                                    </p>
                                    {item.items.map((i) => (
                                      <Link
                                        key={i.href}
                                        href={i.href}
                                        onClick={handleLinkClick}
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
                                )
                              }

                              // ── Item simples ──────────────────────────
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={handleLinkClick}
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
              </div>
            )
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <button className="w-full rounded-lg bg-blue-700 py-3 text-xs font-bold text-white">
            Exportar Dados
          </button>
        </div>
      </aside>
    </>
  )
}
