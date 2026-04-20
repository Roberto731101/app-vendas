import type { AreaGeo } from '@/hooks/useGestaoAreas'

type Props = { areas: AreaGeo[] }

export function AlertasCriticos({ areas }: Props) {
  const criticos = areas.filter((a) => a.status_saude === 'critico')
  const alertas  = areas.filter((a) => a.status_saude === 'estavel')

  if (criticos.length === 0 && alertas.length === 0) return null

  return (
    <div className="space-y-2">
      {criticos.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="mb-2 text-xs font-black uppercase tracking-wider text-red-600">
            ⚠ Áreas Críticas ({criticos.length})
          </p>
          <ul className="space-y-1">
            {criticos.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-sm">
                <span className="font-semibold text-red-800">{a.nome}</span>
                <span className="text-xs text-red-600">{a.criticos} cota(s) excedida(s)</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {alertas.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="mb-2 text-xs font-black uppercase tracking-wider text-amber-600">
            Alertas ({alertas.length})
          </p>
          <ul className="space-y-1">
            {alertas.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-sm">
                <span className="font-semibold text-amber-900">{a.nome}</span>
                <span className="text-xs text-amber-700">{a.alertas} alerta(s)</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
