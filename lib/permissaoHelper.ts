import { useAuthContext } from '@/contexts/AuthContext'

export function usePermissaoModulo(modulo: string) {
  const { podeAcessar, podeCriar, podeEditar, podeExcluir } = useAuthContext()

  return {
    podeVer: podeAcessar(modulo),
    podeCriar: podeCriar(modulo),
    podeEditar: podeEditar(modulo),
    podeExcluir: podeExcluir(modulo),
  }
}