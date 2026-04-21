type Props = {
  nome: string
  observacao: string
  ativo: boolean
  setNome: (v: string) => void
  setObservacao: (v: string) => void
  setAtivo: (v: boolean) => void
  salvando: boolean
  erro: string | null
  mensagem: string | null
  onSalvar: () => void
  onCancelar: () => void
  editando: boolean
}

export function ClassificacaoForm({
  nome, observacao, ativo, setNome, setObservacao, setAtivo,
  salvando, erro, mensagem, onSalvar, onCancelar, editando,
}: Props) {
  return (
    <section className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wider text-[#0891b2]">
        {editando ? 'Editar Classificação' : 'Nova Classificação'}
      </h3>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="ml-1 text-xs font-bold text-slate-500">
            Nome <span className="text-red-500">*</span>
          </label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Primeira"
            className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-sm outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-xs font-bold text-slate-500">Observação</label>
          <input
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Observação opcional"
            className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setAtivo(!ativo)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            ativo ? 'bg-[#0891b2]' : 'bg-slate-300'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            ativo ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
        <span className="text-sm text-slate-600">{ativo ? 'Ativo' : 'Inativo'}</span>
      </div>

      {erro && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</div>
      )}
      {mensagem && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{mensagem}</div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onSalvar}
          disabled={salvando}
          className="rounded-xl bg-[#0891b2] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0e7490] disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : editando ? 'Atualizar' : 'Cadastrar'}
        </button>
        <button
          onClick={onCancelar}
          disabled={salvando}
          className="rounded-xl bg-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-300 disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </section>
  )
}
