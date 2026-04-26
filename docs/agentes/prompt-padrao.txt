# Prompt Padrão de Execução

Sempre usar este formato ao solicitar tarefas ao Claude.

---

## Estrutura

Siga execution-pattern.

Tarefa:
[descrever objetivo completo]

Escopo:
[arquivos ou módulo]

Regras:
- não sair do domínio
- não alterar arquivos fora do escopo
- seguir padrões existentes

Execução:
- diagnosticar
- corrigir em lote
- validar
- retornar resumo

---

## Exemplo — organizacional

Siga execution-pattern.

Tarefa:
Corrigir completamente o módulo organizacional.

Escopo:
usuarios, departamentos, cargos, funcoes

Regras:
- aplicar padrão de permissões
- manter integridade referencial
- não alterar auth

Execução:
- identificar inconsistências
- corrigir todos os módulos
- validar comportamento completo

---

## Objetivo

- reduzir interações
- evitar retrabalho
- reduzir consumo de token
- garantir execução completa