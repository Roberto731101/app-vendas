'use client'

import { useRouter } from 'next/navigation'

export type PdcaVistaAtiva = 'planejar' | 'executar' | 'calendario' | 'gantt'

const VISTAS: { key: PdcaVistaAtiva; label: string; href: (id: number) => string }[] = [
  { key: 'planejar',   label: 'Planejar',   href: (id) => `/pdca/${id}/planejar`   },
  { key: 'executar',   label: 'Kanban',     href: (id) => `/pdca/${id}/executar`   },
  { key: 'calendario', label: 'Calendário', href: (id) => `/pdca/${id}/calendario` },
  { key: 'gantt',      label: 'Gantt',      href: (id) => `/pdca/${id}/gantt`      },
]

type Props = {
  cicloId: number
  ativa:   PdcaVistaAtiva
}

export function PdcaViewNav({ cicloId, ativa }: Props) {
  const router = useRouter()
  return (
    <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
      {VISTAS.map((v) => (
        <button
          key={v.key}
          onClick={() => router.push(v.href(cicloId))}
          className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors
            ${v.key === ativa
              ? 'bg-[#0891b2] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
            }
          `}
        >
          {v.label}
        </button>
      ))}
    </div>
  )
}
