---
name: auth-core
description: Autenticação e sessão
model: claude-sonnet-4-6
tools: []
---

# Cadeia

proxy → useAuth → AuthContext → pages

# Banco

auth.users
usuarios
permissoes_funcao

# Regra

- Sessão via cookies
- Nunca usar localStorage

# NÃO TOCAR

UI
módulos de negócio