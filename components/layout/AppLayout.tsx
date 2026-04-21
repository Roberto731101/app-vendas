'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { AppHeader } from '@/components/layout/AppHeader'

type HeaderNavItem = {
  label: string
  active?: boolean
}

type Props = {
  sidebarNavItems?: unknown
  headerNavItems: HeaderNavItem[]
  children: React.ReactNode
}

export function AppLayout({ headerNavItems, children }: Props) {
  const [sidebarAberto, setSidebarAberto] = useState(false)

  return (
    <div className="min-h-screen bg-[#f0f4f4] text-slate-900">
      <Sidebar isOpen={sidebarAberto} onClose={() => setSidebarAberto(false)} />
      <AppHeader
        navItems={headerNavItems}
        onMenuToggle={() => setSidebarAberto((v) => !v)}
      />
      <main className="min-h-screen bg-[#f0f4f4] p-4 pt-6 lg:ml-64 lg:p-10">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
