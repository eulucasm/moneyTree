# 🌳 Money Tree

> Um organizador financeiro moderno, inteligente e minimalista, projetado para trazer clareza e tranquilidade para sua vida financeira. Desenvolvido com **React Native + Expo** e **Node.js + PostgreSQL** sob uma sofisticada interface *Glassmorphism* com suporte completo a temas.

[![Backend Status](https://img.shields.io/website?down_color=red&down_message=offline&label=Vercel%20Backend&up_color=emerald&up_message=online&url=https%3A%2F%2Fmoneytree-backend.vercel.app%2Fapi%2Fhealth)](https://moneytree-backend.vercel.app/)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20iOS%20%7C%20Android-10B981?logo=expo&logoColor=white)](https://expo.dev)
[![Licença](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![React Native / Expo](https://img.shields.io/badge/React_Native-Expo-10B981?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![PostgreSQL (Supabase)](https://img.shields.io/badge/PostgreSQL-Supabase-336791?logo=postgresql&logoColor=white)
![Prisma ORM](https://img.shields.io/badge/Prisma_ORM-2D3748?logo=prisma&logoColor=white)
![Firebase Auth](https://img.shields.io/badge/Firebase_Auth-FFCA28?logo=firebase&logoColor=black)
![Vercel Backend](https://img.shields.io/badge/Vercel_Backend-000000?logo=vercel&logoColor=white)

---

## ✨ Recursos Destacados

*   **📊 Dashboard Inteligente:** Acompanhe suas entradas, saídas, saldo atual e a saúde de suas economias de forma unificada e reativa.
*   **💳 Gestão de Múltiplos Cartões:** Cadastre cartões de crédito com cores e limites customizados, acompanhando em tempo real o comprometimento do limite através de barras de progresso dinâmicas.
*   **🎯 Metas & Poupança (Savings):** Defina objetivos financeiros e distribua recursos em caixinhas personalizadas com acompanhamento visual de progresso.
*   **📅 Projeção de Fluxo:** Previsões automatizadas para os próximos 6 meses baseando-se em contas fixas, assinaturas recorrentes e faturas.
*   **📈 Inteligência & Analytics:** Gráficos interativos demonstrando a evolução de receitas vs despesas e a distribuição por categoria (Lazer, Saúde, Casa, etc.).
*   **🔒 Segurança Robusta:** Login integrado via Firebase (Google OAuth e E-mail/Senha) com confirmação segura de senha antiga e proteção de dados.
*   **☁️ Sincronização em Nuvem:** Motor híbrido offline-first com sincronização automática e transparente com banco de dados PostgreSQL.

---

## 🎨 Design System & Estética (UI/UX)

Desenvolvido sob o conceito de **Apple-like Glassmorphism** (efeitos translúcidos, blur e sombras flutuantes) para criar uma experiência relaxante e limpa ao lidar com dinheiro.

*   **Tema Claro (Off-White):** Fundo suave em `#F8F9FA` com textos no sofisticado Verde Floresta (`#0F5132`) e detalhes em Verde Esmeralda (`#10B981`).
*   **Tema Escuro (Dark Forest):** Fundo profundo em `#0B0F19` com superfícies translúcidas em `#151D30` e realces em Verde Esmeralda Vibrante, projetado para conforto visual noturno.
*   **Acessibilidade Visual:** Micro-animações premium de entrada, contrastes otimizados em ambos os temas e identificação de cartões por cores institucionais (roxo para Nubank, laranja para Itaú, etc.).

---

## 🛠️ Stack Tecnológica

O Money Tree é estruturado como um monorepo moderno dividindo as responsabilidades de maneira limpa:

### Frontend (Mobile & Web)
*   **Framework:** [React Native](https://reactnative.dev/) com [Expo SDK](https://expo.dev/) (Suporta Web responsivo, Android e iOS com código unificado).
*   **Roteamento:** [Expo Router](https://docs.expo.dev/router/introduction/) (Navegação baseada em arquivos/abas).
*   **Gerenciamento de Estado:** [Zustand](https://github.com/pmndrs/zustand) (Simples, rápido e persistido localmente via AsyncStorage).
*   **Tema Dinâmico:** Custom Hook `useTheme` conectado à store para alternância e persistência em tempo de execução.

### Backend (API RESTful)
*   **Plataforma:** [Node.js](https://nodejs.org/) + [TypeScript](https://www.typescriptlang.org/) (SOLID, limpo e modularizado).
*   **ORM:** [Prisma ORM](https://www.prisma.io/) (Interface simplificada e tipagem estrita para o BD).
*   **Deploy:** [Vercel Serverless Functions](https://vercel.com/) (Escalabilidade instantânea e latência mínima).
*   **Hospedagem DB:** [Supabase PostgreSQL](https://supabase.com/) com connection pooling seguro via Supavisor.
*   **Autenticação:** Firebase Auth (JWT Tokens).

---

## 📁 Estrutura do Monorepo

```
moneyTree/
├── backend/                  # API REST em Node.js
│   ├── api/                  # Handlers Serverless para deploy na Vercel
│   ├── prisma/               # Schema e migrações do PostgreSQL (Prisma)
│   ├── src/                  # Código-fonte principal da API
│   │   ├── controllers/      # Controladores de rotas
│   │   ├── middlewares/      # Validação de JWT e CORS
│   │   └── services/         # Lógica de negócio e banco de dados
│   └── vercel.json           # Configuração de rotas serverless na Vercel
│
└── frontend/                 # App Mobile & Web (React Native/Expo)
    └── src/
        ├── app/              # Estrutura de rotas e abas (Expo Router)
        │   ├── (tabs)/       # Abas principais (Dashboard, Orçamento, Histórico, etc.)
        │   └── _layout.tsx   # Layout de autenticação e navegação geral
        ├── components/       # Componentes refraturados (GlassCard, Toast, Modais)
        ├── context/          # Contexto de finanças de alto nível
        ├── hooks/            # Hooks customizados (useTheme, useColorScheme)
        └── stores/           # Zustand Stores (FinanceStore, AuthStore)
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
*   Node.js (versão 18 ou superior)
*   Gerenciador de pacotes npm ou yarn

### 1. Clonar o repositório
```bash
git clone https://github.com/eulucasm/moneyTree.git
cd moneyTree
```

### 2. Configurar o Backend
Acesse a pasta do backend, instale as dependências e configure as variáveis de ambiente:
```bash
cd backend
npm install
```
Crie um arquivo `.env` na pasta `backend/` contendo:
```env
DATABASE_URL="sua_database_url_aqui"
DIRECT_URL="sua_direct_url_aqui"
# Opcional para validação estrita em desenvolvimento local:
# FIREBASE_SERVICE_ACCOUNT='{"type": "service_account", ...}'
```
Gere os arquivos do Prisma Client e inicie o backend:
```bash
npx prisma generate
npm run dev
```

### 3. Configurar o Frontend
Em um novo terminal, vá até a pasta `frontend/`, instale as dependências e adicione as chaves locais:
```bash
cd ../frontend
npm install
```
Crie o arquivo `.env` na pasta `frontend/`:
```env
EXPO_PUBLIC_FIREBASE_API_KEY="sua_chave_firebase_aqui"
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="seu_auth_domain"
EXPO_PUBLIC_FIREBASE_PROJECT_ID="seu_project_id"
EXPO_PUBLIC_FIREBASE_APP_ID="seu_app_id"
# Defina para apontar ao seu backend local ou de produção:
EXPO_PUBLIC_BACKEND_URL="http://localhost:3000" 
```
Inicie o servidor do Expo Web/Metro:
```bash
npm run web
```

---

## 🔒 Segurança & Boas Práticas

*   **Zero Hardcoding:** Nenhuma chave de API ou credencial sensível é exposta no versionamento de código. Todas são acessadas via variáveis de ambiente (`.env` no backend, `EXPO_PUBLIC_...` no Expo).
*   **Bypass de Token Local:** O backend possui um decodificador inteligente de JWT (`decodeJwtWithoutVerification`) para testes em desenvolvimento local sem exigir credenciais de serviço administrativas do Firebase, garantindo testes ágeis sem comprometer a segurança rigorosa criptográfica em produção na Vercel.
*   **Troca Segura de Credenciais:** As alterações de senha exigem a validação explícita da credencial atual antes da atualização do cadastro.

---

## 📄 Licença

Este projeto está sob a licença Propria. Desenvolvido por Lucas Marques.
