'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useCategorias } from '@/hooks/useCategorias'
import type { Categoria } from '@/hooks/useCategorias'

const NAV_HEADER = [
  { label: 'Estoque' },
  { label: 'Categorias', active: true },
]

const TIPOS = ['fertilizante', 'defensivo', 'semente', 'outros']

type ModoForm = 'oculto' | 'novo' | 'editar'

export default function CategoriasPage() {
  const hook = useCategorias()
  const [modo, setModo] = useState<ModoForm>('oculto')
  const [editandoId, setEditandoId] = useState<number | undefined>(undefined)

  const [nome, setNome]         = useState('')
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo]         = useState('')
  const [ativo, setAtivo]       = useState(true)

  function abrirNovo() {
    setNome(''); setDescricao(''); setTipo(''); setAtivo(true)
    setEditandoId(undefined); setModo('novo')
    hook.setErro(null); hook.setMensagem(null)
  }

  function abrirEditar(c: Categoria) {
    setNome(c.nome_categoria); setDescricao(c.descricao ?? '')
    setTipo(c.tipo ?? ''); setAtivo(c.ativo)
    setEditandoId(c.id); setModo('editar')
    hook.setErro(null); hook.setMensagem(null)
  }

  function fechar() {
    setModo('oculto'); setEditandoId(undefined)
    hook.setErro(null); hook.setMensagem(null)
  }

  async function salvar() {
    if (!nome.trim()) {
      hook.setErro('O nome da categoria é obrigatório.')
      return
    }
    if (!tipo) {
      hook.setErro('O tipo da categoria é obrigatório.')
      return
    }
    const ok = await hook.salvar({ nome_categoria: nome.trim(), descricao: descricao || null, tipo, ativo }, editandoId)
    if (ok) fechar()
  }

  return (
    <AppLayout headerNavItems={NAV_HEADER}>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <nav className="mb-1 flex items-center gap-2 text-xs text-slate-400">
            <span>Estoque</span><span>›</span><span className="font-semibold text-slate-700">Categorias</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Categorias de Insumos</h1>
        </div>
        <button onClick={abrirNovo}
          className="rounded-xl bg-[#1a3a2a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f2419]">
          + Nova Categoria
        </button>
      </div>

      {/* Formulário */}
      {modo !== 'oculto' && (
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#1a3a2a]">
            {modo === 'novo' ? 'Nova Categoria' : 'Editar Categoria'}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-bold text-slate-500">Nome <span className="text-red-500">*</span></label>
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da categoria"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1a3a2a] focus:bg-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Tipo <span className="text-red-500">*</span></label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1a3a2a] focus:bg-white">
                <option value="">— nenhum —</option>
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="cat-ativo" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} className="h-4 w-4 rounded" />
              <label htmlFor="cat-ativo" className="text-sm font-semibold text-slate-700">Ativa</label>
            </div>
            <div className="space-y-1.5 lg:col-span-4">
              <label className="text-xs font-bold text-slate-500">Descrição</label>
              <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Opcional"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1a3a2a] focus:bg-white" />
            </div>
          </div>

          {hook.erro && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{hook.erro}</div>}
          {hook.mensagem && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{hook.mensagem}</div>}

          <div className="flex gap-3">
            <button onClick={salvar} disabled={hook.salvando}
              className="rounded-xl bg-[#1a3a2a] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0f2419] disabled:opacity-50">
              {hook.salvando ? 'Salvando...' : modo === 'editar' ? 'Atualizar' : 'Cadastrar'}
            </button>
            <button onClick={fechar} className="rounded-xl bg-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-300">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {hook.carregando ? (
          <div className="py-12 text-center text-sm text-slate-400">Carregando...</div>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Nome</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Tipo</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Descrição</th>
                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {hook.registros.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">{c.nome_categoria}</td>
                  <td className="px-5 py-4 text-sm capitalize text-slate-600">{c.tipo ?? '—'}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{c.descricao ?? '—'}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${c.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {c.ativo ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => abrirEditar(c)}
                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200">Editar</button>
                      <button onClick={() => hook.excluir(c.id)}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100">Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
              {hook.registros.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-sm text-slate-400">Nenhuma categoria cadastrada.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  )
}
