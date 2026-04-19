'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProdutoForm } from '@/components/produtos/ProdutoForm'
import { useProdutos } from '@/hooks/useProdutos'
import { NAV_SIDEBAR } from '@/lib/nav'

const NAV_HEADER = [
  { label: 'Vendas' },
  { label: 'Colheita-registro' },
  { label: 'Produtos', active: true },
]

export default function ProdutoFormPage() {
  const params = useParams()
  const router = useRouter()
  const { buscarPorId, salvar, salvando, erro, mensagem } = useProdutos()

  const isNovo = params.id === 'novo'
  const id = isNovo ? undefined : Number(params.id)

  const [nome, setNome] = useState('')
  const [observacao, setObservacao] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [localErro, setLocalErro] = useState<string | null>(null)

  useEffect(() => {
    if (!isNovo && id) {
      buscarPorId(id).then((data) => {
        if (data) {
          setNome(data.nome)
          setObservacao(data.observacao ?? '')
          setAtivo(data.ativo)
        }
      })
    }
  }, [id])

  async function handleSalvar() {
    if (!nome.trim()) { setLocalErro('O campo Nome é obrigatório.'); return }
    setLocalErro(null)
    const ok = await salvar({ nome: nome.trim(), observacao: observacao.trim() || null, ativo }, id)
    if (ok) router.push('/produtos')
  }

  return (
    <AppLayout sidebarNavItems={NAV_SIDEBAR} headerNavItems={NAV_HEADER}>
      <div className="mb-8">
        <nav className="mb-2 flex items-center gap-2 text-xs text-slate-500">
          <span
            onClick={() => router.push('/produtos')}
            className="cursor-pointer hover:text-[#063f81]"
          >
            Produtos
          </span>
          <span>{'>'}</span>
          <span className="font-semibold text-[#063f81]">
            {isNovo ? 'Novo Produto' : 'Editar Produto'}
          </span>
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {isNovo ? 'Novo Produto' : 'Editar Produto'}
        </h1>
      </div>

      <ProdutoForm
        nome={nome}
        observacao={observacao}
        ativo={ativo}
        setNome={setNome}
        setObservacao={setObservacao}
        setAtivo={setAtivo}
        salvando={salvando}
        erro={localErro ?? erro}
        mensagem={mensagem}
        onSalvar={handleSalvar}
        onCancelar={() => router.push('/produtos')}
        editando={!isNovo}
      />
    </AppLayout>
  )
}
