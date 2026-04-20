'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { useMovimentacoes } from '@/hooks/useMovimentacoes'
import { useInsumos } from '@/hooks/useInsumos'
import { useFazendas } from '@/hooks/useFazendas'
import { useAreas } from '@/hooks/useAreas'
import { useSetores } from '@/hooks/useSetores'
import { MovimentacaoForm } from '@/components/estoque/MovimentacaoForm'
import { MovimentacaoHistorico } from '@/components/estoque/MovimentacaoHistorico'
import type { TipoMovimentacao } from '@/hooks/useMovimentacoes'

const NAV_HEADER = [
  { label: 'Estoque' },
  { label: 'Movimentar', active: true },
]

export default function MovimentarPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const movHook = useMovimentacoes()
  const { todos: insumos } = useInsumos()
  const fazHook = useFazendas()
  const areaHook = useAreas()
  const setorHook = useSetores()

  const [tipo, setTipo] = useState<TipoMovimentacao>('entrada')
  const [insumoId, setInsumoId] = useState(searchParams.get('insumo') ?? '')
  const [quantidade, setQuantidade] = useState('')
  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [observacao, setObservacao] = useState('')
  const [fazendaId, setFazendaId] = useState('')
  const [areaId, setAreaId] = useState('')
  const [setorId, setSetorId] = useState('')

  // Cascata localização
  useEffect(() => {
    if (fazendaId) {
      areaHook.carregar()
    }
    setAreaId('')
    setSetorId('')
  }, [fazendaId])

  useEffect(() => {
    if (areaId) setorHook.carregar()
    setSetorId('')
  }, [areaId])

  const insumoSelecionado = insumos.find((i) => String(i.id) === insumoId) ?? null
  const areasFiltradas = areaHook.registros.filter((a) => String(a.fazenda_id) === fazendaId)
  const setoresFiltrados = setorHook.registros.filter((s) => String(s.area_id) === areaId)

  function resetForm() {
    setInsumoId('')
    setQuantidade('')
    setData(new Date().toISOString().slice(0, 10))
    setObservacao('')
    setFazendaId('')
    setAreaId('')
    setSetorId('')
    movHook.setErro(null)
    movHook.setMensagem(null)
  }

  async function confirmar() {
    if (!insumoId || !quantidade || !data) return
    const ok = await movHook.registrar({
      insumo_id: Number(insumoId),
      tipo_movimentacao: tipo,
      quantidade: Number(quantidade),
      unidade: insumoSelecionado?.unidade ?? '',
      data_movimentacao: data,
      fazenda_id: fazendaId ? Number(fazendaId) : null,
      area_id: areaId ? Number(areaId) : null,
      setor_id: setorId ? Number(setorId) : null,
      observacao: observacao || null,
    })
    if (ok) resetForm()
  }

  return (
    <AppLayout headerNavItems={NAV_HEADER}>
      <div className="mb-6">
        <nav className="mb-1 flex items-center gap-2 text-xs text-slate-400">
          <span>Estoque</span><span>›</span><span className="font-semibold text-slate-700">Movimentar</span>
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Movimentação de Estoque</h1>
        <p className="mt-1 text-sm text-slate-500">Registre entradas e saídas de insumos</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Formulário — 3/5 */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <MovimentacaoForm
              tipo={tipo} onSetTipo={setTipo}
              insumos={insumos} insumoId={insumoId} onSetInsumoId={setInsumoId}
              insumoSelecionado={insumoSelecionado}
              quantidade={quantidade} onSetQuantidade={setQuantidade}
              data={data} onSetData={setData}
              observacao={observacao} onSetObservacao={setObservacao}
              fazendas={fazHook.registros} fazendaId={fazendaId} onSetFazendaId={setFazendaId}
              areas={areasFiltradas} areaId={areaId} onSetAreaId={setAreaId}
              setores={setoresFiltrados} setorId={setorId} onSetSetorId={setSetorId}
              salvando={movHook.salvando}
              erro={movHook.erro} mensagem={movHook.mensagem}
              onConfirmar={confirmar}
              onCancelar={() => router.push('/estoque')}
            />
          </div>
        </div>

        {/* Histórico — 2/5 */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
              Últimas 24h
            </h3>
            <MovimentacaoHistorico
              recentes={movHook.recentes}
              carregando={movHook.carregando}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
