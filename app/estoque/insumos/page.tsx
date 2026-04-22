'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { useInsumos } from '@/hooks/useInsumos'
import { useCategorias } from '@/hooks/useCategorias'
import { InsumoTable, InsumoTableRodape } from '@/components/estoque/InsumoTable'
import type { Insumo } from '@/hooks/useInsumos'

const NAV_HEADER = [
  { label: 'Estoque' },
  { label: 'Insumos', active: true },
]

type ModoForm = 'oculto' | 'novo' | 'editar'

export default function InsumosPage() {
  const router = useRouter()
  const hook = useInsumos()
  const { registros: categorias } = useCategorias()

  const [modo, setModo] = useState<ModoForm>('oculto')
  const [editandoId, setEditandoId] = useState<number | undefined>(undefined)
  // Form state
  const [nome, setNome]             = useState('')
  const [categoriaId, setCatId]     = useState('')
  const [marca, setMarca]           = useState('')
  const [unidade, setUnidade]       = useState('kg')
  const [qtdAtual, setQtdAtual]     = useState('')
  const [estoqueMin, setEstoqueMin] = useState('')
  const [lote, setLote]             = useState('')
  const [validade, setValidade]     = useState('')
  const [ativo, setAtivo]           = useState(true)

  function abrirNovo() {
    setNome(''); setCatId(''); setMarca(''); setUnidade('kg')
    setQtdAtual(''); setEstoqueMin(''); setLote(''); setValidade(''); setAtivo(true)
    setEditandoId(undefined)
    setModo('novo')
    hook.setErro(null); hook.setMensagem(null)
  }

  function abrirEditar(i: Insumo) {
    setNome(i.nome_insumo)
    setCatId(i.categoria_id ? String(i.categoria_id) : '')
    setMarca(i.marca_fornecedor ?? '')
    setUnidade(i.unidade)
    setQtdAtual(String(i.quantidade_atual))
    setEstoqueMin(String(i.estoque_minimo))
    setLote(i.lote ?? '')
    setValidade(i.data_validade ?? '')
    setAtivo(i.ativo)
    setEditandoId(i.id)
    setModo('editar')
    hook.setErro(null); hook.setMensagem(null)
  }

  function fechar() {
    setModo('oculto'); setEditandoId(undefined)
    hook.setErro(null); hook.setMensagem(null)
  }

  async function salvar() {
    if (!nome.trim()) {
      hook.setErro('O nome do insumo é obrigatório.')
      return
    }
    if (!categoriaId) {
      hook.setErro('A categoria é obrigatória.')
      return
    }
    if (!unidade) {
      hook.setErro('A unidade é obrigatória.')
      return
    }
    const ok = await hook.salvar({
      nome_insumo: nome.trim(),
      categoria_id: Number(categoriaId),
      marca_fornecedor: marca || null,
      unidade,
      quantidade_atual: Number(qtdAtual) || 0,
      estoque_minimo: Number(estoqueMin) || 0,
      lote: lote || null,
      data_validade: validade || null,
      ativo,
    }, editandoId)
    if (ok) fechar()
  }

  function handleCategoria(id: string) {
    hook.setCategoriaId(id)
  }

  return (
    <AppLayout headerNavItems={NAV_HEADER}>
      {/* Cabeçalho */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <nav className="mb-1 flex items-center gap-2 text-xs text-slate-400">
            <span>Estoque</span><span>›</span><span className="font-semibold text-slate-700">Insumos</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Insumos</h1>
          <p className="mt-1 text-sm text-slate-500">Gerencie todos os insumos do estoque</p>
        </div>
        <button
          onClick={abrirNovo}
          className="rounded-xl bg-[#1a3a2a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f2419]"
        >
          + Novo Insumo
        </button>
      </div>

      {/* Formulário inline */}
      {modo !== 'oculto' && (
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#1a3a2a]">
            {modo === 'novo' ? 'Novo Insumo' : 'Editar Insumo'}
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-bold text-slate-500">Nome <span className="text-red-500">*</span></label>
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do insumo"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1a3a2a] focus:bg-white" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Categoria <span className="text-red-500">*</span></label>
              <select value={categoriaId} onChange={(e) => setCatId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1a3a2a] focus:bg-white">
                <option value="">— selecione —</option>
                {categorias.filter((c) => c.ativo).map((c) => (
                  <option key={c.id} value={c.id}>{c.nome_categoria}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Marca/Fornecedor</label>
              <input value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Opcional"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1a3a2a] focus:bg-white" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Unidade <span className="text-red-500">*</span></label>
              <select value={unidade} onChange={(e) => setUnidade(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1a3a2a] focus:bg-white">
                <option value="kg">kg</option>
                <option value="L">L</option>
                <option value="un">un</option>
                <option value="cx">cx</option>
                <option value="sc">sc</option>
                <option value="t">t</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Qtd. Atual</label>
              <input type="number" min="0" step="0.01" value={qtdAtual} onChange={(e) => setQtdAtual(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1a3a2a] focus:bg-white" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Estoque Mínimo</label>
              <input type="number" min="0" step="0.01" value={estoqueMin} onChange={(e) => setEstoqueMin(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1a3a2a] focus:bg-white" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Lote</label>
              <input value={lote} onChange={(e) => setLote(e.target.value)} placeholder="Opcional"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1a3a2a] focus:bg-white" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Data de Validade</label>
              <input type="date" value={validade} onChange={(e) => setValidade(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1a3a2a] focus:bg-white" />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="ativo" checked={ativo} onChange={(e) => setAtivo(e.target.checked)}
                className="h-4 w-4 rounded" />
              <label htmlFor="ativo" className="text-sm font-semibold text-slate-700">Ativo</label>
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

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={hook.filtros.busca}
          onChange={(e) => hook.setBusca(e.target.value)}
          placeholder="Buscar por nome ou lote..."
          className="flex-1 min-w-[200px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-[#1a3a2a]"
        />
        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleCategoria('')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold ${hook.filtros.categoriaId === '' ? 'bg-[#1a3a2a] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            Todos
          </button>
          {categorias.filter((c) => c.ativo).map((c) => (
            <button key={c.id} onClick={() => handleCategoria(String(c.id))}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${hook.filtros.categoriaId === String(c.id) ? 'bg-[#1a3a2a] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {c.nome_categoria}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {hook.erro && !modo && (
          <div className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{hook.erro}</div>
        )}
        {hook.carregando ? (
          <div className="py-12 text-center text-sm text-slate-400">Carregando...</div>
        ) : (
          <>
            <InsumoTable
              registros={hook.registros}
              onEditar={abrirEditar}
              onMovimentar={(i) => router.push(`/estoque/movimentar?insumo=${i.id}`)}
              onExcluir={hook.excluir}
            />
            <InsumoTableRodape registros={hook.todos} />
          </>
        )}
      </div>
    </AppLayout>
  )
}
