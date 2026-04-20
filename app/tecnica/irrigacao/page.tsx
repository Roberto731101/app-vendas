import { AppLayout } from '@/components/layout/AppLayout'

const NAV_HEADER = [
  { label: 'Área Técnica' },
  { label: 'Manejo de Irrigação', active: true },
]

export default function IrrigacaoPage() {
  return (
    <AppLayout headerNavItems={NAV_HEADER}>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-5xl">💧</span>
        <h1 className="mt-6 text-2xl font-extrabold text-slate-900">Manejo de Irrigação</h1>
        <p className="mt-2 text-sm text-slate-500">Esta funcionalidade está em desenvolvimento.</p>
      </div>
    </AppLayout>
  )
}
