'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { FazendaForm } from '@/components/fazendas/FazendaForm'
import { useFazendas } from '@/hooks/useFazendas'
import { NAV_SIDEBAR } from '@/lib/nav'

const NAV_HEADER = [
  { label: 'Vendas' },
  { label: 'Colheita-registro' },
  { label: 'Fazendas', active: true },
]

export default function FazendaFormPage() {
  const params = useParams()
  const router = useRouter()
  const { buscarPorId, salvar, salvando, erro, mensagem } = useFazendas()

  const isNovo = params.id === 'novo'
  const id = isNovo ? undefined : Number(params.id)

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [localErro, setLocalErro] = useState<string | null>(null)

  useEffect(() => {
    if (!isNovo && id) {
      buscarPorId(id).then((data) => {
        if (data) {
          setNome(data.nome.trim())
          setDescricao(data.descricao ?? '')
        }
      })
    }
  }, [id])

  async function handleSalvar() {
    if (!nome.trim()) { setLocalErro('O campo Nome é obrigatório.'); return }
    setLocalErro(null)
    const ok = await salvar({ nome: nome.trim(), descricao: descricao.trim() || null }, id)
    if (ok) router.push('/fazendas')
  }

  return (
    <AppLayout sidebarNavItems={NAV_SIDEBAR} headerNavItems={NAV_HEADER}>
      <div className="mb-8">
        <nav className="mb-2 flex items-center gap-2 text-xs text-slate-500">
          <span
            onClick={() => router.push('/fazendas')}
            className="cursor-pointer hover:text-[#063f81]"
          >
            Fazendas
          </span>
          <span>{'>'}</span>
          <span className="font-semibold text-[#063f81]">
            {isNovo ? 'Nova Fazenda' : 'Editar Fazenda'}
          </span>
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {isNovo ? 'Nova Fazenda' : 'Editar Fazenda'}
        </h1>
      </div>

      <FazendaForm
        nome={nome}
        descricao={descricao}
        setNome={setNome}
        setDescricao={setDescricao}
        salvando={salvando}
        erro={localErro ?? erro}
        mensagem={mensagem}
        onSalvar={handleSalvar}
        onCancelar={() => router.push('/fazendas')}
        editando={!isNovo}
      />
    </AppLayout>
  )
}
