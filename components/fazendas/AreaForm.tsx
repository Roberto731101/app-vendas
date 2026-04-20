type Props = {
  fazendaId: number
  numero: string
  nome: string
  descricao: string
  setNumero: (v: string) => void
  setNome: (v: string) => void
  setDescricao: (v: string) => void
  salvando: boolean
  erro: string | null
  mensagem: string | null
  onSalvar: () => void
  onCancelar: () => void
  editando: boolean
}

export function AreaForm({
  numero, nome, descricao,
  setNumero, setNome, setDescricao,
  salvando, erro, mensagem, onSalvar, onCancelar, editando,
}: Props) {
  return (
    <section className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wider text-[#063f81]">
        {editando ? 'Editar Área' : 'Nova Área'}
      </h3>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-1.5">
          <label className="ml-1 text-xs font-bold text-slate-500">
            Número <span className="text-red-500">*</span>
          </label>
          <input
            value={numero ?? ''}
            onChange={(e) => setNumero(e.target.value)}
            placeholder="Ex: Area01"
            className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-sm outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-xs font-bold text-slate-500">
            Nome <span className="text-red-500">*</span>
          </label>
          <input
            value={nome ?? ''}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome da área"
            className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-sm outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-xs font-bold text-slate-500">Descrição</label>
          <input
            value={descricao ?? ''}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição opcional"
            className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-sm outline-none"
          />
        </div>
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
          className="rounded-xl bg-[#063f81] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#052e60] disabled:opacity-50"
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
