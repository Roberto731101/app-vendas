'use client'

import { useState, useEffect } from 'react'
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'

const DEFAULT_CENTER = { lat: -15.77972, lng: -47.92972 }
const DEFAULT_ZOOM   = 10

type Props = {
  lat: number | null
  lng: number | null
  onChange: (lat: number, lng: number) => void
  altura?: string
}

export function MapaLocalizacaoFazenda({ lat, lng, onChange, altura = '320px' }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  if (process.env.NODE_ENV === 'development') {
    console.log('[MapaLocalizacao] API Key:', apiKey ? `${apiKey.slice(0, 8)}...` : 'NÃO ENCONTRADA')
  }
  const [posicao, setPosicao] = useState<{ lat: number; lng: number } | null>(
    lat && lng ? { lat, lng } : null,
  )

  useEffect(() => {
    if (lat && lng) setPosicao({ lat, lng })
  }, [lat, lng])

  // vis.gl MapMouseEvent tem latLng em e.detail.latLng
  function handleClick(e: { detail: { latLng: { lat: number; lng: number } | null } }) {
    if (!e.detail.latLng) return
    const novaPos = { lat: e.detail.latLng.lat, lng: e.detail.latLng.lng }
    setPosicao(novaPos)
    onChange(novaPos.lat, novaPos.lng)
  }

  if (!apiKey) {
    return (
      <div
        style={{ height: altura }}
        className="flex items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500"
      >
        Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para exibir o mapa.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500">
        Clique no mapa para marcar a localização da fazenda. Arraste o marcador para ajustar.
      </p>

      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
        <div style={{ height: altura }} className="overflow-hidden rounded-2xl">
          <Map
            defaultCenter={posicao ?? DEFAULT_CENTER}
            defaultZoom={DEFAULT_ZOOM}
            mapTypeId="satellite"
            mapId="mapa-localizacao-fazenda"
            onClick={handleClick}
            style={{ width: '100%', height: '100%' }}
          >
            {posicao && (
              <AdvancedMarker
                position={posicao}
                draggable
                onDragEnd={(e: google.maps.MapMouseEvent) => {
                  if (!e.latLng) return
                  const p = { lat: e.latLng.lat(), lng: e.latLng.lng() }
                  setPosicao(p)
                  onChange(p.lat, p.lng)
                }}
              />
            )}
          </Map>
        </div>
      </APIProvider>

      {posicao && (
        <p className="text-xs text-slate-400">
          Lat: {posicao.lat.toFixed(6)} / Lng: {posicao.lng.toFixed(6)}
        </p>
      )}
    </div>
  )
}
