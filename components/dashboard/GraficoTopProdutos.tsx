'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { ItemRanking } from '@/hooks/useDashboardVendas'

type Props = {
  dados: ItemRanking[]
}

function formatarEixoX(valor: number): string {
  if (valor >= 1_000) return `${(valor / 1_000).toFixed(1)}t`
  return `${valor.toFixed(0)}`
}

function TooltipCustom({ active, payload, label }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-sm font-black text-amber-600">
        {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg
      </p>
    </div>
  )
}

export function GraficoTopProdutos({ dados }: Props) {
  if (dados.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        Sem dados para o período selecionado.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        layout="vertical"
        data={dados}
        margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={formatarEixoX}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="nome"
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip content={<TooltipCustom />} cursor={{ fill: '#f1f5f9' }} />
        <Bar dataKey="valor" fill="#d97706" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
