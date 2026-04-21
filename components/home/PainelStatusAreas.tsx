'use client'

import Link from 'next/link'
import type { AreaGeo, StatusSaude } from '@/hooks/useGestaoAreas'

const COR_STATUS: Record<StatusSaude, string> = {
  excelente: 'bg-green-500',
  estavel:   'bg-amber-400',
  critico:   'bg-red-500',
}

const LABEL_STATUS: Record<StatusSaude, string> = {
  excelente: 'Excelente',
  estavel:   'Estável',
  critico:   'Crítico',
}

type Props = {
  areas: AreaGeo[]
  carregando: boolean
  onSelecionarArea: (area: AreaGeo) => void
}

export function PainelStatusAreas({ areas, carregando, onSelecionarArea }: Props) {
  return (
    <div className="flex flex-col rounded-2xl bg-white shadow-lg max-h-64 lg:max-h-[calc(100vh-260px)]">
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-800">Status das Áreas</h3>
        <p className="text-xs text-slate-400">{areas.length} área{areas.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {carregando ? (
          <div className="flex items-center justify-center py-8 text-xs text-slate-400">Carregando…</div>
        ) : areas.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-xs text-slate-400">Nenhuma área cadastrada</div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {areas.map((area) => (
              <li key={area.id}>
                <button
                  type="button"
                  onClick={() => onSelecionarArea(area)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${COR_STATUS[area.status_saude]}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{area.nome}</p>
                    <p className="truncate text-xs text-slate-400">{area.fazenda_nome}</p>
                  </div>
                  <span className={`text-xs font-semibold ${
                    area.status_saude === 'excelente' ? 'text-green-600' :
                    area.status_saude === 'estavel'   ? 'text-amber-600' :
                                                        'text-red-600'
                  }`}>
                    {LABEL_STATUS[area.status_saude]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-slate-100 p-3">
        <Link
          href="/areas"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0891b2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0e7490] transition-colors"
        >
          Gestão de Áreas →
        </Link>
      </div>
    </div>
  )
}
