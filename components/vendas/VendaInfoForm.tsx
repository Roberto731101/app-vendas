import type { Cliente, LoteOpcao } from '@/types/venda-form'

type Props = {
  // Dados de lookup
  lotes: LoteOpcao[]
  clientes: Cliente[]

  // Valores do formulário
  loteId: string
  dataVenda: string
  ordemVenda: string
  cliente: string
  observacao: string

  // Setters
  setLoteId: (v: string) => void
  setDataVenda: (v: string) => void
  setOrdemVenda: (v: string) => void
  setCliente: (v: string) => void
  setObservacao: (v: string) => void

  // Estado de controle
  vendaFinalizada: boolean

  // Feedback
  erro: string | null
  mensagem: string | null
}

export function VendaInfoForm({
  lotes,
  clientes,
  loteId,
  dataVenda,
  ordemVenda,
  cliente,
  observacao,
  setLoteId,
  setDataVenda,
  setOrdemVenda,
  setCliente,
  setObservacao,
  vendaFinalizada,
  erro,
  mensagem,
}: Props) {
  return (
    <section className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0891b2]">
          Informações Gerais
        </h3>
        {vendaFinalizada && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-green-700">
            Venda Finalizada
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <label className="ml-1 text-xs font-bold text-slate-500">
            Lote <span className="text-red-500">*</span>
          </label>
          <select
            value={loteId}
            onChange={(e) => setLoteId(e.target.value)}
            disabled={vendaFinalizada}
            className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">Selecione o lote</option>
            {lotes.map((l) => (
              <option key={l.id} value={l.id}>
                {l.codigo}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-xs font-bold text-slate-500">
            Data da Venda
          </label>
          <input
            type="date"
            value={dataVenda}
            onChange={(e) => setDataVenda(e.target.value)}
            disabled={vendaFinalizada}
            className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-xs font-bold text-slate-500">
            Ordem de Venda
          </label>
          <input
            value={ordemVenda}
            onChange={(e) => setOrdemVenda(e.target.value)}
            placeholder="Ex: OV-2023-001"
            disabled={vendaFinalizada}
            className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-xs font-bold text-slate-500">
            Cliente
          </label>
          <select
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            disabled={vendaFinalizada}
            className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">Selecione o cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.nome}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
          <label className="ml-1 text-xs font-bold text-slate-500">
            Observação
          </label>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Notas adicionais sobre a venda..."
            rows={3}
            disabled={vendaFinalizada}
            className="w-full resize-none rounded-xl border-none bg-slate-100 px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
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
