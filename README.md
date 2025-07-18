# Projeto Admin + App PWA + Backend

Este repositório contém:
- `frontend/`: Aplicação React + Vite (Admin e App PWA)
- `backend/`: API Node.js (Express) conectada ao MySQL

## Como rodar o projeto

### Frontend
1. Entre na pasta `frontend`
2. Instale as dependências: `npm install`
3. Rode o projeto: `npm run dev`

### Backend
1. Entre na pasta `backend`
2. Instale as dependências: `npm install`
3. Configure o arquivo `.env` com os dados do MySQL
4. Rode o backend: `node index.js` (ou `npm start` se configurar o script)

## Estrutura sugerida
- Admin e App PWA juntos no frontend, separados por rotas ou pastas.
- Backend expõe API REST para autenticação, notificações, calendário, equipes, usuários, checklist, reflexões e presença.

## Observações
- O banco de dados pode ser criado localmente no MySQL Workbench e depois migrado para o Hostinger.
- Siga o diagrama enviado para criar as rotas e entidades.
