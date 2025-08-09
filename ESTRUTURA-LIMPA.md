# EAC PWA - Estrutura Limpa

## 🎯 Projeto em Produção

### URLs:
- **PWA**: https://app.eacpnsa.com.br/
- **Admin**: https://app.eacpnsa.com.br/admin
- **API**: https://app.eacpnsa.com.br/api

### Estrutura Final:
```
├── backend/           # API e servidor Node.js
├── frontend/dist/     # Admin interface (build)
├── pwa/dist/         # PWA app (build)
├── package.json      # Configurações principais
├── Dockerfile        # Configuração para deploy
└── .railwayignore   # Arquivos ignorados no deploy
```

### Comandos Úteis:
```bash
# Rebuild local (se necessário)
npm run build

# Deploy Railway
railway up

# Ver logs
railway logs
```

### Funcionalidades:
✅ PWA completo com todas as telas
✅ Admin interface para gestão
✅ API REST com PostgreSQL
✅ Deploy automático no Railway
✅ DNS customizado configurado
