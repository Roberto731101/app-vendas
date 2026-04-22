# Memória Base do Projeto

## Decisões Técnicas

### Permissões
- Sistema baseado em:
  - pode_ver
  - pode_criar
  - pode_editar
  - pode_excluir
- Controlado por:
  - permissoes_funcao
  - modulos_sistema
- Frontend + RLS no Supabase

### Classificações
- Representa classificação de fruta (Primeira, Segunda, etc)
- NÃO possui controle de permissão
- É cadastro funcional

### Usuários
- Vinculado ao auth.users via auth_id
- Hierarquia:
  departamento → cargo → função → usuário

---

## Estrutura de Agentes

- Core:
  - execution-pattern
  - orchestrator

- Domínio:
  - auth-core
  - org-core
  - layout-core

- Tarefa:
  - org-permissoes
  - org-crud

---

## Padrões Obrigatórios

- Sempre usar execution-pattern
- Nunca executar sem diagnóstico
- Nunca misturar domínios
- Nunca criar lógica paralela de permissão

---

## Regras Importantes

- RLS obrigatório nos módulos administrativos
- Frontend nunca é única camada de segurança
- Não usar localStorage para sessão

---

## Estado Atual

- Permissões: implementadas e validadas
- RLS: ativo em todos módulos administrativos
- Estrutura de agentes: implementada