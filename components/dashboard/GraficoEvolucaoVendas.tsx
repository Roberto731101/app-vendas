'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { PontoGrafico } from '@/hooks/useDashboardVendas'

type Props = {
  dados: PontoGrafico[]
}

function moeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarEixoY(valor: number): string {
  if (valor >= 1_000_000) return `${(valor / 1_000_000).toFixed(1)}M`
  if (valor >= 1_000)     return `${(valor / 1_000).toFixed(0)}k`
  return String(valor)
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
      <p className="text-sm font-black text-[#063f81]">{moeda(payload[0].value)}</p>
    </div>
  )
}

export function GraficoEvolucaoVendas({ dados }: Props) {
  if (dados.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        Sem dados para o período selecionado.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={dados} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="gradienteValor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#063f81" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#063f81" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatarEixoY}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          content={<TooltipCustom />}
          cursor={{ stroke: '#063f81', strokeWidth: 1, strokeDasharray: '4 4' }}
        />
        <Area
          type="monotone"
          dataKey="valor"
          stroke="#063f81"
          strokeWidth={2}
          fill="url(#gradienteValor)"
          dot={false}
          activeDot={{ r: 5, fill: '#063f81', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
