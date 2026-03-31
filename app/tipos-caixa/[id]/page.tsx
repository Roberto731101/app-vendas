'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { TipoCaixaForm } from '@/components/tipos-caixa/TipoCaixaForm'
import { useTiposCaixa } from '@/hooks/useTiposCaixa'
import { NAV_SIDEBAR } from '@/lib/nav'

const NAV_HEADER = [
  { label: 'Vendas' },
  { label: 'Colheita' },
  { label: 'Tipos de Caixa', active: true },
]

export default function TipoCaixaFormPage() {
  const params = useParams()
  const router = useRouter()
  const { buscarPorId, salvar, salvando, erro, mensagem } = useTiposCaixa()

  const isNovo = params.id === 'novo'
  const id = isNovo ? undefined : Number(params.id)

  const [nome, setNome] = useState('')
  const [pesoPadrao, setPesoPadrao] = useState('')
  const [observacao, setObservacao] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [localErro, setLocalErro] = useState<string | null>(null)

  useEffect(() => {
    if (!isNovo && id) {
      buscarPorId(id).then((data) => {
        if (data) {
          setNome(data.nome)
          setPesoPadrao(data.peso_padrao != null ? String(data.peso_padrao) : '')
          setObservacao(data.observacao ?? '')
          setAtivo(data.ativo)
        }
      })
    }
  }, [id])

  async function handleSalvar() {
    if (!nome.trim()) { setLocalErro('O campo Nome é obrigatório.'); return }
    const pesoPadraoNum = pesoPadrao.trim() === '' ? null : Number(pesoPadrao)
    if (pesoPadraoNum !== null && (Number.isNaN(pesoPadraoNum) || pesoPadraoNum <= 0)) {
      setLocalErro('Peso Padrão deve ser numérico e maior que zero.')
      return
    }
    setLocalErro(null)
    const ok = await salvar({
      nome: nome.trim(),
      peso_padrao: pesoPadraoNum,
      observacao: observacao.trim() || null,
      ativo,
    }, id)
    if (ok) router.push('/tipos-caixa')
  }

  return (
    <AppLayout sidebarNavItems={NAV_SIDEBAR} headerNavItems={NAV_HEADER}>
      <div className="mb-8">
        <nav className="mb-2 flex items-center gap-2 text-xs text-slate-500">
          <span
            onClick={() => router.push('/tipos-caixa')}
            className="cursor-pointer hover:text-[#063f81]"
          >
            Tipos de Caixa
          </span>
          <span>{'>'}</span>
          <span className="font-semibold text-[#063f81]">
            {isNovo ? 'Novo Tipo de Caixa' : 'Editar Tipo de Caixa'}
          </span>
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {isNovo ? 'Novo Tipo de Caixa' : 'Editar Tipo de Caixa'}
        </h1>
      </div>

      <TipoCaixaForm
        nome={nome}
        pesoPadrao={pesoPadrao}
        observacao={observacao}
        ativo={ativo}
        setNome={setNome}
        setPesoPadrao={setPesoPadrao}
        setObservacao={setObservacao}
        setAtivo={setAtivo}
        salvando={salvando}
        erro={localErro ?? erro}
        mensagem={mensagem}
        onSalvar={handleSalvar}
        onCancelar={() => router.push('/tipos-caixa')}
        editando={!isNovo}
      />
    </AppLayout>
  )
}
