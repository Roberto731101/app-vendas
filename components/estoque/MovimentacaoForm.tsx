import type { TipoMovimentacao } from '@/hooks/useMovimentacoes'
import type { Insumo } from '@/hooks/useInsumos'
import type { Fazenda } from '@/hooks/useFazendas'
import type { Area } from '@/hooks/useAreas'
import type { Setor } from '@/hooks/useSetores'

type Props = {
  // Tipo de operação
  tipo: TipoMovimentacao
  onSetTipo: (t: TipoMovimentacao) => void

  // Insumo
  insumos: Insumo[]
  insumoId: string
  onSetInsumoId: (v: string) => void
  insumoSelecionado: Insumo | null

  // Quantidade / data
  quantidade: string
  onSetQuantidade: (v: string) => void
  data: string
  onSetData: (v: string) => void
  observacao: string
  onSetObservacao: (v: string) => void

  // Localização
  fazendas: Fazenda[]
  fazendaId: string
  onSetFazendaId: (v: string) => void
  areas: Area[]
  areaId: string
  onSetAreaId: (v: string) => void
  setores: Setor[]
  setorId: string
  onSetSetorId: (v: string) => void

  // Estado
  salvando: boolean
  erro: string | null
  mensagem: string | null
  onConfirmar: () => void
  onCancelar: () => void
}

export function MovimentacaoForm({
  tipo, onSetTipo,
  insumos, insumoId, onSetInsumoId, insumoSelecionado,
  quantidade, onSetQuantidade,
  data, onSetData,
  observacao, onSetObservacao,
  fazendas, fazendaId, onSetFazendaId,
  areas, areaId, onSetAreaId,
  setores, setorId, onSetSetorId,
  salvando, erro, mensagem,
  onConfirmar, onCancelar,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Tipo de operação */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onSetTipo('entrada')}
          className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-6 transition-all ${
            tipo === 'entrada'
              ? 'border-[#1a3a2a] bg-green-50'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <span className="text-3xl">↓</span>
          <span className="font-bold text-slate-900">Entrada</span>
          <span className="text-xs text-slate-500">Acúmulo de Estoque</span>
        </button>

        <button
          type="button"
          onClick={() => onSetTipo('saida')}
          className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-6 transition-all ${
            tipo === 'saida'
              ? 'border-[#1a3a2a] bg-orange-50'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <span className="text-3xl">↑</span>
          <span className="font-bold text-slate-900">Saída</span>
          <span className="text-xs text-slate-500">Consumo ou Venda</span>
        </button>
      </div>

      {/* Insumo + painel lateral */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-1.5 lg:col-span-2">
          <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            Produto / Insumo <span className="text-red-500">*</span>
          </label>
          <select
            value={insumoId}
            onChange={(e) => onSetInsumoId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#1a3a2a] focus:ring-2 focus:ring-[#1a3a2a]/10"
          >
            <option value="">— selecione o insumo —</option>
            {insumos.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nome_insumo}{i.marca_fornecedor ? ` — ${i.marca_fornecedor}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Painel do insumo selecionado */}
        {insumoSelecionado ? (
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Saldo Atual</p>
            <p className="mt-1 text-3xl font-black text-slate-900">
              {insumoSelecionado.quantidade_atual.toLocaleString('pt-BR')}
              <span className="ml-1 text-base font-semibold text-slate-400">{insumoSelecionado.unidade}</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Mínimo: {insumoSelecionado.estoque_minimo} {insumoSelecionado.unidade}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 p-4">
            <p className="text-xs text-slate-400">Selecione um insumo para ver o saldo</p>
          </div>
        )}
      </div>

      {/* Quantidade + Data */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            Quantidade ({insumoSelecionado?.unidade ?? 'un'}) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={quantidade}
            onChange={(e) => onSetQuantidade(e.target.value)}
            placeholder="0,00"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a3a2a] focus:ring-2 focus:ring-[#1a3a2a]/10"
          />
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            Data do Registro <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={data}
            onChange={(e) => onSetData(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a3a2a] focus:ring-2 focus:ring-[#1a3a2a]/10"
          />
        </div>
      </div>

      {/* Localização geográfica */}
      <div className="rounded-2xl bg-slate-50 p-5 space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Localização</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="ml-1 text-xs font-semibold text-slate-500">📍 Fazenda</label>
            <select
              value={fazendaId}
              onChange={(e) => onSetFazendaId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1a3a2a]"
            >
              <option value="">— Selecionar —</option>
              {fazendas.map((f) => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="ml-1 text-xs font-semibold text-slate-500">🗺️ Área</label>
            <select
              value={areaId}
              onChange={(e) => onSetAreaId(e.target.value)}
              disabled={!fazendaId}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1a3a2a] disabled:opacity-50"
            >
              <option value="">— Selecionar —</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.nome} ({a.numero})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="ml-1 text-xs font-semibold text-slate-500">⊞ Setor</label>
            <select
              value={setorId}
              onChange={(e) => onSetSetorId(e.target.value)}
              disabled={!areaId}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1a3a2a] disabled:opacity-50"
            >
              <option value="">— Selecionar —</option>
              {setores.map((s) => (
                <option key={s.id} value={s.id}>{s.nome} — Nº {s.numero}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Observação */}
      <div className="space-y-1.5">
        <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-400">Observação</label>
        <input
          value={observacao}
          onChange={(e) => onSetObservacao(e.target.value)}
          placeholder="Opcional"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a3a2a] focus:ring-2 focus:ring-[#1a3a2a]/10"
        />
      </div>

      {/* Feedback */}
      {erro && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</div>
      )}
      {mensagem && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{mensagem}</div>
      )}

      {/* Ações */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onConfirmar}
          disabled={salvando || !insumoId || !quantidade || !data}
          className="w-full rounded-xl bg-[#1a3a2a] py-3.5 text-sm font-bold text-white hover:bg-[#0f2419] disabled:opacity-50"
        >
          {salvando ? 'Registrando...' : '✓ Confirmar Movimentação'}
        </button>
        <button
          onClick={onCancelar}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          Cancelar e Voltar
        </button>
      </div>
    </div>
  )
}
