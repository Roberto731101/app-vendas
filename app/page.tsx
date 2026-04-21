'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { MapaPropriedade } from '@/components/home/MapaPropriedade'
import { PainelStatusAreas } from '@/components/home/PainelStatusAreas'
import { ResumoRapido } from '@/components/home/ResumoRapido'
import { useGestaoAreas } from '@/hooks/useGestaoAreas'
import { useFazendas } from '@/hooks/useFazendas'
import { useSafras } from '@/hooks/useSafras'
import type { AreaGeo } from '@/hooks/useGestaoAreas'
import type { FazendaComHierarquia } from '@/hooks/useFazendas'

const HEADER_NAV = [
  { label: 'Visão Geral', active: true },
  { label: 'Vendas' },
  { label: 'Estoque' },
  { label: 'Relatórios' },
]

export default function Home() {
  const { areas, carregando: carregandoAreas } = useGestaoAreas()
  const { registros: fazendas, carregando: carregandoFazendas } = useFazendas()
  const { ativa: safraAtiva, carregando: carregandoSafra } = useSafras()
  const [areaSelecionadaId, setAreaSelecionadaId] = useState<number | null>(null)

  const carregando = carregandoAreas || carregandoFazendas || carregandoSafra
  const fazendasGeo = fazendas as unknown as FazendaComHierarquia[]

  function handleSelecionarArea(area: AreaGeo) {
    setAreaSelecionadaId(area.id)
  }

  return (
    <AppLayout headerNavItems={HEADER_NAV}>
      {/* Cabeçalho */}
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Visão Geral da Propriedade
        </h1>
        {fazendas.length > 0 && (
          <p className="mt-0.5 text-sm text-slate-500">{fazendas[0].nome}</p>
        )}
      </div>

      {/* Cards de resumo — 3 colunas mobile, 4 desktop */}
      <div className="mb-4">
        <ResumoRapido
          totalFazendas={fazendas.length}
          totalAreas={areas.length}
          safraNome={safraAtiva?.nome ?? null}
          carregando={carregando}
        />
      </div>

      {/* Layout principal: empilhado no mobile, lado a lado no desktop */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Mapa — altura fixa 288px mobile, 100% do wrapper desktop */}
        <div className="w-full h-72 min-w-0 lg:flex-1 lg:h-[calc(100vh-260px)]">
          <MapaPropriedade
            areas={areas}
            fazendas={fazendasGeo}
            areaSelecionadaId={areaSelecionadaId}
            altura="100%"
          />
        </div>

        {/* Painel status — largura total mobile, 288px desktop */}
        <div className="w-full lg:w-72 lg:flex-shrink-0">
          <PainelStatusAreas
            areas={areas}
            carregando={carregandoAreas}
            onSelecionarArea={handleSelecionarArea}
          />
        </div>
      </div>
    </AppLayout>
  )
}
