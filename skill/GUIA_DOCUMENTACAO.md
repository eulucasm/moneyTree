# 📖 Guia de Padrões de Documentação - Money Tree

Este documento define os padrões, a estrutura e as regras para criação, manutenção e leitura do arquivo principal de documentação do projeto (`docs/documentation.md`). O objetivo é garantir que qualquer desenvolvedor ou inteligência artificial consiga entender o contexto do projeto instantaneamente e manter um histórico coerente.

---

## 🎯 1. Objetivo da Documentação

O arquivo `documentation.md` atua como o **Cérebro do Projeto**. Como trabalhamos com IAs e sessões que podem perder o contexto, este arquivo serve para:

- Recuperar o estado atual do projeto imediatamente.
- Rastrear todas as solicitações feitas pelo usuário.
- Documentar decisões arquiteturais e de design (Design Decisions).
- Manter um log de atividades para auditoria e controle de versão sem depender exclusivamente de commits.
- Fornecer um inventário claro de quais arquivos existem e o que fazem.

---

## 🏗️ 2. Estrutura Padrão do Documento

A documentação deve **sempre** seguir a estrutura abaixo. Não remova seções; se uma seção estiver vazia, indique que não há itens no momento.

### 2.1. ⚠️ INSTRUÇÕES IMPORTANTES - LEIA PRIMEIRO

Esta é a seção de regras fixas para a IA. Ela deve conter o comando de recuperação de contexto e uma tabela com os gatilhos de quando atualizar cada seção.

### 2.2. 🛠️ Skills Utilizados

Lista de "Skills" ou prompts de comportamento (ex: `react-native-architecture`, `ui-ux-pro-max`) que devem ser ativados ao interagir com o projeto. Isso garante que a IA sempre siga os mesmos padrões de código e design.

### 2.3. 📝 O Que Foi Solicitado

Um histórico corrido e numerado ou em formato de lista (bullet points) do que o usuário pediu ao longo do tempo, organizado por data e/ou grandes blocos de solicitação.
**Importante:** Nunca apague solicitações antigas, adicione sempre ao final da lista.

### 2.4. ⚙️ Definição Técnica & Arquitetura

A "Stack" do projeto. Descreve as bibliotecas core, padrões de projeto (ex: Zustand, Offline-first, Expo Router), arquitetura e regras de negócio essenciais.

### 2.5. 📋 Status do Projeto & Fases

O Roadmap macro do projeto. Um diagrama simples (Mermaid) ou tabela informando em qual Fase estamos, o que ela compreende e seu status (✅ Concluída, ⏳ Pendente).

### 2.6. 📦 O Que Já Foi Desenvolvido

O Inventário do Projeto. Uma lista das pastas, arquivos e módulos criados.
**Padrão de escrita:** `[nome-do-arquivo](caminho) — Breve explicação do seu propósito e conteúdo.`

### 2.7. ⏳ O Que Ainda Falta (Pendências)

O Backlog técnico e funcional. Tarefas que precisam ser feitas, mas ainda não foram iniciadas ou estão bloqueadas. Quando uma pendência for finalizada, ela deve ser removida daqui e seu resultado documentado nas seções apropriadas.

### 2.8. 🔄 Alterações Solicitadas & Decisões de Design

Um log focado nas **mudanças de rota**. Se uma funcionalidade foi removida, se uma regra de negócio mudou, ou se tomamos uma decisão de arquitetura importante (ex: "Mudança de AsyncStorage para SecureStore"), documente aqui de forma concisa.

### 2.9. 📝 Log de Atividades

Uma tabela de versionamento de tarefas.
**Padrão das colunas:** `| Data | Atividade Realizada | Desenvolvedor (IA ou Humano) | Status |`
Sempre adicione novas linhas ao final (ou no topo, desde que seja padronizado e mantido).

---

## ⚖️ 3. Regras de Atualização (Golden Rules)

Para a inteligência artificial (IA) ou Desenvolvedor Humano que estiver operando o projeto:

1. **Atualização Imediata:** Terminou uma funcionalidade com sucesso? Atualize o `documentation.md` ANTES de encerrar a interação.
2. **Registro de Solicitação:** Recebeu um prompt longo com várias solicitações? Adicione um resumo na seção `📝 O Que Foi Solicitado`.
3. **Novos Arquivos:** Criou ou deletou um componente, tela ou hook? Atualize o inventário em `📦 O Que Já Foi Desenvolvido`.
4. **Log de Atividades Obrigatório:** Nunca termine um grande bloco de código sem adicionar uma linha na tabela final de `Log de Atividades`.
5. **Não reescreva a história:** Ao atualizar o documento, use comandos de edição (`replace_file_content`) ou faça *append* (`write_to_file`). **Não apague** logs antigos a menos que o usuário solicite explicitamente uma limpeza (wipeout).

---

## 💬 4. Como iniciar uma Sessão usando a Documentação

Se o chat reiniciar ou trocar de agente, use o seguinte comando (ou similar) como seu **primeiro prompt**:

> *"Leia o documento `docs/documentation.md` para recuperar o contexto do projeto, veja as regras no arquivo `docs/GUIA_DOCUMENTACAO.md` e aguarde minhas próximas instruções."*
