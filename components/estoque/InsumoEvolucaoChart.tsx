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
import type { PontoEvolucao } from '@/hooks/useInsumoDetalhe'

type Props = {
  evolucaoEstoque: PontoEvolucao[]
  unidade: string
}

function fmtDataCurta(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

export function InsumoEvolucaoChart({ evolucaoEstoque, unidade }: Props) {
  if (evolucaoEstoque.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
          Evolução de Estoque (30 dias)
        </h2>
        <div className="flex h-40 items-center justify-center rounded-xl bg-slate-50">
          <p className="text-sm text-slate-400">Sem movimentações registradas</p>
        </div>
      </div>
    )
  }

  const dados = evolucaoEstoque.map((p) => ({
    data: fmtDataCurta(p.data),
    quantidade: p.quantidade,
  }))

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
        Evolução de Estoque (30 dias)
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={dados} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradEstoque" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0891b2" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="data"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            unit={` ${unidade}`}
            width={60}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
            }}
            formatter={(value) => [
              `${Number(value ?? 0).toLocaleString('pt-BR')} ${unidade}`,
              'Quantidade',
            ]}
          />
          <Area
            type="monotone"
            dataKey="quantidade"
            stroke="#0891b2"
            strokeWidth={2}
            fill="url(#gradEstoque)"
            dot={false}
            activeDot={{ r: 4, fill: '#0891b2' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
