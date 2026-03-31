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
import type { PontoProdutividade } from '@/hooks/useDashboardProducao'

type Props = {
  dados: PontoProdutividade[]
  carregando?: boolean
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
      <p className="text-sm font-black text-teal-600">
        {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg/ha
      </p>
    </div>
  )
}

export function GraficoProdutividadeHectare({ dados, carregando }: Props) {
  if (carregando) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        Carregando...
      </div>
    )
  }
  if (dados.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        Nenhum setor com hectares cadastrados.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={dados} margin={{ top: 8, right: 16, left: 8, bottom: 48 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="setor"
          tick={{ fontSize: 11, fill: '#64748b', angle: -30, textAnchor: 'end' }}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis
          tickFormatter={(v) => `${v.toFixed(0)}`}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip content={<TooltipCustom />} cursor={{ fill: '#f1f5f9' }} />
        <Bar dataKey="kgPorHa" fill="#0d9488" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
