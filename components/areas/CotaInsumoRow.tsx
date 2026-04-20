import type { CotaInsumo } from '@/hooks/useCotasArea'

const STATUS_COR: Record<string, string> = {
  ok:      'bg-green-500',
  alerta:  'bg-amber-500',
  critico: 'bg-red-500',
}
const STATUS_LABEL: Record<string, string> = { ok: 'OK', alerta: 'Alerta', critico: 'Crítico' }
const STATUS_TEXTO: Record<string, string> = {
  ok:      'text-green-600',
  alerta:  'text-amber-600',
  critico: 'text-red-600',
}

type Props = {
  cota: CotaInsumo
  onExcluir: (id: number) => void
}

export function CotaInsumoRow({ cota, onExcluir }: Props) {
  const saldo      = cota.quantidade_cota - cota.consumido
  const pct        = Math.min(cota.percentual, 100)
  const barCor     = STATUS_COR[cota.status_cota]
  const txtCor     = STATUS_TEXTO[cota.status_cota]

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-3 pr-4 text-sm font-semibold text-slate-800">{cota.insumo_nome}</td>
      <td className="py-3 pr-4 text-right text-sm text-slate-600">
        {cota.quantidade_cota.toLocaleString('pt-BR')} {cota.unidade}
      </td>
      <td className="py-3 pr-4 text-right text-sm text-slate-600">
        {cota.consumido.toLocaleString('pt-BR')} {cota.unidade}
      </td>
      <td className={`py-3 pr-4 text-right text-sm font-semibold ${saldo < 0 ? 'text-red-600' : 'text-slate-700'}`}>
        {saldo.toLocaleString('pt-BR')} {cota.unidade}
      </td>
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200">
            <div className={`h-full rounded-full ${barCor}`} style={{ width: `${pct}%` }} />
          </div>
          <span className={`text-xs font-bold ${txtCor}`}>{cota.percentual.toFixed(0)}%</span>
        </div>
      </td>
      <td className="py-3 pr-4">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
          cota.status_cota === 'ok'      ? 'bg-green-100 text-green-700' :
          cota.status_cota === 'alerta'  ? 'bg-amber-100 text-amber-700' :
                                           'bg-red-100 text-red-700'
        }`}>
          {STATUS_LABEL[cota.status_cota]}
        </span>
      </td>
      <td className="py-3">
        <button
          type="button"
          onClick={() => onExcluir(cota.id)}
          className="text-xs text-red-400 hover:text-red-600"
        >
          Excluir
        </button>
      </td>
    </tr>
  )
}
