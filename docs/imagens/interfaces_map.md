# Mapa de Interfaces - FinanciLife

Este documento lista todos os arquivos que contêm definições de **Interfaces** (e *Types*) TypeScript criados no projeto FinanciLife. Ele detalha o caminho de cada arquivo e explica o que as interfaces ali contidas representam no domínio da aplicação. Esse mapeamento é útil para reutilizar a mesma estrutura de dados e tipagem em outros aplicativos.

---

### 1. Tipagens de Domínio Financeiro
**Arquivo:** `types/finance.ts`
**Caminho Absoluto:** [types/finance.ts](file:///c:/Users/lucas/OneDrive/Desktop/FinanciLife/types/finance.ts)

**O que representa:**
Este arquivo é o coração das regras de negócio financeiras. Ele define os tipos exatos para todas as movimentações e resumos mensais do usuário.
* **`Entry`** e **`Exit`**: Representam receitas (entradas) e despesas (saídas) normais do mês.
* **`Recurring`**: Representa os dados base de uma assinatura ou despesa recorrente que se repete mês a mês.
* **`OutflowItem`**: Um modelo de abstração geral para listagem na UI, aglomerando tanto saídas fixas, quanto variáveis, assinaturas e parcelas de cartão num único tipo.
* **`MonthSummary`**: A estrutura do balanço mensal (total de entradas, saídas, reserva do mês, sobras do mês anterior e cálculo de projeção de saldo).
* **`CreditCard`**: A estrutura de dados de um cartão de crédito.
* **`SavingsItem`**: A estrutura de uma reserva financeira (poupança, caixinha, etc.).
* **Branded Types**: Utiliza *Branded Types* (`EntryId`, `ExitId`, etc.) para garantir *nominal type safety* e evitar que IDs de domínios diferentes sejam misturados por engano no código.

---

### 2. Tipagens de Usuário
**Arquivo:** `types/user.ts`
**Caminho Absoluto:** [types/user.ts](file:///c:/Users/lucas/OneDrive/Desktop/FinanciLife/types/user.ts)

**O que representa:**
Define a entidade principal do usuário do sistema.
* **`UserProfile`**: Interface que mapeia todos os dados do usuário, como dados pessoais (nome, estado, cidade), dados de login, tipo de assinatura/plano ativo (free, pro, premium) e status da conta.

---

### 3. Tipagens do Motor de Parcelamentos
**Arquivo:** `services/installmentEngine.ts`
**Caminho Absoluto:** [services/installmentEngine.ts](file:///c:/Users/lucas/OneDrive/Desktop/FinanciLife/services/installmentEngine.ts)

**O que representa:**
Define as interfaces necessárias especificamente para a lógica de geração de parcelas em compras feitas no cartão de crédito.
* **`Purchase`**: Representa uma "Compra" mãe parcelada. Contém o valor total, número de parcelas, o cartão usado e a data de início do parcelamento.
* **`InstallmentItem`**: Representa uma fração/parcela gerada dessa compra. Contém o valor isolado daquela parcela, seu índice (ex: 1/10, 2/10) e em qual mês específico ela deve ser cobrada.

---

### 4. Tipagens do Sistema de Notificações
**Arquivo:** `hooks/useNotifications.ts`
**Caminho Absoluto:** [hooks/useNotifications.ts](file:///c:/Users/lucas/OneDrive/Desktop/FinanciLife/hooks/useNotifications.ts)

**O que representa:**
Define as estruturas de dados usadas para alertar e engajar o usuário com base no estado financeiro dele (usado localmente pelo Hook e pela Store).
* **`AppNotification`**: O formato padrão de uma notificação a ser exibida na tela. Contém tipo (crítico, alerta, info), título e mensagem.
* **`NotificationUIState`**: Interface de estado interno usada pelo *Zustand* para controlar quais notificações já foram lidas ou descartadas pelo usuário naquela sessão, evitando exibi-las novamente.
