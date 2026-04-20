'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'

type NavItem = {
  label: string
  active?: boolean
}

type Props = {
  navItems: NavItem[]
  onMenuToggle: () => void
}

export function AppHeader({ navItems, onMenuToggle }: Props) {
  const { user, logout } = useAuthContext()
  const router = useRouter()
  const [dropdownAberto, setDropdownAberto] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  const inicial = user?.nome?.charAt(0).toUpperCase() ?? '?'

  return (
    <header className="sticky top-0 z-30 flex w-full items-center justify-between bg-white/80 px-4 py-4 shadow-sm backdrop-blur-md lg:ml-64 lg:w-[calc(100%-16rem)] lg:px-10">
      {/* Esquerda: menu toggle + breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Abrir menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#063f81] hover:bg-slate-100 lg:hidden"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Nolasco Produção" className="h-8 w-auto lg:h-10" />
          <h2 className="text-base font-bold uppercase tracking-tight text-[#063f81] lg:text-lg">
            NOLASCO PRODUÇÃO
          </h2>
        </div>
      </div>

      {/* Centro: nav */}
      <div className="hidden gap-6 text-sm md:flex">
        {navItems.map((item) => (
          <span
            key={item.label}
            className={
              item.active
                ? 'border-b-2 border-[#063f81] pb-1 text-[#063f81]'
                : 'text-slate-500'
            }
          >
            {item.label}
          </span>
        ))}
      </div>

      {/* Direita: usuário */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownAberto((v) => !v)}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-100"
        >
          {/* Avatar */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#063f81] text-sm font-bold text-white">
            {inicial}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">
              {user?.nome ?? '—'}
            </p>
            {user?.cargo && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {user.cargo}
              </p>
            )}
          </div>
          <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownAberto && (
          <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
