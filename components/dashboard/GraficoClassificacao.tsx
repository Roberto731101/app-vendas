'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

type ItemClassificacao = {
  classificacao: string
  valor: number
  peso: number
}

type Props = {
  dados: ItemClassificacao[]
}

const CORES = ['#063f81', '#0891b2', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

function moeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function TooltipCustom({ active, payload }: {
  active?: boolean
  payload?: { payload: ItemClassificacao }[]
}) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {item.classificacao}
      </p>
      <p className="text-sm font-black text-[#063f81]">{moeda(item.valor)}</p>
      <p className="text-xs text-slate-500">
        {item.peso.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg
      </p>
    </div>
  )
}

export function GraficoClassificacao({ dados }: Props) {
  if (dados.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        Sem dados para o período selecionado.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={dados}
          cx="50%"
          cy="45%"
          innerRadius={65}
          outerRadius={100}
          dataKey="valor"
          nameKey="classificacao"
          paddingAngle={2}
        >
          {dados.map((_, index) => (
            <Cell key={index} fill={CORES[index % CORES.length]} />
          ))}
        </Pie>
        <Tooltip content={<TooltipCustom />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="text-xs text-slate-600">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
