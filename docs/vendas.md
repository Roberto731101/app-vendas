# 📊 Módulo de Vendas

## 📌 Visão Geral

O módulo de vendas é responsável pelo registro, edição e finalização de vendas de frutas, incluindo:

- Cadastro de itens
- Cálculo automático de totais
- Agrupamento por classificação
- Persistência no banco (Supabase)

---

## 🧱 Arquitetura

O módulo segue separação por responsabilidades:

```text
useVendaForm (lógica)
        ↓
page.tsx (orquestração)
        ↓
components/vendas (UI)
        ↓
components/layout (estrutura)