'use client'

import { useCallback, useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useFazendas } from '@/hooks/useFazendas'
import { useAreas } from '@/hooks/useAreas'
import { useSetores } from '@/hooks/useSetores'
import { FazendaForm } from '@/components/fazendas/FazendaForm'
import { AreaForm } from '@/components/fazendas/AreaForm'
import { HierarquiaView } from '@/components/fazendas/HierarquiaView'
import { NAV_SIDEBAR } from '@/lib/nav'
import type { FazendaComHierarquia, AreaHierarquia, SetorHierarquia } from '@/hooks/useFazendas'
import type { Area } from '@/hooks/useAreas'
import type { Setor } from '@/hooks/useSetores'

const NAV_HEADER = [
  { label: 'Vendas' },
  { label: 'Colheita-registro' },
  { label: 'Fazendas', active: true },
]

type ModoFazenda = 'selecionar' | 'nova' | 'editar'
type ModoArea = 'oculto' | 'selecionar' | 'nova' | 'editar'
type ModoSetor = 'oculto' | 'novo' | 'editar'

export default function FazendasPage() {
  // ── Fazendas ──────────────────────────────────────────────────────────────
  const fazHook = useFazendas()
  const [hierarquia, setHierarquia] = useState<FazendaComHierarquia[]>([])
  const [fazendaSelecionadaId, setFazendaSelecionadaId] = useState<number | null>(null)
  const [fazendaEditandoId, setFazendaEditandoId] = useState<number | undefined>(undefined)
  const [modoFazenda, setModoFazenda] = useState<ModoFazenda>('selecionar')
  const [fNome, setFNome] = useState('')
  const [fDescricao, setFDescricao] = useState('')

  // ── Áreas ─────────────────────────────────────────────────────────────────
  const areaHook = useAreas(fazendaSelecionadaId ?? undefined)
  const [areaEditandoId, setAreaEditandoId] = useState<number | undefined>(undefined)
  const [modoArea, setModoArea] = useState<ModoArea>('oculto')
  const [aNome, setANome] = useState('')
  const [aNumero, setANumero] = useState('')
  const [aDescricao, setADescricao] = useState('')
  const [areaSelecionadaId, setAreaSelecionadaId] = useState<number | null>(null)

  // ── Setores ───────────────────────────────────────────────────────────────
  const setorHook = useSetores()
  const [setorEditandoId, setSetorEditandoId] = useState<number | undefined>(undefined)
  const [modoSetor, setModoSetor] = useState<ModoSetor>('oculto')
  const [sNome, setSNome] = useState('')
  const [sNumero, setSNumero] = useState('')
  const [sHect, setSHect] = useState('')
  const [sDescricao, setSDescricao] = useState('')

  // ── Carregar hierarquia completa ──────────────────────────────────────────
  const recarregarHierarquia = useCallback(async () => {
    const data = await fazHook.buscarTodasComHierarquia()
    setHierarquia(data)
  }, [fazHook.buscarTodasComHierarquia])

  useEffect(() => { recarregarHierarquia() }, [fazHook.registros, areaHook.registros, setorHook.registros])

  // ── Handlers Fazenda ──────────────────────────────────────────────────────
  function iniciarNovaFazenda() {
    setFNome(''); setFDescricao('')
    setFazendaEditandoId(undefined)
    setModoFazenda('nova')
    setModoArea('oculto')
    setModoSetor('oculto')
    setFazendaSelecionadaId(null)
  }

  function iniciarEditarFazenda(fazenda: FazendaComHierarquia) {
    setFNome(fazenda.nome); setFDescricao(fazenda.descricao ?? '')
    setFazendaEditandoId(fazenda.id)
    setModoFazenda('editar')
  }

  async function salvarFazenda() {
    const ok = await fazHook.salvar({ nome: fNome, descricao: fDescricao || null }, fazendaEditandoId)
    if (ok) { setModoFazenda('selecionar'); setFazendaEditandoId(undefined) }
  }

  function cancelarFazenda() {
    setModoFazenda('selecionar'); setFazendaEditandoId(undefined)
    setFNome(''); setFDescricao('')
  }

  function selecionarFazenda(id: number) {
    setFazendaSelecionadaId(id)
    setModoFazenda('selecionar')
    setModoArea('selecionar')
    setModoSetor('oculto')
    setAreaSelecionadaId(null)
    fazHook.setErro(null); fazHook.setMensagem(null)
  }

  // ── Handlers Área ─────────────────────────────────────────────────────────
  function iniciarNovaArea(fazendaId?: number) {
    if (fazendaId) setFazendaSelecionadaId(fazendaId)
    setANome(''); setANumero(''); setADescricao('')
    setAreaEditandoId(undefined)
    setModoArea('nova')
    setModoSetor('oculto')
  }

  function iniciarEditarArea(area: Area | AreaHierarquia) {
    setFazendaSelecionadaId(area.fazenda_id)
    setANome(area.nome); setANumero(area.numero); setADescricao(area.descricao ?? '')
    setAreaEditandoId(area.id)
    setModoArea('editar')
  }

  async function salvarArea() {
    if (!fazendaSelecionadaId) return
    const ok = await areaHook.salvar(
      { fazenda_id: fazendaSelecionadaId, numero: aNumero, nome: aNome, descricao: aDescricao || null },
      areaEditandoId,
    )
    if (ok) { setModoArea('selecionar'); setAreaEditandoId(undefined) }
  }

  function cancelarArea() {
    setModoArea(fazendaSelecionadaId ? 'selecionar' : 'oculto')
    setAreaEditandoId(undefined)
    setANome(''); setANumero(''); setADescricao('')
  }

  function selecionarArea(id: number) {
    setAreaSelecionadaId(id)
    setModoArea('selecionar')
    setModoSetor('novo')
    setSNome(''); setSNumero(''); setSHect(''); setSDescricao('')
    setSetorEditandoId(undefined)
    areaHook.setErro(null); areaHook.setMensagem(null)
  }

  // ── Handlers Setor ────────────────────────────────────────────────────────
  function iniciarNovoSetor(areaId: number) {
    setAreaSelecionadaId(areaId)
    setSNome(''); setSNumero(''); setSHect(''); setSDescricao('')
    setSetorEditandoId(undefined)
    setModoSetor('novo')
  }

  function iniciarEditarSetor(setor: Setor | SetorHierarquia) {
    setSNome(setor.nome)
    setSNumero(String(setor.numero))
    setSHect(setor.hect != null ? String(setor.hect) : '')
    setSDescricao(setor.descricao ?? '')
    setSetorEditandoId(setor.id)
    setModoSetor('editar')
  }

  async function salvarSetor() {
    const ok = await setorHook.salvar(
      {
        numero: Number(sNumero),
        nome: sNome,
        hect: sHect ? Number(sHect) : null,
        descricao: sDescricao || null,
      },
      setorEditandoId,
    )
    if (ok) { setModoSetor('oculto'); setSetorEditandoId(undefined) }
  }

  function cancelarSetor() {
    setModoSetor(areaSelecionadaId ? 'oculto' : 'oculto')
    setSetorEditandoId(undefined)
    setSNome(''); setSNumero(''); setSHect(''); setSDescricao('')
  }

  const fazendaSelecionada = fazHook.registros.find((f) => f.id === fazendaSelecionadaId)
  const areaSelecionada = areaHook.registros.find((a) => a.id === areaSelecionadaId)

  return (
    <AppLayout sidebarNavItems={NAV_SIDEBAR} headerNavItems={NAV_HEADER}>
      <div className="mb-8">
        <nav className="mb-2 flex items-center gap-2 text-xs text-slate-500">
          <span>Cadastros</span>
          <span>{'>'}</span>
          <span className="font-semibold text-[#063f81]">Fazendas</span>
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Fazendas</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── COLUNA ESQUERDA: Formulário em cascata ── */}
        <div className="space-y-4">
          {/* Seção 1 — Fazenda */}
          <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#063f81]">1. Fazenda</h3>
              <button
                onClick={iniciarNovaFazenda}
                className="rounded-lg bg-[#063f81]/10 px-3 py-1.5 text-xs font-bold text-[#063f81] hover:bg-[#063f81]/20"
              >
                + Nova
              </button>
            </div>

            {fazHook.erro && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{fazHook.erro}</div>
            )}
            {fazHook.mensagem && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{fazHook.mensagem}</div>
            )}

            {modoFazenda === 'selecionar' && (
              <div className="space-y-1.5">
                <label className="ml-1 text-xs font-bold text-slate-500">Selecionar fazenda existente</label>
                <select
                  value={fazendaSelecionadaId ?? ''}
                  onChange={(e) => e.target.value ? selecionarFazenda(Number(e.target.value)) : setFazendaSelecionadaId(null)}
                  className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-sm outline-none"
                >
                  <option value="">— selecione —</option>
                  {fazHook.registros.map((f) => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
                  ))}
                </select>
              </div>
            )}

            {(modoFazenda === 'nova' || modoFazenda === 'editar') && (
              <FazendaForm
                nome={fNome} descricao={fDescricao}
                setNome={setFNome} setDescricao={setFDescricao}
                salvando={fazHook.salvando}
                erro={null} mensagem={null}
                onSalvar={salvarFazenda}
                onCancelar={cancelarFazenda}
                editando={modoFazenda === 'editar'}
              />
            )}
          </div>

          {/* Seção 2 — Área (aparece após selecionar fazenda) */}
          {fazendaSelecionadaId && modoArea !== 'oculto' && (
            <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#063f81]">
                  2. Área
                  {fazendaSelecionada && (
                    <span className="ml-2 font-normal text-slate-500 normal-case">de {fazendaSelecionada.nome}</span>
                  )}
                </h3>
                <button
                  onClick={() => iniciarNovaArea()}
                  className="rounded-lg bg-[#063f81]/10 px-3 py-1.5 text-xs font-bold text-[#063f81] hover:bg-[#063f81]/20"
                >
                  + Nova
                </button>
              </div>

              {areaHook.erro && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{areaHook.erro}</div>
              )}
              {areaHook.mensagem && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{areaHook.mensagem}</div>
              )}

              {(modoArea === 'selecionar') && (
                <div className="space-y-1.5">
                  <label className="ml-1 text-xs font-bold text-slate-500">Selecionar área existente</label>
                  <select
                    value={areaSelecionadaId ?? ''}
                    onChange={(e) => e.target.value ? selecionarArea(Number(e.target.value)) : setAreaSelecionadaId(null)}
                    className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-sm outline-none"
                  >
                    <option value="">— selecione —</option>
                    {areaHook.registros.map((a) => (
                      <option key={a.id} value={a.id}>{a.nome} ({a.numero})</option>
                    ))}
                  </select>
                </div>
              )}

              {(modoArea === 'nova' || modoArea === 'editar') && (
                <AreaForm
                  fazendaId={fazendaSelecionadaId}
                  numero={aNumero} nome={aNome} descricao={aDescricao}
                  setNumero={setANumero} setNome={setANome} setDescricao={setADescricao}
                  salvando={areaHook.salvando}
                  erro={null} mensagem={null}
                  onSalvar={salvarArea}
                  onCancelar={cancelarArea}
                  editando={modoArea === 'editar'}
                />
              )}
            </div>
          )}

          {/* Seção 3 — Setor (aparece após selecionar área) */}
          {areaSelecionadaId && modoSetor !== 'oculto' && (
            <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#063f81]">
                3. Setor
                {areaSelecionada && (
                  <span className="ml-2 font-normal text-slate-500 normal-case">de {areaSelecionada.nome}</span>
                )}
              </h3>

              {setorHook.erro && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{setorHook.erro}</div>
              )}
              {setorHook.mensagem && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{setorHook.mensagem}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="ml-1 text-xs font-bold text-slate-500">
                    Número <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={sNumero}
                    onChange={(e) => setSNumero(e.target.value)}
                    placeholder="Ex: 1"
                    className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-sm outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="ml-1 text-xs font-bold text-slate-500">
                    Nome <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={sNome}
                    onChange={(e) => setSNome(e.target.value)}
                    placeholder="Nome do setor"
                    className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-sm outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="ml-1 text-xs font-bold text-slate-500">Hectares</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sHect}
                    onChange={(e) => setSHect(e.target.value)}
                    placeholder="Ex: 1.70"
                    className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-sm outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="ml-1 text-xs font-bold text-slate-500">Descrição</label>
                  <input
                    value={sDescricao}
                    onChange={(e) => setSDescricao(e.target.value)}
                    placeholder="Opcional"
                    className="w-full rounded-xl border-none bg-slate-100 px-4 py-3 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={salvarSetor}
                  disabled={setorHook.salvando}
                  className="rounded-xl bg-[#063f81] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#052e60] disabled:opacity-50"
                >
                  {setorHook.salvando ? 'Salvando...' : modoSetor === 'editar' ? 'Atualizar' : 'Cadastrar'}
                </button>
                <button
                  onClick={cancelarSetor}
                  disabled={setorHook.salvando}
                  className="rounded-xl bg-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-300 disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── COLUNA DIREITA: Hierarquia visual ── */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white px-6 py-4 shadow-sm flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#063f81]">Estrutura</h3>
            <button
              onClick={recarregarHierarquia}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Atualizar
            </button>
          </div>

          <HierarquiaView
            fazendas={hierarquia}
            onEditarFazenda={iniciarEditarFazenda}
            onExcluirFazenda={fazHook.excluir}
            onNovaArea={iniciarNovaArea}
            onEditarArea={iniciarEditarArea}
            onExcluirArea={areaHook.excluir}
            onNovoSetor={iniciarNovoSetor}
            onEditarSetor={iniciarEditarSetor}
            onExcluirSetor={setorHook.excluir}
          />
        </div>
      </div>
    </AppLayout>
  )
}
