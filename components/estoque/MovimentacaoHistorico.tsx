import type { Movimentacao } from '@/hooks/useMovimentacoes'

type Props = {
  recentes: Movimentacao[]
  carregando: boolean
}

export function MovimentacaoHistorico({ recentes, carregando }: Props) {
  if (carregando) {
    return <div className="py-6 text-center text-sm text-slate-400">Carregando histórico...</div>
  }

  if (recentes.length === 0) {
    return <div className="py-6 text-center text-sm text-slate-400">Nenhuma movimentação nas últimas 24h.</div>
  }

  return (
    <div className="space-y-3">
      {recentes.map((m) => {
        const isEntrada = m.tipo_movimentacao === 'entrada'
        return (
          <div key={m.id} className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
            {/* Badge tipo */}
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              isEntrada
                ? 'bg-green-100 text-green-700'
                : 'bg-orange-100 text-orange-700'
            }`}>
              {isEntrada ? '↓ Entrada' : '↑ Saída'}
            </span>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 truncate">{m.nome_insumo}</p>
              {(m.fazenda_nome || m.setor_nome) && (
                <p className="text-xs text-slate-400 truncate">
                  {[m.fazenda_nome, m.area_nome, m.setor_nome].filter(Boolean).join(' › ')}
                </p>
              )}
            </div>

            {/* Quantidade */}
            <span className={`shrink-0 text-base font-black ${isEntrada ? 'text-green-700' : 'text-orange-600'}`}>
              {isEntrada ? '+' : '-'}{m.quantidade.toLocaleString('pt-BR')} {m.unidade}
            </span>
          </div>
        )
      })}
    </div>
  )
}
