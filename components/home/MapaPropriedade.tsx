'use client'

import { useState, useEffect } from 'react'
import { APIProvider, Map, useMap, useMapsLibrary, InfoWindow, AdvancedMarker } from '@vis.gl/react-google-maps'
import type { AreaGeo, PontoGeo, StatusSaude } from '@/hooks/useGestaoAreas'
import type { FazendaComHierarquia } from '@/hooks/useFazendas'
import { LegendaMapa } from './LegendaMapa'

const COR_STATUS: Record<StatusSaude, string> = {
  excelente: '#22c55e',
  estavel:   '#f59e0b',
  critico:   '#ef4444',
}

const DEFAULT_CENTER = { lat: -16.659231, lng: -41.856125 }
const DEFAULT_ZOOM   = 15

// ──────────────────────────────────────────────────────
// Polygon layer para uma área
// ──────────────────────────────────────────────────────
type PolygonProps = {
  area: AreaGeo
  onSelect: (area: AreaGeo, pos: { lat: number; lng: number }) => void
}

function AreaPolygon({ area, onSelect }: PolygonProps) {
  const map     = useMap()
  const mapsLib = useMapsLibrary('maps')

  useEffect(() => {
    if (!map || !mapsLib || !area.poligono || area.poligono.length === 0) return
    const cor = COR_STATUS[area.status_saude] ?? '#94a3b8'
    const polygon = new mapsLib.Polygon({
      paths:         area.poligono,
      fillColor:     cor,
      fillOpacity:   0.35,
      strokeColor:   cor,
      strokeOpacity: 1,
      strokeWeight:  2,
      clickable:     true,
    })
    polygon.setMap(map)
    const listener = polygon.addListener('click', (e: google.maps.MapMouseEvent) => {
      const lat = e.latLng?.lat() ?? area.lat ?? DEFAULT_CENTER.lat
      const lng = e.latLng?.lng() ?? area.lng ?? DEFAULT_CENTER.lng
      onSelect(area, { lat, lng })
    })
    return () => {
      polygon.setMap(null)
      google.maps.event.removeListener(listener)
    }
  }, [map, mapsLib, area])

  return null
}

// ──────────────────────────────────────────────────────
// Inner map (precisa estar dentro de APIProvider)
// ──────────────────────────────────────────────────────
type InnerProps = {
  areas: AreaGeo[]
  fazendas: FazendaComHierarquia[]
  areaSelecionadaId: number | null
  altura: string
}

function InnerMap({ areas, fazendas, areaSelecionadaId, altura }: InnerProps) {
  const map = useMap()
  const [infoArea, setInfoArea]     = useState<{ area: AreaGeo; pos: { lat: number; lng: number } } | null>(null)
  const [infoFazenda, setInfoFazenda] = useState<{ fazenda: FazendaComHierarquia; pos: { lat: number; lng: number } } | null>(null)

  // Centraliza quando uma área é selecionada externamente
  useEffect(() => {
    if (!map || !areaSelecionadaId) return
    const area = areas.find((a) => a.id === areaSelecionadaId)
    if (!area) return
    const centro = centroDaArea(area)
    if (centro) map.panTo(centro)
  }, [map, areaSelecionadaId, areas])

  function centroDaArea(area: AreaGeo): { lat: number; lng: number } | null {
    if (area.lat && area.lng) return { lat: area.lat, lng: area.lng }
    if (area.poligono && area.poligono.length > 0) {
      const lats = area.poligono.map((p: PontoGeo) => p.lat)
      const lngs = area.poligono.map((p: PontoGeo) => p.lng)
      return {
        lat: (Math.max(...lats) + Math.min(...lats)) / 2,
        lng: (Math.max(...lngs) + Math.min(...lngs)) / 2,
      }
    }
    return null
  }

  const centroPrincipal = (() => {
    const comFazenda = fazendas.find((f) => (f as FazendaComHierarquia & { lat?: number; lng?: number }).lat)
    if (comFazenda) {
      const f = comFazenda as FazendaComHierarquia & { lat: number; lng: number }
      return { lat: f.lat, lng: f.lng }
    }
    const comArea = areas.find((a) => a.fazenda_lat && a.fazenda_lng)
    if (comArea) return { lat: comArea.fazenda_lat!, lng: comArea.fazenda_lng! }
    const comCoord = areas.find((a) => a.lat && a.lng)
    if (comCoord) return { lat: comCoord.lat!, lng: comCoord.lng! }
    return DEFAULT_CENTER
  })()

  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ height: altura }}>
      <Map
        defaultCenter={centroPrincipal}
        defaultZoom={DEFAULT_ZOOM}
        mapTypeId="satellite"
        mapId="mapa-propriedade"
        disableDefaultUI={false}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Polígonos das áreas */}
        {areas.map((area) => (
          <AreaPolygon
            key={area.id}
            area={area}
            onSelect={(a, pos) => { setInfoArea({ area: a, pos }); setInfoFazenda(null) }}
          />
        ))}

        {/* Marcadores das fazendas */}
        {fazendas.map((fazenda) => {
          const f = fazenda as FazendaComHierarquia & { lat?: number; lng?: number }
          if (!f.lat || !f.lng) return null
          return (
            <AdvancedMarker
              key={fazenda.id}
              position={{ lat: f.lat, lng: f.lng }}
              onClick={() => {
                setInfoFazenda({ fazenda, pos: { lat: f.lat!, lng: f.lng! } })
                setInfoArea(null)
              }}
            />
          )
        })}

        {/* InfoWindow de fazenda */}
        {infoFazenda && (
          <InfoWindow
            position={infoFazenda.pos}
            onCloseClick={() => setInfoFazenda(null)}
          >
            <div className="min-w-[180px] space-y-1 p-1 text-sm">
              <p className="font-bold text-slate-900">📍 {infoFazenda.fazenda.nome}</p>
              <p className="text-xs text-slate-500">
                {infoFazenda.fazenda.areas?.length ?? 0} área(s)
              </p>
              <a
                href="/areas"
                className="block pt-1 text-xs font-semibold text-[#0891b2] underline"
              >
                Ver Áreas →
              </a>
            </div>
          </InfoWindow>
        )}

        {/* InfoWindow de área */}
        {infoArea && (
          <InfoWindow
            position={infoArea.pos}
            onCloseClick={() => setInfoArea(null)}
          >
            <div className="min-w-[180px] space-y-1 p-1 text-sm">
              <p className="font-bold text-slate-900">{infoArea.area.nome}</p>
              <p className="text-xs text-slate-500">{infoArea.area.fazenda_nome}</p>
              {infoArea.area.hect && (
                <p className="text-xs text-slate-600">{infoArea.area.hect} ha</p>
              )}
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                infoArea.area.status_saude === 'excelente' ? 'bg-green-100 text-green-700' :
                infoArea.area.status_saude === 'estavel'   ? 'bg-amber-100 text-amber-700' :
                                                              'bg-red-100 text-red-700'
              }`}>
                {infoArea.area.status_saude === 'excelente' ? 'Excelente' :
                 infoArea.area.status_saude === 'estavel'   ? 'Estável' : 'Crítico'}
              </span>
              <a
                href={`/areas/${infoArea.area.id}`}
                className="block pt-1 text-xs font-semibold text-[#0891b2] underline"
              >
                Ver Detalhes →
              </a>
            </div>
          </InfoWindow>
        )}
      </Map>

      {/* Legenda flutuante canto inferior esquerdo */}
      <div className="absolute bottom-8 left-4 z-10">
        <LegendaMapa />
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────
// Componente público
// ──────────────────────────────────────────────────────
type Props = {
  areas: AreaGeo[]
  fazendas: FazendaComHierarquia[]
  areaSelecionadaId: number | null
  altura?: string
}

export function MapaPropriedade({ areas, fazendas, areaSelecionadaId, altura = 'calc(100vh - 240px)' }: Props) {
  if (process.env.NODE_ENV === 'development') {
    const k = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    console.log('[MapaPropriedade] API Key:', k ? `${k.slice(0, 8)}...` : 'NÃO ENCONTRADA')
  }

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
      <InnerMap areas={areas} fazendas={fazendas} areaSelecionadaId={areaSelecionadaId} altura={altura} />
    </APIProvider>
  )
}
