import type { FiltrosRelatorio, OpcaoFiltro } from '@/hooks/useRelatorios'

type Props = {
  filtros: FiltrosRelatorio
  opcoesLote: OpcaoFiltro[]
  opcoesSetor: OpcaoFiltro[]
}

function fmtData(iso: string) {
  if (!iso) return null
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}

export function RelatorioHeader({ filtros, opcoesLote, opcoesSetor }: Props) {
  const hoje = new Date().toLocaleDateString('pt-BR')

  const loteLabel = filtros.loteId
    ? (opcoesLote.find((o) => String(o.id) === filtros.loteId)?.label ?? filtros.loteId)
    : 'Todos'
  const setorLabel = filtros.setorId
    ? (opcoesSetor.find((o) => String(o.id) === filtros.setorId)?.label ?? filtros.setorId)
    : 'Todos'
  const periodoLabel = filtros.dataInicio || filtros.dataFim
    ? [fmtData(filtros.dataInicio), fmtData(filtros.dataFim)].filter(Boolean).join(' até ')
    : 'Todo o período'

  return (
    <div className="mb-6 pb-4">
      <p className="relatorio-header-empresa text-xs font-bold uppercase tracking-widest text-[#063f81]">
        NOLASCO PRODUÇÃO
      </p>
      <h1 className="relatorio-header-titulo mt-0.5 text-2xl font-extrabold text-slate-900">
        Relatório de Produção e Vendas
      </h1>

      <div className="relatorio-header-filtros mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
        <span><span className="font-semibold">Colheita-campo:</span> {loteLabel}</span>
        <span><span className="font-semibold">Setor:</span> {setorLabel}</span>
        <span><span className="font-semibold">Período:</span> {periodoLabel}</span>
        <span className="ml-auto text-slate-400">Gerado em {hoje}</span>
      </div>

      <hr className="relatorio-header-sep mt-3 border-slate-200" />
    </div>
  )
}
