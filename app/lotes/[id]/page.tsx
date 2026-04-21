'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoteForm } from '@/components/lotes/LoteForm'
import { useLotes } from '@/hooks/useLotes'
import { NAV_SIDEBAR } from '@/lib/nav'

const NAV_HEADER = [
  { label: 'Vendas' },
  { label: 'Colheita-registro' },
  { label: 'Colheita-campo', active: true },
]

export default function LoteFormPage() {
  const params = useParams()
  const router = useRouter()
  const { buscarPorId, salvar, salvando, erro, mensagem } = useLotes()

  const isNovo = params.id === 'novo'
  const id = isNovo ? undefined : Number(params.id)

  const [codigo, setCodigo] = useState('')
  const [dataReferencia, setDataReferencia] = useState('')
  const [observacao, setObservacao] = useState('')
  const [localErro, setLocalErro] = useState<string | null>(null)

  useEffect(() => {
    if (!isNovo && id) {
      buscarPorId(id).then((data) => {
        if (data) {
          setCodigo(data.codigo)
          setDataReferencia(data.data_referencia ?? '')
          setObservacao(data.observacao ?? '')
        }
      })
    }
  }, [id])

  async function handleSalvar() {
    if (!codigo.trim()) { setLocalErro('O campo Código é obrigatório.'); return }
    setLocalErro(null)
    const ok = await salvar({
      codigo: codigo.trim(),
      data_referencia: dataReferencia || null,
      observacao: observacao.trim() || null,
    }, id)
    if (ok) router.push('/lotes')
  }

  return (
    <AppLayout sidebarNavItems={NAV_SIDEBAR} headerNavItems={NAV_HEADER}>
      <div className="mb-8">
        <nav className="mb-2 flex items-center gap-2 text-xs text-slate-500">
          <span
            onClick={() => router.push('/lotes')}
            className="cursor-pointer hover:text-[#0891b2]"
          >
            Colheita-campo
          </span>
          <span>{'>'}</span>
          <span className="font-semibold text-[#0891b2]">
            {isNovo ? 'Novo Colheita-campo' : 'Editar Colheita-campo'}
          </span>
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {isNovo ? 'Novo Colheita-campo' : 'Editar Colheita-campo'}
        </h1>
      </div>

      <LoteForm
        nome={codigo}
        dataReferencia={dataReferencia}
        observacao={observacao}
        setNome={setCodigo}
        setDataReferencia={setDataReferencia}
        setObservacao={setObservacao}
        salvando={salvando}
        erro={localErro ?? erro}
        mensagem={mensagem}
        onSalvar={handleSalvar}
        onLimpar={() => router.push('/lotes')}
      />
    </AppLayout>
  )
}
