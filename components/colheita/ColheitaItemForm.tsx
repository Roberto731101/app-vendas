import type { Setor } from '@/types/colheita'

type Props = {
  setores: Setor[]
  setorId: string
  numeroCachos: string
  amostraPesoCacho: string
  observacaoLinha: string
  setSetorId: (valor: string) => void
  setNumeroCachos: (valor: string) => void
  setAmostraPesoCacho: (valor: string) => void
  setObservacaoLinha: (valor: string) => void
  salvando: boolean
  onAdicionarColheita: () => void
}

export function ColheitaItemForm({
  setores,
  setorId,
  numeroCachos,
  amostraPesoCacho,
  observacaoLinha,
  setSetorId,
  setNumeroCachos,
  setAmostraPesoCacho,
  setObservacaoLinha,
  salvando,
  onAdicionarColheita,
}: Props) {
  return (
    <section className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#063f81]">
          Adicionar Colheita
        </h3>
        <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold uppercase text-[#2b579a]">
          Entrada Rápida
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-1.5">
          <label className="ml-1 text-[10px] font-bold uppercase text-slate-500">
            Setor
          </label>
          <select
            value={setorId}
            onChange={(e) => setSetorId(e.target.value)}
            className="w-full rounded-xl border-none bg-slate-100 px-4 py-2.5 text-sm outline-none"
          >
            <option value="">Selecione...</option>
            {setores.map((setor) => (
              <option key={setor.id} value={setor.id}>
                {setor.nome} - Nº {setor.numero}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-[10px] font-bold uppercase text-slate-500">
            Número de Cachos
          </label>
          <input
            type="number"
            value={numeroCachos}
            onChange={(e) => setNumeroCachos(e.target.value)}
            placeholder="0"
            className="w-full rounded-xl border-none bg-slate-100 px-4 py-2.5 text-sm outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-[10px] font-bold uppercase text-slate-500">
            Amostra (Peso Cacho)
          </label>
          <input
            type="number"
            step="0.001"
            value={amostraPesoCacho}
            onChange={(e) => setAmostraPesoCacho(e.target.value)}
            placeholder="Opcional"
            className="w-full rounded-xl border-none bg-slate-100 px-4 py-2.5 text-sm outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-[10px] font-bold uppercase text-slate-500">
            Observação do Setor
          </label>
          <input
            value={observacaoLinha}
            onChange={(e) => setObservacaoLinha(e.target.value)}
            placeholder="Opcional"
            className="w-full rounded-xl border-none bg-slate-100 px-4 py-2.5 text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onAdicionarColheita}
          disabled={salvando}
          className="rounded-xl bg-gradient-to-r from-[#063f81] to-[#2b579a] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition active:scale-95 disabled:opacity-70"
        >
          {salvando ? 'Salvando...' : 'Salvar Colheita'}
        </button>
      </div>
    </section>
  )
}
