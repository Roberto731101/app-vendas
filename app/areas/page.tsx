'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { MapaAreas } from '@/components/maps/MapaAreas'
import { AreaCard } from '@/components/areas/AreaCard'
import { AlertasCriticos } from '@/components/areas/AlertasCriticos'
import { SafraSelect } from '@/components/areas/SafraSelect'
import { useGestaoAreas } from '@/hooks/useGestaoAreas'
import { useSafras } from '@/hooks/useSafras'

const NAV_HEADER = [
  { label: 'Gestão de Áreas', active: true },
]

export default function AreasPage() {
  const safraHook   = useSafras()
  const [safraId, setSafraId] = useState(() => String(safraHook.ativa?.id ?? ''))

  const { areas, carregando, erro } = useGestaoAreas(safraId ? Number(safraId) : undefined)

  const totalAreas  = areas.length
  const totalAlerta = areas.filter((a) => a.status_saude === 'estavel').length
  const totalCrit   = areas.filter((a) => a.status_saude === 'critico').length

  return (
    <AppLayout headerNavItems={NAV_HEADER}>
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Gestão de Áreas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Supervisione o desenvolvimento produtivo e a saúde biológica de cada área da propriedade.
          </p>
        </div>
        <a
          href="/areas/safras"
          className="self-start rounded-xl bg-[#0891b2] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0e7490] sm:self-auto"
        >
          Gerenciar Safras
        </a>
      </div>

      {/* Layout principal */}
      <div className="flex flex-col gap-6 lg:flex-row">

        {/* Coluna esquerda — 40% */}
        <div className="flex flex-col gap-5 lg:w-2/5">

          {/* Filtro de safra */}
          {!safraHook.carregando && (
            <SafraSelect
              safras={safraHook.registros}
              safraId={safraId}
              onChange={setSafraId}
            />
          )}

          {/* Cards de resumo */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Áreas', valor: totalAreas,  cor: 'text-slate-800' },
              { label: 'Em Alerta',   valor: totalAlerta, cor: totalAlerta > 0 ? 'text-amber-600' : 'text-slate-400' },
              { label: 'Crítico',     valor: totalCrit,   cor: totalCrit   > 0 ? 'text-red-600'   : 'text-slate-400' },
            ].map((card) => (
              <div key={card.label} className="rounded-2xl bg-white p-4 shadow-sm text-center">
                <p className={`text-2xl font-black ${card.cor}`}>{card.valor}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Alertas */}
          <AlertasCriticos areas={areas} />

          {/* Grid de AreaCards */}
          {carregando ? (
            <div className="py-8 text-center text-sm text-slate-400">Carregando áreas...</div>
          ) : erro ? (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</div>
          ) : areas.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-400 shadow-sm">
              Nenhuma área cadastrada.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {areas.map((area) => <AreaCard key={area.id} area={area} />)}
            </div>
          )}
        </div>

        {/* Coluna direita — 60% mapa */}
        <div className="lg:w-3/5">
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <MapaAreas areas={areas} altura="calc(100vh - 220px)" />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
