# Money Tree (VerdeCo) - Documentação de Funcionalidades e Identidade Visual

Este documento apresenta as diretrizes de design, identidade visual e um mapeamento detalhado das funcionalidades por tela do aplicativo Money Tree.

---

## 🎨 Identidade Visual (UI/UX)

A interface do aplicativo foi desenhada com foco na clareza financeira, tranquilidade e modernidade.

- **Tema e Estilo Base**: Design minimalista inspirado em "glassmorphism" (efeito translúcido/vidro) e layouts limpos. Há suporte para temas Light e Dark (Dark Forest), priorizando uma navegação agradável que não sobrecarregue o usuário com excesso de informação.
- **Cores Principais**:
  - **Fundo**: Off-white principal (`#F8F9FA`) no tema Light, e Fundo Profundo (`#0B0F19`) no tema Dark.
  - **Superfícies (Cards)**: Branco puro (`#FFFFFF`) ou cores escuras (`#151D30`) no Dark, com bordas translúcidas sutis, utilizando cantos arredondados para uma sensação suave e tátil.
  - **Texto Principal**: Verde Floresta (`#0F5132`), transmitindo seriedade, foco e crescimento financeiro.
  - **Acentos e Ações (Tint)**: Verde Esmeralda Vibrante (`#10B981`) usado para os destaques principais, botões, abas selecionadas e entradas financeiras (sucesso).
  - **Alertas e Saídas**: Vermelho Alerta (`#EF4444`).
  - **Poupanças/Informativos**: Azul Info (`#3B82F6`).
  - **Avisos/Previsões**: Laranja/Amarelo (`#F59E0B`).
- **Gestão de Cores por Instituições Financeiras**: Utilização de paletas nativas das marcas para identificação rápida nos cartões (ex: roxo para Nubank, azul claro para Mercado Pago e Caixa, laranja para Caixa, vermelho para Bradesco, amarelo para Vale).
- **Tipografia e Elementos**: Uso de ícones vetoriais modernos (via `lucide-react-native`), sombras suaves para elevação dos elementos e micro-animações dinâmicas nas interações (como o avatar pulsante e menus de transição suave). O Logotipo exibe o texto `verdeco.` com o sufixo em destaque Esmeralda.

---

## 📱 Funcionalidades por Tela

O aplicativo é estruturado com uma navegação primária em guias (Tabs) tanto na versão Web quanto Mobile, organizando as finanças em seções claras:

### 1. Início (Dashboard / `index.tsx`)

A tela principal, servindo como centro de comando da saúde financeira do usuário.

- **Resumo Mensal (Visão Geral)**: Exibição consolidada e dinâmica de entradas, saídas e o saldo disponível para o mês selecionado.
- **Gestão de Metas (Goals)**: Funcionalidade para definir metas financeiras (ex: guardar R$ 5.000) e barra de progresso visual mostrando a porcentagem de proximidade da meta.
- **Controle de Poupanças e Caixinhas (Savings)**: Ferramenta dedicada para adição, edição e deleção de valores guardados (poupança vs caixinha), mantendo logs históricos e consolidando com o patrimônio total.
- **Gestão de Cartões de Crédito**: Área onde o usuário pode cadastrar múltiplos cartões com nome, limite total, dia de vencimento, melhor dia para compras e cor personalizada. Inclui barra de progresso individual por cartão, exibindo quanto do limite já foi comprometido no mês.
- **Projeções de Fluxo**: Capacidade do sistema prever a saúde financeira para os próximos 6 meses baseando-se em dados futuros/recorrentes.
- **Visão Macro de Saídas**: Divisão rápida e clara entre as saídas (gastos fixos/variáveis, contas recorrentes, e faturas de cartão).

### 2. Contas e Orçamento (`budget.tsx`)

A área central para gestão das transações de rotina de entrada e saída (não faturadas).

- **Cadastro de Receitas (Entradas)**: Registro de salários, freelas e entradas extras.
- **Registro de Saídas**: Lançamento de despesas do dia a dia, categorizando entre gastos fixos, variáveis ou compras esporádicas.
- **Saídas Recorrentes**: Controles específicos de contas que se repetem todos os meses, permitindo edição e replicação contínua.

### 3. Faturas (`installments.tsx`)

Gerenciamento exclusivo para dívidas assumidas, compras parceladas e todos os gastos envolvendo cartões de crédito.

- **Cadastro de Parcelamentos**: Adição de compras feitas a prazo (em parcelas), com vínculo direto aos cartões previamente cadastrados na Dashboard.
- **Controle do Mês a Mês**: Acompanhamento e detalhamento prático das faturas separadas por mês e por instituição de crédito.

### 4. Histórico (`history.tsx`)

Um "livro caixa" ou extrato consolidado.

- **Listagem Cronológica**: Visualização minuciosa e estruturada de todas as transações, incluindo lançamentos de orçamento e registros passados de cartões e poupanças.
- **Filtro Mensal e Auditoria**: Permite que o usuário retorne a meses anteriores para conferir comportamentos e validar entradas e saídas.

### 5. Gráficos (`charts.tsx`)

O painel de inteligência (Analytics) voltado à interpretação rápida do comportamento financeiro.

- **Visualização de Tendências**: Gráficos analíticos demonstrando a evolução de receitas frente a despesas ao longo do tempo.
- **Dashboard de Categorias**: Distribuição visual do peso que diferentes classes de gastos (ex: Lazer, Casa, Transporte) possuem sobre o saldo mensal.

### 6. Planos (`plans.tsx`)

A interface de controle de assinatura ou recursos da conta.

- **Vitrines de Planos**: Apresentação comparativa entre as vantagens da conta padrão e a assinatura Premium (ex: UI especial com bordas douradas, avatares diferenciados, recursos liberados).
- **Upgrade/Downgrade de Assinatura**: Ação facilitada para migração de modalidade da conta.

### 7. Ajustes / Configurações (`settings.tsx`)

O painel de controle e personalização.

- **Gerenciamento de Perfil**: Alteração de informações como nome e e-mail.
- **Preferências Visuais e Comportamentais**: Ajustes do modo de exibição (claro/escuro).
- **Privacidade e Sessão**: Permite limpeza de dados armazenados em cache localmente e realização segura do logout do app.

---

### 🔧 Telas Secundárias / Sistema

- **Painel Administrativo Global (`admin.tsx`)**: Uma interface com privilégios de superusuário que possibilita administrar a plataforma inteira (lista total de usuários, suspensão e reativação de contas, concessões de planos Premium diretas e métricas consolidadas de crescimento do sistema).
- **Autenticação (`login.tsx` e `register.tsx`)**: Fluxo nativo de entrada, registro de novos usuários e sistema de verificação.
- **Central de Notificações (`modal.tsx` / `NotificationModal`)**: Dropdown e modal pop-up integrados ao menu superior para alertar o usuário sobre faturas a vencer, limites estourados em cartões de crédito ou conquistas de metas atingidas.
