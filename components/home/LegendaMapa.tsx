'use client'

const itens = [
  { cor: '#22c55e', label: 'Excelente' },
  { cor: '#f59e0b', label: 'Estável' },
  { cor: '#ef4444', label: 'Crítico' },
  { cor: '#94a3b8', label: 'Sem dados' },
]

export function LegendaMapa() {
  return (
    <div className="rounded-xl bg-white/90 px-3 py-2 shadow-md backdrop-blur-sm">
      <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">Legenda</p>
      <div className="flex flex-col gap-1">
        {itens.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.cor }}
            />
            <span className="text-xs text-slate-700">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
