'use client'

import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { useColheitaForm } from '@/hooks/useColheitaForm'
import { ColheitaInfoForm } from '@/components/colheita/ColheitaInfoForm'
import { ColheitaItemForm } from '@/components/colheita/ColheitaItemForm'
import { ColheitasTable } from '@/components/colheita/ColheitasTable'
import { ColheitaResumo } from '@/components/colheita/ColheitaResumo'
import { useAuthContext } from '@/contexts/AuthContext'
import { MODULOS } from '@/lib/permissoes'

const NAV_SIDEBAR = [
  { href: '/vendas',     label: 'Vendas' },
  { href: '/colheita',   label: 'Colheita-registro' },
  { href: '/setores',    label: 'Setores' },
  { href: '/relatorios', label: 'Relatórios' },
]

const NAV_HEADER = [
  { label: 'Dashboard' },
  { label: 'Vendas' },
  { label: 'Colheita-registro', active: true },
  { label: 'Relatórios' },
]

export default function ColheitaDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const { podeEditar } = useAuthContext()

  const loteIdParam = Number(params.id)
  const loteIdValido = !Number.isNaN(loteIdParam) && loteIdParam > 0
    ? loteIdParam
    : undefined

  const {
    lotes,
    setores,
    loteId,
    setLoteId,
    dataColheita,
    setDataColheita,
    observacaoGeral,
    setObservacaoGeral,
    setorId,
    setSetorId,
    numeroCachos,
    setNumeroCachos,
    amostraPesoCacho,
    setAmostraPesoCacho,
    observacaoLinha,
    setObservacaoLinha,
    colheitas,
    erro,
    mensagem,
    salvando,
    carregandoLista,
    adicionarColheita,
    limparFormulario,
    resumo,
    loteSelecionado,
  } = useColheitaForm(loteIdValido)

  return (
    <AppLayout sidebarNavItems={NAV_SIDEBAR} headerNavItems={NAV_HEADER}>
      {/* Cabeçalho */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <span>Colheita-registro</span>
            <span>{'>'}</span>
            <a
              onClick={() => router.push('/colheita')}
              className="cursor-pointer hover:text-[#0891b2]"
            >
              Histórico
            </a>
            <span>{'>'}</span>
            <span className="font-semibold text-[#0891b2]">
              {loteSelecionado ? `Colheita-campo ${loteSelecionado.codigo}` : 'Controle de Colheita-registro'}
            </span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {loteSelecionado ? `Colheita-campo ${loteSelecionado.codigo}` : 'Controle de Colheita-registro'}
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => router.push('/colheita')}
            className="rounded-xl bg-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-300"
          >
            Voltar
          </button>
          <button
            onClick={limparFormulario}
            className="rounded-xl bg-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-300"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <ColheitaInfoForm
            lotes={lotes}
            loteId={loteId}
            dataColheita={dataColheita}
            observacaoGeral={observacaoGeral}
            setLoteId={setLoteId}
            setDataColheita={setDataColheita}
            setObservacaoGeral={setObservacaoGeral}
            erro={erro}
            mensagem={mensagem}
          />

          {podeEditar(MODULOS.colheita) && (
            <ColheitaItemForm
              setores={setores}
              setorId={setorId}
              numeroCachos={numeroCachos}
              amostraPesoCacho={amostraPesoCacho}
              observacaoLinha={observacaoLinha}
              setSetorId={setSetorId}
              setNumeroCachos={setNumeroCachos}
              setAmostraPesoCacho={setAmostraPesoCacho}
              setObservacaoLinha={setObservacaoLinha}
              salvando={salvando}
              onAdicionarColheita={adicionarColheita}
            />
          )}

          <ColheitasTable
            colheitas={colheitas}
            carregando={carregandoLista}
          />
        </div>

        <ColheitaResumo
          resumo={resumo}
          loteSelecionado={loteSelecionado}
          loteId={loteId}
        />
      </div>
    </AppLayout>
  )
}
