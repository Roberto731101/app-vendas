'use client'

import { useState } from 'react'
import type { CotaInsert } from '@/hooks/useCotasArea'
import type { Insumo } from '@/hooks/useInsumos'

type Props = {
  areaId: number
  safraId: number
  insumos: Insumo[]
  salvando: boolean
  erro: string | null
  onSalvar: (payload: CotaInsert) => Promise<boolean>
  onCancelar: () => void
}

export function CotaForm({ areaId, safraId, insumos, salvando, erro, onSalvar, onCancelar }: Props) {
  const [insumoId,    setInsumoId]    = useState('')
  const [quantidade,  setQuantidade]  = useState('')
  const [unidade,     setUnidade]     = useState('')
  const [observacao,  setObservacao]  = useState('')

  const insumoSelecionado = insumos.find((i) => String(i.id) === insumoId)

  function handleInsumoChange(id: string) {
    setInsumoId(id)
    const ins = insumos.find((i) => String(i.id) === id)
    if (ins) setUnidade(ins.unidade)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!insumoId || !quantidade) return
    const ok = await onSalvar({
      area_id:         areaId,
      insumo_id:       Number(insumoId),
      safra_id:        safraId,
      quantidade_cota: Number(quantidade),
      unidade:         unidade || insumoSelecionado?.unidade || '',
      observacao:      observacao || null,
    })
    if (ok) {
      setInsumoId(''); setQuantidade(''); setUnidade(''); setObservacao('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-slate-50 p-5">
      <h4 className="text-sm font-bold text-slate-700">Definir Cota de Insumo</h4>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label className="ml-1 text-xs font-bold text-slate-500">Insumo <span className="text-red-500">*</span></label>
          <select
            value={insumoId}
            onChange={(e) => handleInsumoChange(e.target.value)}
            required
            className="w-full rounded-xl border-none bg-white px-4 py-2.5 text-sm outline-none shadow-sm"
          >
            <option value="">Selecione o insumo</option>
            {insumos.filter((i) => i.ativo).map((i) => (
              <option key={i.id} value={String(i.id)}>{i.nome_insumo}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="ml-1 text-xs font-bold text-slate-500">Quantidade Cota <span className="text-red-500">*</span></label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            required
            placeholder="0.00"
            className="w-full rounded-xl border-none bg-white px-4 py-2.5 text-sm outline-none shadow-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="ml-1 text-xs font-bold text-slate-500">Unidade</label>
          <input
            type="text"
            value={unidade}
            onChange={(e) => setUnidade(e.target.value)}
            placeholder="kg, L, sc..."
            className="w-full rounded-xl border-none bg-white px-4 py-2.5 text-sm outline-none shadow-sm"
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="ml-1 text-xs font-bold text-slate-500">Observação</label>
          <input
            type="text"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Opcional"
            className="w-full rounded-xl border-none bg-white px-4 py-2.5 text-sm outline-none shadow-sm"
          />
        </div>
      </div>

      {erro && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{erro}</div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={salvando}
          className="rounded-xl bg-[#063f81] px-5 py-2 text-sm font-semibold text-white hover:bg-[#052e60] disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : 'Salvar Cota'}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-xl bg-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
