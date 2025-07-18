-- Script completo para criar e popular banco Railway
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
-- POPULAÇÃO COM DADOS DE TESTE
-- =====================================================

-- Insere tipos de círculo
INSERT INTO tipo_circulo (id, nome) VALUES 
(1, 'Círculo de Melhoria'),
(2, 'Círculo de Inovação'),
(3, 'Círculo de Qualidade'),
(4, 'Círculo de Segurança');

-- Insere usuários (senha = password hash com bcrypt)
INSERT INTO usuario (id, nome, email, senha, tipo_usuario, tipo_circulo_id) VALUES 
(1, 'Administrador do Sistema', 'admin@eac.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1),
(2, 'João Silva', 'joao@eac.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'coordenador', 1),
(3, 'Maria Santos', 'maria@eac.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'integrante', 2),
(4, 'Pedro Costa', 'pedro@eac.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'integrante', 3),
(5, 'Ana Oliveira', 'ana@eac.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'integrante', 2);

-- Insere equipes
INSERT INTO equipe (id, nome, descricao, sobre, funcao) VALUES 
(1, 'Equipe Alpha', 'Equipe de desenvolvimento principal', 'Focada em desenvolvimento de novas funcionalidades', 'Desenvolvimento'),
(2, 'Equipe Beta', 'Equipe de testes e qualidade', 'Responsável por testes e garantia de qualidade', 'QA'),
(3, 'Equipe Gamma', 'Equipe de suporte e operações', 'Suporte técnico e operações', 'Suporte'),
(4, 'Equipe Delta', 'Equipe de pesquisa e inovação', 'Pesquisa e desenvolvimento de inovações', 'P&D');

-- Insere checklists
INSERT INTO checklist (id, titulo, descricao) VALUES 
(1, 'Checklist de Preparação', 'Itens essenciais para preparar reuniões'),
(2, 'Checklist de Inovação', 'Itens para sessões criativas e brainstorming'),
(3, 'Checklist de Qualidade', 'Itens para revisão de processos e qualidade'),
(4, 'Checklist de Segurança', 'Itens de segurança e bem-estar');

-- Relaciona checklists com equipes
INSERT INTO checklist_equipes (checklist_id, equipe_id) VALUES 
(1, 1), (1, 2), (1, 3),  -- Checklist de Preparação para todas equipes principais
(2, 1), (2, 4),          -- Checklist de Inovação para Alpha e Delta
(3, 2), (3, 3),          -- Checklist de Qualidade para Beta e Gamma
(4, 1), (4, 2), (4, 3), (4, 4); -- Checklist de Segurança para todas

-- Insere notificações
INSERT INTO notificacao (id, titulo, descricao, para_todos, equipe_id) VALUES 
(1, 'Bem-vindos ao Sistema EAC!', 'Sistema implantado com sucesso. Explorem as funcionalidades!', TRUE, NULL),
(2, 'Reunião Equipe Alpha', 'Reunião de planejamento da sprint na próxima segunda-feira às 9h', FALSE, 1),
(3, 'Treinamento de Qualidade', 'Treinamento sobre processos de qualidade para equipe Beta', FALSE, 2);

-- Insere agenda
INSERT INTO agenda (id, titulo, descricao, data, hora_inicio, hora_fim, local) VALUES 
(1, 'Reunião de Alinhamento', 'Reunião para alinhamento dos objetivos do trimestre', '2025-07-21', '09:00:00', '10:30:00', 'Sala de Conferências A'),
(2, 'Workshop de Inovação', 'Workshop sobre metodologias ágeis e inovação', '2025-07-22', '14:00:00', '17:00:00', 'Auditório Principal'),
(3, 'Revisão de Qualidade', 'Revisão dos processos de qualidade implementados', '2025-07-23', '10:00:00', '12:00:00', 'Sala de Reuniões B');

-- Insere reflexões de exemplo
INSERT INTO reflexao (texto, usuario_id) VALUES 
('Excelente implementação do sistema! A interface está muito intuitiva.', 2),
('Sugiro melhorias no módulo de notificações para incluir filtros.', 3),
('O sistema está funcionando perfeitamente. Parabéns à equipe!', 4);

-- Insere presenças de exemplo
INSERT INTO presenca (equipe_id, usuario_id, data, presente) VALUES 
(1, 2, '2025-07-17', TRUE),
(1, 3, '2025-07-17', TRUE),
(2, 4, '2025-07-17', FALSE),
(3, 5, '2025-07-17', TRUE);

-- =====================================================
-- CONFIRMAÇÃO
-- =====================================================

-- Verifica dados inseridos
SELECT 'USUÁRIOS:' as info, COUNT(*) as total FROM usuario
UNION ALL
SELECT 'EQUIPES:', COUNT(*) FROM equipe  
UNION ALL
SELECT 'CHECKLISTS:', COUNT(*) FROM checklist
UNION ALL
SELECT 'NOTIFICAÇÕES:', COUNT(*) FROM notificacao
UNION ALL
SELECT 'AGENDAS:', COUNT(*) FROM agenda;

-- Mostra credenciais de teste
SELECT 
    '=== CREDENCIAIS DE TESTE ===' as info
UNION ALL
SELECT 'admin@eac.com / password (admin)'
UNION ALL  
SELECT 'joao@eac.com / password (coordenador)'
UNION ALL
SELECT 'maria@eac.com / password (integrante)';
