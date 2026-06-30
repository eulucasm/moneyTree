# 📝 Requisitos e Funcionalidades Mapeadas - Money Tree

Este documento lista todas as funcionalidades identificadas até o momento, divididas por módulo. Ele serve como o **Product Requirements Document (PRD)** inicial para aprovação e evolução.

---

## 1. 🏠 Módulo Início (Dashboard)
O centro de comando da saúde financeira.
- **Visão Geral Mensal**: Saldo consolidado, total de entradas e total de saídas do mês atual.
- **Gestão de Metas (Goals)**: Criação de objetivos financeiros (ex: "Viagem fim do ano R$ 5.000") com barra de progresso visual.
- **Caixinhas / Poupanças (Savings)**: Ferramenta de injeção de capital guardado, com logs de depósitos e saques, e visão do patrimônio líquido.
- **Resumo de Cartões**: Visão macro de cartões cadastrados (cores personalizadas, limite disponível x usado, dia de fechamento/vencimento).
- **Projeções de Fluxo**: Previsão de caixa para os próximos 6 meses (baseado em despesas recorrentes e parcelas de cartão ativas).

## 2. 💸 Módulo Contas e Orçamento (Rotina)
Gerenciamento de fluxo de caixa em tempo real.
- **Lançamento de Receitas**: Registro de entradas financeiras (salário, bônus, freelas).
- **Lançamento de Saídas Simples**: Registro de gastos do dia a dia (Pix, Débito, Dinheiro), categorizados entre Fixo e Variável.
- **Gestão de Contas Recorrentes**: Assinaturas, aluguel, luz, internet que se repetem automaticamente.

## 3. 💳 Módulo Faturas e Parcelamentos
Controle estrito sobre dívidas de crédito.
- **Cadastro de Compras Parceladas**: Lançamento de uma despesa dividida em "X" vezes, alocando a dívida automaticamente nos meses futuros do cartão selecionado.
- **Fechamento de Fatura**: Visão detalhada de quanto custará a fatura atual de cada cartão e transição automática de limites.

## 4. 📜 Módulo Histórico (Extrato)
O "Livro Caixa" do usuário.
- **Timeline de Transações**: Lista cronológica de absolutamente tudo o que entrou ou saiu (orçamento + parcelas pagas daquele mês).
- **Máquina do Tempo (Filtros)**: Capacidade de selecionar meses passados para conferir/auditar o comportamento.

## 5. 📊 Módulo Gráficos (Analytics)
Inteligência e interpretação dos dados.
- **Curva de Evolução**: Gráfico de linha mostrando o cruzamento de receitas x despesas nos últimos meses.
- **Pizza de Categorias**: Distribuição visual (Lazer, Casa, Transporte) para identificar ralos financeiros.

## 6. ⚙️ Módulo Configurações e Notificações
Personalização e alertas do sistema.
- **Gestão do Perfil**: Alterar nome, e-mail e senha.
- **Temas**: Suporte a Light Mode (Off-white) e Dark Mode (Dark Forest).
- **Central de Notificações**: Alertas para "Faturas próximas ao vencimento", "Limite quase estourado", ou "Meta X alcançada!".

## 7. 👑 Módulo Premium (Monetização)
Planos e Assinaturas (Se aplicável no lançamento).
- **Vitrine de Planos**: Apresentação de benefícios da conta Premium (UI exclusiva com bordas douradas).
- **Painel Administrativo Global (Admin)**: Visualização de todos os usuários da plataforma pelo "Dono" do sistema, banimentos e concessão manual de status VIP.

---
*Status deste documento: AGUARDANDO REVISÃO DO USUÁRIO.*
