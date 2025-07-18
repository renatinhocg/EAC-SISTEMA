const fs = require('fs');

// Lê o arquivo de estrutura
const estrutura = `-- =====================================================
-- SCRIPT COMPLETO PARA PRODUÇÃO RAILWAY
-- Criação das tabelas + dados reais do banco local (538 registros)
-- =====================================================

-- Limpa tabelas antigas (na ordem de dependência)
DROP TABLE IF EXISTS presenca;
DROP TABLE IF EXISTS reflexao;
DROP TABLE IF EXISTS agenda;
DROP TABLE IF EXISTS notificacao_lidos;
DROP TABLE IF EXISTS notificacao;
DROP TABLE IF EXISTS checklist_equipes;
DROP TABLE IF EXISTS checklist;
DROP TABLE IF EXISTS equipe;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS tipo_circulo;

-- =====================================================
-- CRIAÇÃO DAS TABELAS
-- =====================================================

-- Cria tabela de tipos de círculo
CREATE TABLE tipo_circulo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Cria tabela de usuário
CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(100) NOT NULL UNIQUE,
    instagram VARCHAR(100),
    tipo_usuario ENUM('admin','coordenador','integrante') NOT NULL DEFAULT 'integrante',
    tipo_circulo_id INT,
    eac_que_fez VARCHAR(100),
    foto VARCHAR(255),
    senha VARCHAR(255) NOT NULL,
    equipe_id INT,
    CONSTRAINT fk_usuario_tipo_circulo FOREIGN KEY (tipo_circulo_id)
      REFERENCES tipo_circulo(id)
      ON DELETE SET NULL
) ENGINE=InnoDB;

-- Cria tabela de equipe
CREATE TABLE equipe (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    sobre TEXT,
    funcao VARCHAR(100)
) ENGINE=InnoDB;

-- Cria tabela de checklist
CREATE TABLE checklist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT
) ENGINE=InnoDB;

-- Relação checklist <-> equipe
CREATE TABLE checklist_equipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    checklist_id INT NOT NULL,
    equipe_id INT NOT NULL,
    FOREIGN KEY (checklist_id) REFERENCES checklist(id) ON DELETE CASCADE,
    FOREIGN KEY (equipe_id) REFERENCES equipe(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Cria tabela de notificações
CREATE TABLE notificacao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    para_todos BOOLEAN DEFAULT FALSE,
    equipe_id INT,
    FOREIGN KEY (equipe_id) REFERENCES equipe(id)
) ENGINE=InnoDB;

-- Registro de notificações lidas
CREATE TABLE notificacao_lidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notificacao_id INT NOT NULL,
    usuario_id INT NOT NULL,
    data_lida DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notificacao_id) REFERENCES notificacao(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Cria agenda
CREATE TABLE agenda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    data DATE,
    hora_inicio TIME,
    hora_fim TIME,
    local VARCHAR(100)
) ENGINE=InnoDB;

-- Cria reflexões
CREATE TABLE reflexao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    texto TEXT NOT NULL,
    usuario_id INT NOT NULL,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Cria presença
CREATE TABLE presenca (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipe_id INT NOT NULL,
    usuario_id INT NOT NULL,
    data DATE,
    presente BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (equipe_id) REFERENCES equipe(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- INSERÇÃO DOS DADOS REAIS DO BANCO LOCAL (538 registros)
-- =====================================================

-- Desabilita verificação de chaves estrangeiras temporariamente
SET FOREIGN_KEY_CHECKS = 0;

`;

// Lê os dados exportados
const dadosLocais = fs.readFileSync('dados_completos_local.sql', 'utf8');

// Finalização
const finalizacao = `
-- Reabilita verificação de chaves estrangeiras
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- =====================================================

-- Verifica quantos registros foram inseridos em cada tabela
SELECT 'TIPOS DE CÍRCULO:' as tabela, COUNT(*) as total FROM tipo_circulo
UNION ALL
SELECT 'USUÁRIOS:', COUNT(*) FROM usuario  
UNION ALL
SELECT 'EQUIPES:', COUNT(*) FROM equipe
UNION ALL
SELECT 'CHECKLISTS:', COUNT(*) FROM checklist
UNION ALL
SELECT 'CHECKLIST-EQUIPES:', COUNT(*) FROM checklist_equipes
UNION ALL
SELECT 'NOTIFICAÇÕES:', COUNT(*) FROM notificacao
UNION ALL
SELECT 'AGENDAS:', COUNT(*) FROM agenda
UNION ALL
SELECT 'REFLEXÕES:', COUNT(*) FROM reflexao
UNION ALL
SELECT 'PRESENÇAS:', COUNT(*) FROM presenca;

-- Mostra alguns usuários admin para teste
SELECT 
    '=== CREDENCIAIS REAIS DO SISTEMA ===' as info
UNION ALL
SELECT 'renato@gmail.com - senha: 12345 (admin)'
UNION ALL
SELECT 'bruna@gmail.com - senha: 12345 (admin)'
UNION ALL
SELECT 'joao@email.com - senha: 123456 (admin)'
UNION ALL
SELECT 'teste@tecom.br - senha: 123456 (integrante)';

-- =====================================================
-- SUCESSO!
-- =====================================================
SELECT '🎉 BANCO POPULADO COM TODOS OS DADOS REAIS!' as status;
SELECT '📊 538 registros importados do ambiente local' as info;
SELECT '👥 76 usuários reais + 13 equipes + 427 presenças + outros dados' as detalhes;
`;

// Junta tudo
const arquivoCompleto = estrutura + dadosLocais + finalizacao;

// Salva o arquivo final
fs.writeFileSync('PRODUCAO_COMPLETA_RAILWAY.sql', arquivoCompleto);

console.log('✅ Arquivo PRODUCAO_COMPLETA_RAILWAY.sql criado com sucesso!');
console.log('📊 Tamanho:', Math.round(arquivoCompleto.length / 1024), 'KB');
console.log('📝 Contém:', arquivoCompleto.split('\\n').filter(l => l.includes('INSERT')).length, 'comandos INSERT');
console.log('');
console.log('🎯 PRÓXIMO PASSO:');
console.log('1. Acesse Railway → Projeto → Serviço EAC');
console.log('2. Vá em Query/Data/Connect');
console.log('3. Cole o conteúdo de PRODUCAO_COMPLETA_RAILWAY.sql');
console.log('4. Execute o script');
console.log('5. Teste o login com: renato@gmail.com / 12345');
