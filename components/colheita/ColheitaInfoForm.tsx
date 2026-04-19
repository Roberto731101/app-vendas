import type { Lote } from '@/types/colheita'

type Props = {
  lotes: Lote[]
  loteId: string
  dataColheita: string
  observacaoGeral: string
  setLoteId: (valor: string) => void
  setDataColheita: (valor: string) => void
  setObservacaoGeral: (valor: string) => void
  erro: string | null
  mensagem: string | null
}

export function ColheitaInfoForm({
  lotes,
  loteId,
  dataColheita,
  observacaoGeral,
  setLoteId,
  setDataColheita,
  setObservacaoGeral,
  erro,
  mensagem,
}: Props) {
  return (
    <section className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wider text-[#063f81]">
        Informações Gerais
      </h3>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-1.5">
          <label className="ml-1 text-xs font-bold text-slate-500">
            Colheita-campo
          </label>
          <select
            value={loteId}
            onChange={(e) => setLoteId(e.target.value)}
            className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-sm outline-none"
          >
            <option value="">Selecione o colheita-campo</option>
            {lotes.map((lote) => (
              <option key={lote.id} value={lote.id}>
                {lote.codigo}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-xs font-bold text-slate-500">
            Data da Colheita-registro
          </label>
          <input
            type="date"
            value={dataColheita}
            onChange={(e) => setDataColheita(e.target.value)}
            className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-sm outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-xs font-bold text-slate-500">
            Observação Geral
          </label>
          <input
            value={observacaoGeral}
            onChange={(e) => setObservacaoGeral(e.target.value)}
            placeholder="Observação geral do colheita-campo"
            className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-sm outline-none"
          />
        </div>
      </div>

      {erro && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {mensagem}
        </div>
      )}
    </section>
  )
}
