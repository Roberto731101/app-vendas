'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { MapaAreas } from '@/components/maps/MapaAreas'
import { EditorPoligono } from '@/components/maps/EditorPoligono'
import { CotaInsumoRow } from '@/components/areas/CotaInsumoRow'
import { CotaForm } from '@/components/areas/CotaForm'
import { SafraSelect } from '@/components/areas/SafraSelect'
import { useGestaoAreas } from '@/hooks/useGestaoAreas'
import { useSafras } from '@/hooks/useSafras'
import { useCotasArea } from '@/hooks/useCotasArea'
import { useInsumos } from '@/hooks/useInsumos'
import { useMovimentacoes } from '@/hooks/useMovimentacoes'

const STATUS_BADGE: Record<string, string> = {
  excelente: 'bg-green-100 text-green-700',
  estavel:   'bg-amber-100 text-amber-700',
  critico:   'bg-red-100 text-red-700',
}

export default function AreaDetalhePage() {
  const params      = useParams()
  const areaId      = Number(params.id)

  const safraHook   = useSafras()
  const [safraId, setSafraId] = useState('')

  useEffect(() => {
    if (safraHook.ativa && !safraId) setSafraId(String(safraHook.ativa.id))
  }, [safraHook.ativa])

  const { areas, carregando: carregandoAreas, salvarPoligono } = useGestaoAreas(safraId ? Number(safraId) : undefined)
  const area = areas.find((a) => a.id === areaId) ?? null

  const cotasHook   = useCotasArea(areaId, safraId ? Number(safraId) : undefined)
  const { todos: insumos } = useInsumos()
  const movHook     = useMovimentacoes()

  const [editandoPoligono, setEditandoPoligono] = useState(false)
  const [mostrarCotaForm,  setMostrarCotaForm]  = useState(false)

  const movimentacoesArea = movHook.registros.filter(
    (m) => String(m.area_id) === String(areaId)
  )

  const NAV_HEADER = [
    { label: 'Gestão de Áreas', active: false },
    { label: area?.nome ?? 'Área', active: true },
  ]

  if (carregandoAreas && !area) {
    return (
      <AppLayout headerNavItems={NAV_HEADER}>
        <div className="py-20 text-center text-sm text-slate-400">Carregando...</div>
      </AppLayout>
    )
  }

  if (!area) {
    return (
      <AppLayout headerNavItems={NAV_HEADER}>
        <div className="py-20 text-center text-sm text-red-500">Área não encontrada.</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout headerNavItems={NAV_HEADER}>
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{area.nome}</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_BADGE[area.status_saude]}`}>
              {area.status_saude}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{area.fazenda_nome} · Nº {area.numero}</p>
        </div>
        <div className="w-56">
          <SafraSelect
            safras={safraHook.registros}
            safraId={safraId}
            onChange={setSafraId}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">

        {/* Esquerda — Mapa */}
        <div className="flex flex-col gap-4 lg:w-3/5">
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            {editandoPoligono ? (
              <EditorPoligono
                centroInicial={area.lat && area.lng ? { lat: area.lat, lng: area.lng } : undefined}
                poligonoAtual={area.poligono}
                onSalvar={async (pts) => { await salvarPoligono(areaId, pts); setEditandoPoligono(false) }}
                altura="380px"
              />
            ) : (
              <>
                <MapaAreas areas={[area]} altura="380px" />
                <div className="mt-3 px-1">
                  <button
                    type="button"
                    onClick={() => setEditandoPoligono(true)}
                    className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    {area.poligono ? '✏ Editar Polígono' : '+ Desenhar Polígono'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Histórico de movimentações */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
              Histórico de Movimentações da Área
            </h3>
            {movHook.carregando ? (
              <p className="text-sm text-slate-400">Carregando...</p>
            ) : movimentacoesArea.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhuma movimentação registrada para esta área.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Data', 'Insumo', 'Tipo', 'Qtd', 'Responsável'].map((h) => (
                        <th key={h} className="pb-2 pr-4 text-[10px] font-black uppercase tracking-wider text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {movimentacoesArea.slice(0, 20).map((m) => (
                      <tr key={m.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-2 pr-4 text-xs text-slate-500">{m.data_movimentacao}</td>
                        <td className="py-2 pr-4 font-semibold text-slate-800">{m.nome_insumo}</td>
                        <td className="py-2 pr-4">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            m.tipo_movimentacao === 'entrada' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {m.tipo_movimentacao}
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-sm text-slate-700">
                          {m.quantidade} {m.unidade}
                        </td>
                        <td className="py-2 text-xs text-slate-500">{m.usuario_nome ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Direita — Cotas */}
        <div className="flex flex-col gap-4 lg:w-2/5">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Cotas de Insumos
              </h3>
              {safraId && (
                <button
                  type="button"
                  onClick={() => setMostrarCotaForm((v) => !v)}
                  className="rounded-xl bg-[#0891b2] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0e7490]"
                >
                  {mostrarCotaForm ? 'Cancelar' : '+ Definir Cota'}
                </button>
              )}
            </div>

            {mostrarCotaForm && safraId && (
              <div className="mb-4">
                <CotaForm
                  areaId={areaId}
                  safraId={Number(safraId)}
                  insumos={insumos}
                  salvando={cotasHook.salvando}
                  erro={cotasHook.erro}
                  onSalvar={async (p) => { const ok = await cotasHook.salvar(p); if (ok) setMostrarCotaForm(false); return ok }}
                  onCancelar={() => setMostrarCotaForm(false)}
                />
              </div>
            )}

            {!safraId ? (
              <p className="text-sm text-slate-400">Selecione uma safra para ver as cotas.</p>
            ) : cotasHook.carregando ? (
              <p className="text-sm text-slate-400">Carregando cotas...</p>
            ) : cotasHook.registros.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhuma cota definida para esta safra.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Insumo', 'Cota', 'Consumido', 'Saldo', '%', 'Status', ''].map((h) => (
                        <th key={h} className="pb-2 pr-3 text-[10px] font-black uppercase tracking-wider text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cotasHook.registros.map((cota) => (
                      <CotaInsumoRow
                        key={cota.id}
                        cota={cota}
                        onExcluir={(id) => cotasHook.excluir(id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {cotasHook.mensagem && (
              <p className="mt-3 rounded-xl bg-green-50 px-4 py-2 text-sm text-green-700">{cotasHook.mensagem}</p>
            )}
          </div>

          {/* Info resumo */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">Detalhes</h3>
            <dl className="space-y-2 text-sm">
              {[
                { label: 'Fazenda',    valor: area.fazenda_nome },
                { label: 'Número',     valor: area.numero },
                { label: 'Hectares',   valor: area.hect ? `${area.hect} ha` : '—' },
                { label: 'Polígono',   valor: area.poligono ? `${area.poligono.length} pontos` : 'Não definido' },
                { label: 'Descrição',  valor: area.descricao ?? '—' },
              ].map(({ label, valor }) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="font-semibold text-slate-500">{label}</dt>
                  <dd className="text-right text-slate-800">{valor}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
