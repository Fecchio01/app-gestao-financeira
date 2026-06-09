# App de Gestão Financeira Pessoal (Orçamento Base Zero)

## Visão Geral
Aplicativo local-first para gestão de finanças pessoais focado na metodologia de Orçamento Base Zero (estilo YNAB). A interface seguirá a estética "Premium Dark Mode", oferecendo um visual moderno, elegante e de alto nível (fundo escuro, glassmorphism, gradientes sutis, tipografia clara).

## Arquitetura
- **Frontend:** React + Vite
- **Linguagem:** JavaScript (JSX)
- **Estilização:** Tailwind CSS (configurado com design tokens premium)
- **Camada de Dados (Persistência):** LocalStorage via uma camada de repositório abstrata (`DataLayer`). Isso permitirá futura migração fácil para um banco em nuvem (ex: Supabase) para suportar outros usuários e sincronização.

## Estrutura da Interface (UI)
- **Dashboard:** 
  - Visão geral rápida.
  - Card "Para ser orçado" (To Be Budgeted) — dinheiro aguardando destinação.
  - Visão de saldo atual total.
- **Orçamento (Budgeting):**
  - Lista de grupos e categorias (ex: Moradia > Aluguel).
  - Controle para alocar fundos (distribuir dinheiro) em cada categoria.
  - Exibição de Saldo Disponível por categoria.
- **Transações:**
  - Lista limpa de entradas e saídas recentes.
  - Modal/painel rápido para inserção de um novo gasto (sem fricção).

## Lógica de Negócio (Base Zero)
1. **Receitas:** Todo dinheiro que entra é categorizado como "Entrada" e aumenta o montante "Para ser orçado".
2. **Alocação:** O usuário distribui o dinheiro "Para ser orçado" pelas categorias até que esse valor chegue a R$ 0.
3. **Despesas:** Todo gasto debita o saldo da categoria escolhida. Se ficar negativo, o usuário deve realocar fundos de outra categoria para cobrir.
4. **Fechamento:** Saldos não gastos rolam para o mês seguinte.

## Transição para Nuvem (Futuro)
As funções de CRUD de contas, categorias e transações estarão atrás de uma interface padronizada (ex: `api/transactions.js`). Para migrar para web/SaaS depois, basta trocar essa implementação sem mexer nas telas do React.
