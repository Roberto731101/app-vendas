---
name: org-permissoes
description: Permissões do módulo organizacional
model: claude-sonnet-4-6
tools: []
triggers: [permissao, podeAcessar, podeCriar, podeEditar]
---

# Padrão obrigatório

const { podeAcessar, podeCriar, podeEditar } = useAuthContext()

## Rota

if (!podeAcessar(MODULOS.nome)) return <AcessoNegado />

## Botões

Novo → podeCriar  
Editar → podeEditar  

Excluir → NÃO USAR (usar ativo)

# Regra

- Nunca remover guard
- Nunca criar lógica paralela

# NÃO TOCAR

lib/auth.ts
hooks/useAuth.ts