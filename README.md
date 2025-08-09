# EAC PWA - Sistema de Gestão para Escola de Aperfeiçoamento de Cabos

🚀 **EM PRODUÇÃO**: https://app.eacpnsa.com.br

Sistema completo com PWA para usuários e interface administrativa, conectado ao PostgreSQL no Railway.

## 🎯 URLs de Produção

- **PWA Principal**: https://app.eacpnsa.com.br/
- **Admin Interface**: https://app.eacpnsa.com.br/admin
- **API Backend**: https://app.eacpnsa.com.br/api

## 📱 Estrutura do Projeto

```
EAC-PWA/
├── backend/           # API REST (Node.js + Express)
│   ├── controllers/   # Lógica de negócio
│   ├── models/        # Modelos de dados
│   ├── routes/        # Rotas da API
│   └── middleware/    # Middlewares (auth, upload)
├── frontend/dist/     # Interface Admin (build)
├── pwa/dist/         # PWA App (build)
├── Dockerfile        # Container para deploy
├── package.json      # Configurações principais
└── .railwayignore   # Deploy config
```

## 🛠️ Tecnologias

### Frontend/PWA
- React 18 + TypeScript
- Vite (build)
- Ant Design (UI)
- Tailwind CSS (styling)
- PWA (offline-first)

### Backend
- Node.js + Express
- PostgreSQL (Railway)
- JWT Authentication
- Multer (uploads)
- bcrypt (passwords)

## 🚀 Deploy

### Produção (Railway)
```bash
# Deploy automático
railway up

# Ver logs
railway logs

# Status dos serviços
railway status
```

### Desenvolvimento Local

1. **Instalar dependências**:
```bash
npm install
```

2. **Executar em desenvolvimento**:
```bash
# Backend
npm run start:backend

# Frontend
npm run start:frontend

# PWA
npm run start:pwa
```

### URLs Locais
- Frontend: http://localhost:5173
- PWA: http://localhost:5174
- Backend: http://localhost:3000

## 📋 Funcionalidades

### PWA (Usuários)
- ✅ Autenticação JWT
- ✅ Dashboard personalizado
- ✅ Gestão de presença
- ✅ Checklist por equipe
- ✅ Reflexões e anotações
- ✅ Calendário de eventos
- ✅ Notificações
- ✅ Perfil com upload de foto
- ✅ Funciona offline

### Admin (Gestores)
- ✅ Gestão de usuários
- ✅ Controle de equipes
- ✅ Dashboard completo
- ✅ Relatórios
- ✅ Configurações

## 🔐 Acesso de Teste

### PWA
- **URL**: https://app.eacpnsa.com.br/
- **User**: `user@teste.com` / Senha: `123456`

### Admin
- **URL**: https://app.eacpnsa.com.br/admin
- **Admin**: `admin@teste.com` / Senha: `123456`

## 📊 Banco de Dados

### PostgreSQL (Railway)
- **Host**: Railway (automático)
- **Tabelas**: usuarios, equipes, presencas, checklist, reflexoes, agenda, notificacoes
- **Backup**: Automático pelo Railway

## 🧹 Estrutura Limpa

✅ Removidos 66+ arquivos de desenvolvimento
✅ Mantidos apenas arquivos essenciais
✅ Deploy otimizado (Docker)
✅ Documentação atualizada

---

**Última atualização**: Agosto 2025
**Status**: ✅ Produção Ativa
