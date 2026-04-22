# Prompt-Mestre de Execução

Usar este prompt como base para qualquer tarefa no Claude.

---

## Estrutura padrão

Siga `execution-pattern`.

Tarefa:
[descrever o objetivo completo]

Domínio:
[auth / organizacional / layout / outro]

Escopo:
[arquivos, módulo ou páginas envolvidas]

Regras:
- não sair do domínio
- não alterar arquivos fora do escopo
- não criar lógica paralela
- respeitar memória e documentação do projeto

Execução:
- ler
- diagnosticar
- planejar
- executar
- validar
- retornar resumo objetivo

---

## Exemplo 1 — organizacional

Siga `execution-pattern`.

Tarefa:
Padronizar as permissões por ação no módulo organizacional.

Domínio:
organizacional

Escopo:
- app/usuarios/page.tsx
- app/departamentos/page.tsx
- app/cargos/page.tsx
- app/funcoes/page.tsx

Regras:
- usar useAuthContext
- usar podeAcessar, podeCriar, podeEditar
- não alterar auth
- não alterar layout

Execução:
- diagnosticar inconsistências
- corrigir em lote
- validar comportamento
- retornar resumo por módulo

---

## Exemplo 2 — auth

Siga `execution-pattern`.

Tarefa:
Corrigir a cadeia de permissões do sistema.

Domínio:
auth

Escopo:
- lib/permissoes.ts
- hooks/useAuth.ts
- contexts/AuthContext.tsx

Regras:
- sessão via cookies
- nunca usar localStorage
- não tocar em UI de módulos

Execução:
- ler fluxo atual
- apontar inconsistências
- corrigir
- validar retorno das permissões
- resumir mudanças

---

## Exemplo 3 — layout

Siga `execution-pattern`.

Tarefa:
Ajustar visibilidade do menu lateral conforme permissões.

Domínio:
layout

Escopo:
- lib/nav.ts
- components/layout/Sidebar.tsx

Regras:
- item com modulo definido usa podeAcessar
- item sem modulo permanece livre
- não alterar banco
- não alterar auth

Execução:
- identificar itens inconsistentes
- corrigir vínculos de modulo
- validar visibilidade
- retornar resumo

---

## Objetivo

Garantir que toda execução seja:
- econômica em token
- previsível
- auditável
- consistente com a arquitetura do projeto