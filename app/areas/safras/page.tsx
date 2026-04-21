'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useSafras } from '@/hooks/useSafras'
import type { SafraInsert } from '@/hooks/useSafras'

const NAV_HEADER = [
  { label: 'Gestão de Áreas' },
  { label: 'Safras', active: true },
]

const PAYLOAD_INICIAL: SafraInsert = {
  nome:        '',
  data_inicio: '',
  data_fim:    '',
  ativo:       true,
}

export default function SafrasPage() {
  const { registros, carregando, erro, mensagem, salvando, salvar, excluir, setErro, setMensagem } = useSafras()

  const [editandoId, setEditandoId] = useState<number | undefined>(undefined)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [payload, setPayload]       = useState<SafraInsert>(PAYLOAD_INICIAL)

  function iniciarNova() {
    setEditandoId(undefined)
    setPayload(PAYLOAD_INICIAL)
    setMostrarForm(true)
    setErro(null)
    setMensagem(null)
  }

  function iniciarEditar(id: number, item: SafraInsert) {
    setEditandoId(id)
    setPayload(item)
    setMostrarForm(true)
    setErro(null)
    setMensagem(null)
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    const ok = await salvar(payload, editandoId)
    if (ok) { setMostrarForm(false); setPayload(PAYLOAD_INICIAL); setEditandoId(undefined) }
  }

  return (
    <AppLayout headerNavItems={NAV_HEADER}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <nav className="mb-1 flex items-center gap-2 text-xs text-slate-400">
            <a href="/areas" className="hover:text-slate-600">Gestão de Áreas</a>
            <span>›</span>
            <span className="font-semibold text-slate-700">Safras</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Safras</h1>
        </div>
        <button
          type="button"
          onClick={iniciarNova}
          className="rounded-xl bg-[#0891b2] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0e7490]"
        >
          + Nova Safra
        </button>
      </div>

      {/* Formulário inline */}
      {mostrarForm && (
        <form onSubmit={handleSalvar} className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
            {editandoId ? 'Editar Safra' : 'Nova Safra'}
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1 lg:col-span-2">
              <label className="ml-1 text-xs font-bold text-slate-500">Nome <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={payload.nome}
                onChange={(e) => setPayload((p) => ({ ...p, nome: e.target.value }))}
                placeholder="Ex: Safra 2026/2027"
                className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-sm outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="ml-1 text-xs font-bold text-slate-500">Início <span className="text-red-500">*</span></label>
              <input
                type="date"
                required
                value={payload.data_inicio}
                onChange={(e) => setPayload((p) => ({ ...p, data_inicio: e.target.value }))}
                className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-sm outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="ml-1 text-xs font-bold text-slate-500">Fim <span className="text-red-500">*</span></label>
              <input
                type="date"
                required
                value={payload.data_fim}
                onChange={(e) => setPayload((p) => ({ ...p, data_fim: e.target.value }))}
                className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-sm outline-none"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={payload.ativo}
                onChange={(e) => setPayload((p) => ({ ...p, ativo: e.target.checked }))}
                className="h-4 w-4 rounded"
              />
              Safra ativa
            </label>
          </div>

          {erro && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</div>
          )}

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={salvando}
              className="rounded-xl bg-[#0891b2] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0e7490] disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : editandoId ? 'Atualizar' : 'Cadastrar'}
            </button>
            <button
              type="button"
              onClick={() => { setMostrarForm(false); setErro(null) }}
              className="rounded-xl bg-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {mensagem && (
        <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{mensagem}</div>
      )}

      {/* Tabela */}
      <div className="rounded-2xl bg-white shadow-sm">
        {carregando ? (
          <div className="py-12 text-center text-sm text-slate-400">Carregando...</div>
        ) : registros.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">Nenhuma safra cadastrada.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Nome', 'Início', 'Fim', 'Status', 'Ações'].map((h) => (
                  <th key={h} className="px-5 pb-3 pt-5 text-[10px] font-black uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {registros.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-800">{s.nome}</td>
                  <td className="px-5 py-3 text-slate-600">{s.data_inicio}</td>
                  <td className="px-5 py-3 text-slate-600">{s.data_fim}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      s.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {s.ativo ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => iniciarEditar(s.id, {
                          nome: s.nome, data_inicio: s.data_inicio,
                          data_fim: s.data_fim, ativo: s.ativo,
                        })}
                        className="text-xs font-semibold text-[#0891b2] hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => excluir(s.id)}
                        className="text-xs font-semibold text-red-500 hover:underline"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  )
}
