import type { StatusEstoque } from '@/hooks/useInsumos'

const CONFIG: Record<StatusEstoque, { dot: string; text: string; label: string }> = {
  ok:      { dot: 'bg-green-500',  text: 'text-green-700',  label: 'Estoque Ideal' },
  alerta:  { dot: 'bg-amber-400',  text: 'text-amber-600',  label: 'Atenção'       },
  critico: { dot: 'bg-red-500',    text: 'text-red-600',    label: 'Crítico'       },
}

type Props = {
  status: StatusEstoque
  mostrarIconeCritico?: boolean
}

export function StatusBadge({ status, mostrarIconeCritico = true }: Props) {
  const c = CONFIG[status]
  return (
    <span className={`flex items-center gap-1.5 ${c.text}`}>
      <span className={`h-2 w-2 rounded-full ${c.dot}`} />
      <span className="text-xs font-semibold">{c.label}</span>
      {status === 'critico' && mostrarIconeCritico && (
        <span className="text-xs">▲</span>
      )}
    </span>
  )
}
