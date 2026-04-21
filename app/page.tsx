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

  // useFazendas retorna Fazenda[], não FazendaComHierarquia[] — cast necessário para o mapa
  const fazendasGeo = fazendas as unknown as FazendaComHierarquia[]

  const totalSetores = areas.reduce((acc: number, area) => {
    // setores não estão no AreaGeo — estimativa via hierarquia não disponível aqui
    return acc
  }, 0)

  function handleSelecionarArea(area: AreaGeo) {
    setAreaSelecionadaId(area.id)
  }

  return (
    <AppLayout headerNavItems={HEADER_NAV}>
      {/* Cabeçalho da tela */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Visão Geral da Propriedade
        </h1>
        {fazendas.length > 0 && (
          <p className="mt-0.5 text-sm text-slate-500">{fazendas[0].nome}</p>
        )}
      </div>

      {/* Cards de resumo rápido */}
      <div className="mb-6">
        <ResumoRapido
          totalFazendas={fazendas.length}
          totalAreas={areas.length}
          totalSetores={totalSetores}
          safraNome={safraAtiva?.nome ?? null}
          carregando={carregando}
        />
      </div>

      {/* Layout principal: mapa + painel lateral */}
      <div className="flex gap-4">
        {/* Mapa central */}
        <div className="flex-1 min-w-0">
          <MapaPropriedade
            areas={areas}
            fazendas={fazendasGeo}
            areaSelecionadaId={areaSelecionadaId}
            altura="calc(100vh - 240px)"
          />
        </div>

        {/* Painel lateral */}
        <div className="w-72 flex-shrink-0">
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
