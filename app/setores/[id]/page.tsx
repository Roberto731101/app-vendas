'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { SetorForm } from '@/components/setores/SetorForm'
import { useSetores } from '@/hooks/useSetores'
import { NAV_SIDEBAR } from '@/lib/nav'

const NAV_HEADER = [
  { label: 'Vendas' },
  { label: 'Colheita-registro' },
  { label: 'Setores', active: true },
]

export default function SetorFormPage() {
  const params = useParams()
  const router = useRouter()
  const { buscarPorId, salvar, salvando, erro, mensagem } = useSetores()

  const isNovo = params.id === 'novo'
  const id = isNovo ? undefined : Number(params.id)

  const [numero, setNumero] = useState('')
  const [nome, setNome] = useState('')
  const [hect, setHect] = useState('')
  const [descricao, setDescricao] = useState('')
  const [localErro, setLocalErro] = useState<string | null>(null)

  useEffect(() => {
    if (!isNovo && id) {
      buscarPorId(id).then((data) => {
        if (data) {
          setNumero(String(data.numero))
          setNome(data.nome)
          setHect(data.hect != null ? String(data.hect) : '')
          setDescricao(data.descricao ?? '')
        }
      })
    }
  }, [id])

  async function handleSalvar() {
    if (!nome.trim()) { setLocalErro('O campo Nome é obrigatório.'); return }
    if (!numero.trim() || Number.isNaN(Number(numero)) || Number(numero) <= 0) {
      setLocalErro('Informe um Número válido (maior que zero).')
      return
    }
    const hectNum = hect.trim() === '' ? null : Number(hect)
    if (hectNum !== null && (Number.isNaN(hectNum) || hectNum <= 0)) {
      setLocalErro('Hectares deve ser numérico e maior que zero.')
      return
    }
    setLocalErro(null)
    const ok = await salvar({
      numero: Number(numero),
      nome: nome.trim(),
      hect: hectNum,
      descricao: descricao.trim() || null,
    }, id)
    if (ok) router.push('/setores')
  }

  return (
    <AppLayout sidebarNavItems={NAV_SIDEBAR} headerNavItems={NAV_HEADER}>
      <div className="mb-8">
        <nav className="mb-2 flex items-center gap-2 text-xs text-slate-500">
          <span
            onClick={() => router.push('/setores')}
            className="cursor-pointer hover:text-[#063f81]"
          >
            Setores
          </span>
          <span>{'>'}</span>
          <span className="font-semibold text-[#063f81]">
            {isNovo ? 'Novo Setor' : 'Editar Setor'}
          </span>
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {isNovo ? 'Novo Setor' : 'Editar Setor'}
        </h1>
      </div>

      <SetorForm
        numero={numero}
        nome={nome}
        hect={hect}
        descricao={descricao}
        setNumero={setNumero}
        setNome={setNome}
        setHect={setHect}
        setDescricao={setDescricao}
        salvando={salvando}
        erro={localErro ?? erro}
        mensagem={mensagem}
        onSalvar={handleSalvar}
        onCancelar={() => router.push('/setores')}
        editando={!isNovo}
      />
    </AppLayout>
  )
}
