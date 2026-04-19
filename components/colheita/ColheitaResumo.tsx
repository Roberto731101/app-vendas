import type { Lote } from '@/types/colheita'

type Resumo = {
  totalLinhas: number
  totalCachos: number
  mediaAmostra: number
}

type Props = {
  resumo: Resumo
  loteSelecionado: Lote | null
  loteId: string
}

function numero(valor: number) {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  })
}

export function ColheitaResumo({ resumo, loteSelecionado, loteId }: Props) {
  return (
    <aside className="space-y-6 lg:col-span-4">
      <div className="sticky top-24 rounded-2xl border-t-4 border-[#063f81] bg-white p-8 shadow-sm">
        <h3 className="mb-6 flex items-center gap-2 text-lg font-extrabold text-slate-900">
          <span className="text-[#063f81]">🌾</span>
          Resumo da Colheita-registro
        </h3>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-100 p-4">
              <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">
                Setores
              </p>
              <p className="text-xl font-black text-[#063f81]">
                {resumo.totalLinhas.toString().padStart(2, '0')}
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-4">
              <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">
                Total Cachos
              </p>
              <p className="text-xl font-black text-[#063f81]">
                {resumo.totalCachos}
              </p>
            </div>

            <div className="col-span-2 rounded-xl bg-slate-100 p-4">
              <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">
                Média da Amostra
              </p>
              <p className="text-xl font-black text-[#063f81]">
                {numero(resumo.mediaAmostra)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="border-b border-slate-200 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Colheita-campo Atual
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Código
              </span>
              <span className="text-sm font-bold text-slate-900">
                {loteSelecionado?.codigo || '-'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Data referência
              </span>
              <span className="text-sm font-bold text-slate-900">
                {loteSelecionado?.data_referencia || '-'}
              </span>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-slate-200 pt-6">
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#063f81]">
              Situação
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-[#2b579a]">
                {loteId ? 'Colheita-campo Selecionado' : 'Sem Colheita-campo'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
