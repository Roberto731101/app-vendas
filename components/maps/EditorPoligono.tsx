'use client'

import { useEffect, useRef, useState } from 'react'
import { APIProvider, Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps'
import type { PontoGeo } from '@/hooks/useGestaoAreas'

const DEFAULT_CENTER = { lat: -16.659231, lng: -41.856125 }

type DrawingManagerProps = {
  onPoligonoFinalizado: (pontos: PontoGeo[]) => void
}

function DrawingManagerLayer({ onPoligonoFinalizado }: DrawingManagerProps) {
  const map         = useMap()
  const drawingLib  = useMapsLibrary('drawing')
  const managerRef  = useRef<google.maps.drawing.DrawingManager | null>(null)

  useEffect(() => {
    if (!map || !drawingLib) return

    const manager = new drawingLib.DrawingManager({
      drawingMode:    drawingLib.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [drawingLib.OverlayType.POLYGON],
      },
      polygonOptions: {
        fillColor:   '#0891b2',
        fillOpacity: 0.35,
        strokeColor: '#0891b2',
        strokeWeight: 2,
        editable:    true,
      },
    })

    manager.setMap(map)
    managerRef.current = manager

    const listener = google.maps.event.addListener(
      manager,
      'polygoncomplete',
      (polygon: google.maps.Polygon) => {
        const path   = polygon.getPath()
        const pontos: PontoGeo[] = []
        for (let i = 0; i < path.getLength(); i++) {
          const pt = path.getAt(i)
          pontos.push({ lat: pt.lat(), lng: pt.lng() })
        }
        onPoligonoFinalizado(pontos)
        manager.setDrawingMode(null)
      }
    )

    return () => {
      google.maps.event.removeListener(listener)
      manager.setMap(null)
    }
  }, [map, drawingLib])

  return null
}

type Props = {
  centroInicial?: PontoGeo
  poligonoAtual?: PontoGeo[] | null
  onSalvar: (pontos: PontoGeo[]) => Promise<void>
  altura?: string
}

export function EditorPoligono({ centroInicial, poligonoAtual, onSalvar, altura = '400px' }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  if (process.env.NODE_ENV === 'development') {
    console.log('[EditorPoligono] API Key:', apiKey ? `${apiKey.slice(0, 8)}...` : 'NÃO ENCONTRADA')
  }
  const [rascunho, setRascunho]     = useState<PontoGeo[] | null>(null)
  const [salvando, setSalvando]     = useState(false)
  const [mensagem, setMensagem]     = useState<string | null>(null)

  const centro = centroInicial ?? DEFAULT_CENTER

  async function handleSalvar() {
    const pontos = rascunho
    if (!pontos || pontos.length < 3) return
    setSalvando(true)
    await onSalvar(pontos)
    setSalvando(false)
    setMensagem('Polígono salvo com sucesso.')
    setRascunho(null)
  }

  if (!apiKey) {
    return (
      <div style={{ height: altura }} className="flex items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500">
        Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para usar o editor.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} libraries={['drawing']}>
        <div style={{ height: altura }} className="overflow-hidden rounded-2xl">
          <Map
            defaultCenter={centro}
            defaultZoom={15}
            mapTypeId="satellite"
            style={{ width: '100%', height: '100%' }}
          >
            <DrawingManagerLayer onPoligonoFinalizado={setRascunho} />
          </Map>
        </div>
      </APIProvider>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSalvar}
          disabled={!rascunho || rascunho.length < 3 || salvando}
          className="rounded-xl bg-[#0891b2] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0e7490] disabled:opacity-40"
        >
          {salvando ? 'Salvando...' : 'Salvar Polígono'}
        </button>
        <button
          type="button"
          onClick={() => { setRascunho(null); setMensagem(null) }}
          disabled={!rascunho}
          className="rounded-xl bg-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300 disabled:opacity-40"
        >
          Limpar
        </button>
        {rascunho && (
          <span className="text-xs text-slate-500">{rascunho.length} pontos desenhados</span>
        )}
        {poligonoAtual && !rascunho && (
          <span className="text-xs text-green-600">Polígono atual: {poligonoAtual.length} pontos</span>
        )}
      </div>

      {mensagem && (
        <p className="rounded-xl bg-green-50 px-4 py-2 text-sm text-green-700">{mensagem}</p>
      )}
    </div>
  )
}
