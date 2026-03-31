type Props = {
  nome: string
  dataReferencia: string
  observacao: string
  setNome: (valor: string) => void
  setDataReferencia: (valor: string) => void
  setObservacao: (valor: string) => void
  salvando: boolean
  erro: string | null
  mensagem: string | null
  onSalvar: () => void
  onLimpar: () => void
}

export function LoteForm({
  nome,
  dataReferencia,
  observacao,
  setNome,
  setDataReferencia,
  setObservacao,
  salvando,
  erro,
  mensagem,
  onSalvar,
  onLimpar,
}: Props) {
  return (
    <section className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wider text-[#063f81]">
        Dados do Lote
      </h3>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-1.5">
          <label className="ml-1 text-xs font-bold text-slate-500">
            Nome do lote <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do lote"
            className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-sm outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-xs font-bold text-slate-500">
            Data de Referência
          </label>
          <input
            type="date"
            value={dataReferencia}
            onChange={(e) => setDataReferencia(e.target.value)}
            className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-sm outline-none"
          />
        </div>

        <div className="space-y-1.5 md:col-span-3">
          <label className="ml-1 text-xs font-bold text-slate-500">
            Observação
          </label>
          <input
            type="text"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Observações"
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

      <div className="flex gap-3">
        <button
          onClick={onSalvar}
          disabled={salvando}
          className="rounded-xl bg-[#063f81] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#052e60] disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : 'Salvar Lote'}
        </button>

        <button
          onClick={onLimpar}
          disabled={salvando}
          className="rounded-xl bg-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-300 disabled:opacity-50"
        >
          Limpar
        </button>
      </div>
    </section>
  )
}
