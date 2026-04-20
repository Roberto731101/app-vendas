'use client'

import { useState } from 'react'
import { APIProvider, Map, useMap, useMapsLibrary, InfoWindow } from '@vis.gl/react-google-maps'
import { useEffect } from 'react'
import type { AreaGeo, PontoGeo, StatusSaude } from '@/hooks/useGestaoAreas'

const COR_STATUS: Record<StatusSaude, string> = {
  excelente: '#22c55e',
  estavel:   '#f59e0b',
  critico:   '#ef4444',
}

// Coordenadas padrão — centro do Brasil (fallback)
const DEFAULT_CENTER = { lat: -15.77972, lng: -47.92972 }
const DEFAULT_ZOOM   = 14

type InfoAreaSelecionada = {
  area: AreaGeo
  posicao: { lat: number; lng: number }
}

type PolygonLayerProps = {
  area: AreaGeo
  onSelect: (info: InfoAreaSelecionada) => void
}

function PolygonLayer({ area, onSelect }: PolygonLayerProps) {
  const map      = useMap()
  const mapsLib  = useMapsLibrary('maps')

  useEffect(() => {
    if (!map || !mapsLib || !area.poligono || area.poligono.length === 0) return

    const cor = COR_STATUS[area.status_saude]

    const polygon = new mapsLib.Polygon({
      paths:          area.poligono,
      fillColor:      cor,
      fillOpacity:    0.35,
      strokeColor:    cor,
      strokeOpacity:  1,
      strokeWeight:   2,
      clickable:      true,
    })

    polygon.setMap(map)

    const listener = polygon.addListener('click', (e: google.maps.MapMouseEvent) => {
      const lat = e.latLng?.lat() ?? area.lat ?? DEFAULT_CENTER.lat
      const lng = e.latLng?.lng() ?? area.lng ?? DEFAULT_CENTER.lng
      onSelect({ area, posicao: { lat, lng } })
    })

    return () => {
      polygon.setMap(null)
      google.maps.event.removeListener(listener)
    }
  }, [map, mapsLib, area])

  return null
}

type Props = {
  areas: AreaGeo[]
  altura?: string
}

export function MapaAreas({ areas, altura = '420px' }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''
  const [selecionada, setSelecionada] = useState<InfoAreaSelecionada | null>(null)

  const centroPrincipal = (() => {
    const comCoordenada = areas.find((a) => a.fazenda_lat && a.fazenda_lng)
    if (comCoordenada) return { lat: comCoordenada.fazenda_lat!, lng: comCoordenada.fazenda_lng! }
    const comArea = areas.find((a) => a.lat && a.lng)
    if (comArea) return { lat: comArea.lat!, lng: comArea.lng! }
    return DEFAULT_CENTER
  })()

  if (!apiKey) {
    return (
      <div style={{ height: altura }} className="flex items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500">
        Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para exibir o mapa.
      </div>
    )
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div style={{ height: altura }} className="overflow-hidden rounded-2xl">
        <Map
          defaultCenter={centroPrincipal}
          defaultZoom={DEFAULT_ZOOM}
          mapTypeId="satellite"
          disableDefaultUI={false}
          style={{ width: '100%', height: '100%' }}
        >
          {areas.map((area) => (
            <PolygonLayer key={area.id} area={area} onSelect={setSelecionada} />
          ))}

          {selecionada && (
            <InfoWindow
              position={selecionada.posicao}
              onCloseClick={() => setSelecionada(null)}
            >
              <div className="min-w-[180px] space-y-1 p-1 text-sm">
                <p className="font-bold text-slate-900">{selecionada.area.nome}</p>
                <p className="text-xs text-slate-500">{selecionada.area.fazenda_nome}</p>
                {selecionada.area.hect && (
                  <p className="text-xs text-slate-600">{selecionada.area.hect} ha</p>
                )}
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                  selecionada.area.status_saude === 'excelente' ? 'bg-green-100 text-green-700' :
                  selecionada.area.status_saude === 'estavel'   ? 'bg-amber-100 text-amber-700' :
                                                                   'bg-red-100 text-red-700'
                }`}>
                  {selecionada.area.status_saude}
                </span>
                <div className="pt-1">
                  <a
                    href={`/areas/${selecionada.area.id}`}
                    className="text-xs font-semibold text-[#063f81] underline"
                  >
                    Ver Detalhes →
                  </a>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>

      {/* Legenda */}
      <div className="mt-2 flex items-center gap-4 px-1">
        {(['excelente', 'estavel', 'critico'] as StatusSaude[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COR_STATUS[s] }} />
            <span className="capitalize">{s}</span>
          </div>
        ))}
      </div>
    </APIProvider>
  )
}
