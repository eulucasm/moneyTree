# 🌳 Money Tree

> Um organizador financeiro moderno, inteligente e minimalista, projetado para trazer clareza e tranquilidade para a sua vida financeira. Desenvolvido com **React Native + Expo** e **Node.js + PostgreSQL**, apresenta uma interface sofisticada em *Glassmorphism* com suporte nativo a múltiplos temas.

<p align="center">
  <a href="https://moneytree-backend.vercel.app/"><img src="https://img.shields.io/website?down_color=red&down_message=offline&label=Vercel%20Backend&up_color=emerald&up_message=online&url=https%3A%2F%2Fmoneytree-backend.vercel.app%2Fapi%2Fhealth" alt="Backend Status"></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ecf8e?logo=supabase&logoColor=white" alt="Database"></a>
  <a href="https://expo.dev"><img src="https://img.shields.io/badge/Platform-Web%20%7C%20iOS%20%7C%20Android-10B981?logo=expo&logoColor=white" alt="Platform"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-Proprietary-blue.svg" alt="License"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-Expo-10B981?logo=react&logoColor=white" alt="React Native / Expo">
  <img src="https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-336791?logo=postgresql&logoColor=white" alt="PostgreSQL (Supabase)">
  <img src="https://img.shields.io/badge/Prisma_ORM-2D3748?logo=prisma&logoColor=white" alt="Prisma ORM">
  <img src="https://img.shields.io/badge/Firebase_Auth-FFCA28?logo=firebase&logoColor=black" alt="Firebase Auth">
  <img src="https://img.shields.io/badge/Vercel_Backend-000000?logo=vercel&logoColor=white" alt="Vercel Backend">
</p>

---

## ✨ Recursos Destacados

- **📊 Dashboard Inteligente:** Acompanhe suas entradas, saídas, saldo atual e a saúde de suas economias de forma centralizada e reativa.
- **💳 Gestão de Múltiplos Cartões:** Gerencie faturas, datas de fechamento e limites comprometidos através de barras de progresso dinâmicas, com identificação visual customizada por cores.
- **🎯 Metas & Reservas:** Defina objetivos financeiros e distribua recursos em caixinhas personalizadas, com acompanhamento visual detalhado da sua evolução patrimonial.
- **📅 Projeções de Fluxo de Caixa:** Previsões automatizadas para os próximos meses baseadas em contas fixas, assinaturas recorrentes e parcelamentos.
- **📈 Inteligência & Analytics:** Gráficos interativos demonstrando a curva de receitas versus despesas e a distribuição percentual por categoria.
- **☁️ Sincronização em Nuvem (Local-First):** Motor híbrido com sincronização automática, garantindo que o app funcione fluidamente e persista os dados na nuvem via PostgreSQL de forma transparente.

---

## 🎨 Design System & Experiência do Usuário (UI/UX)

Desenvolvido sob o conceito de **Apple-like Glassmorphism**, combinando superfícies translúcidas, desfoques (blur) e micro-animações para criar uma experiência premium, relaxante e focada na leitura de dados.

- **Tema Claro (Off-White):** Superfícies suaves em `#F8F9FA` com tipografia em Verde Floresta (`#0F5132`) e realces em Verde Esmeralda (`#10B981`), transmitindo clareza e controle.
- **Tema Escuro (Dark Forest):** Fundo profundo em `#0B0F19` com cartões flutuantes e translúcidos (`#151D30`), otimizado para o máximo de conforto visual em ambientes de baixa luminosidade.
- **Acessibilidade e Performance:** Componentes otimizados com *Hardware Acceleration* (`transform-gpu`) na Web, assegurando roteamento instantâneo (*client-side*) e animações a 60fps constantes.

---

## 🛠️ Arquitetura e Stack Tecnológica

O **Money Tree** é arquitetado como um monorepo moderno, isolando responsabilidades entre front e back-end para máxima escalabilidade:

### Frontend (Mobile & Web)
- **Framework:** [React Native](https://reactnative.dev/) suportado pelo [Expo SDK](https://expo.dev/), provendo um único *codebase* para Web Responsivo, Android e iOS.
- **Roteamento:** [Expo Router](https://docs.expo.dev/router/introduction/) para navegação nativa e estruturada em arquivos.
- **Gerenciamento de Estado:** [Zustand](https://github.com/pmndrs/zustand) acoplado ao `AsyncStorage` para alta reatividade e persistência de dados local-first.

### Backend (API RESTful)
- **Plataforma:** [Node.js](https://nodejs.org/) com tipagem estrita em [TypeScript](https://www.typescriptlang.org/) seguindo princípios SOLID.
- **ORM e Banco de Dados:** [Prisma ORM](https://www.prisma.io/) com um banco de dados [PostgreSQL (Supabase)](https://supabase.com/) gerenciado por *Connection Pooling* (Supavisor).
- **Deploy Serverless:** Hospedado via [Vercel Functions](https://vercel.com/) para latência mínima e auto-escala.
- **Identidade e Segurança:** Autenticação gerenciada pelo [Firebase Auth](https://firebase.google.com/products/auth), protegendo rotas com validação rigorosa de *JWT Tokens*.

---

## 📁 Estrutura do Monorepo

```text
moneyTree/
├── backend/                  # API REST (Node.js/Express)
│   ├── api/                  # Entrypoints para Vercel Serverless
│   ├── prisma/               # Schema e migrações do PostgreSQL
│   ├── src/                  # Lógica de negócio, rotas, middlewares e controllers
│   └── vercel.json           # Configurações de deploy e roteamento (Vercel)
│
└── frontend/                 # App Mobile & Web (Expo)
    └── src/
        ├── app/              # Expo Router (Abas principais, Layouts e Telas Públicas)
        ├── components/       # Componentes visuais reaproveitáveis (GlassCard, Modais)
        ├── context/          # Provedores de contexto globais
        ├── hooks/            # Hooks customizados (useTheme, useSync)
        └── stores/           # Zustand Stores (AuthStore, FinanceStore)
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- npm, yarn ou pnpm

### 1. Inicializando o Backend
```bash
# Navegue até a pasta do backend
cd backend
npm install
```

Crie um arquivo `.env` na raiz do `backend/`:
```env
DATABASE_URL="sua_database_url_aqui"
DIRECT_URL="sua_direct_url_aqui"
```

Inicie o servidor de desenvolvimento:
```bash
npx prisma generate
npm run dev
```

### 2. Inicializando o Frontend
Em um novo terminal, prepare o ambiente cliente:
```bash
cd frontend
npm install
```

Crie um arquivo `.env` na raiz do `frontend/`:
```env
EXPO_PUBLIC_FIREBASE_API_KEY="chave_da_api"
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="dominio_firebase"
EXPO_PUBLIC_FIREBASE_PROJECT_ID="project_id"
EXPO_PUBLIC_FIREBASE_APP_ID="app_id"
EXPO_PUBLIC_BACKEND_URL="http://localhost:3000" 
```

Execute o Expo (Web ou Mobile):
```bash
npm run web
# ou 'npm start' para abrir o menu do Expo Go
```

---

## 🔒 Segurança e Compliance

- **Zero Hardcoding:** Nenhuma chave, credencial ou token está exposto no código fonte. O ambiente é injetado via variáveis de ambiente seguras.
- **Validação de Assinaturas JWT:** As requisições ao backend em ambiente de produção exigem *tokens JWT* validados através do `Firebase Admin SDK`. Tentativas forjadas são negadas na camada de *middleware* com erro 500/401.
- **Proteção de Credenciais:** Operações críticas, como a redefinição de senha, requerem a autenticação da senha antiga. O acesso ao banco é abstraído, sem vazar esquemas internos em caso de falha (`sendServerError`).

---

## 📄 Licença e Autoria

Este software é de código **Proprietário**. Todos os direitos reservados.
Desenvolvido e mantido por **Lucas Marques**.
