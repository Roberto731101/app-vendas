import type { Safra } from '@/hooks/useSafras'

type Props = {
  safras: Safra[]
  safraId: string
  onChange: (id: string) => void
  label?: string
}

export function SafraSelect({ safras, safraId, onChange, label = 'Safra' }: Props) {
  return (
    <div className="space-y-1">
      <label className="ml-1 text-xs font-bold text-slate-500">{label}</label>
      <select
        value={safraId}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border-none bg-slate-100 px-4 py-2.5 text-sm outline-none"
      >
        <option value="">Selecione a safra</option>
        {safras.map((s) => (
          <option key={s.id} value={String(s.id)}>
            {s.nome}{s.ativo ? ' ✓' : ''}
          </option>
        ))}
      </select>
    </div>
  )
}
