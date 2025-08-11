-- Schema EAC convertido para PostgreSQL
-- Limpa tabelas antigas (na ordem de dependência)
DROP TABLE IF EXISTS presenca CASCADE;
DROP TABLE IF EXISTS reflexao CASCADE;
DROP TABLE IF EXISTS agenda CASCADE;
DROP TABLE IF EXISTS notificacao_lidos CASCADE;
DROP TABLE IF EXISTS notificacao CASCADE;
DROP TABLE IF EXISTS checklist_equipes CASCADE;
DROP TABLE IF EXISTS checklist CASCADE;
DROP TABLE IF EXISTS equipe CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;
DROP TABLE IF EXISTS tipo_circulo CASCADE;

-- Cria tabela de tipos de círculo
CREATE TABLE tipo_circulo (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

-- Cria tabela de usuário
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(100) NOT NULL UNIQUE,
    instagram VARCHAR(100),
    tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'integrante' CHECK (tipo_usuario IN ('admin','coordenador','integrante')),
    tipo_circulo_id INT,
    eac_que_fez VARCHAR(100),
    foto VARCHAR(255),
    senha VARCHAR(255) NOT NULL,
    CONSTRAINT fk_usuario_tipo_circulo FOREIGN KEY (tipo_circulo_id)
      REFERENCES tipo_circulo(id)
      ON DELETE SET NULL
);

-- Cria tabela de equipe
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    sobre TEXT,
    funcao VARCHAR(100)
);

-- Cria tabela de checklist
CREATE TABLE checklist (
CREATE TABLE agenda (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT
);

-- Relação checklist <-> equipe
CREATE TABLE checklist_equipes (
    id SERIAL PRIMARY KEY,
    checklist_id INT NOT NULL,
    equipe_id INT NOT NULL,
    FOREIGN KEY (checklist_id) REFERENCES checklist(id) ON DELETE CASCADE,
    FOREIGN KEY (equipe_id) REFERENCES equipe(id) ON DELETE CASCADE
);

-- Cria tabela de notificações
CREATE TABLE notificacao (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    para_todos BOOLEAN DEFAULT FALSE,
    equipe_id INT,
    FOREIGN KEY (equipe_id) REFERENCES equipe(id)
);

-- Registro de notificações lidas
CREATE TABLE notificacao_lidos (
    id SERIAL PRIMARY KEY,
    notificacao_id INT NOT NULL,
    usuario_id INT NOT NULL,
    data_lida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notificacao_id) REFERENCES notificacao(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Cria agenda
CREATE TABLE agenda (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    data DATE,
    hora_inicio TIME,
    hora_fim TIME,
    local VARCHAR(100)
);

-- Cria reflexões
CREATE TABLE reflexao (
    id SERIAL PRIMARY KEY,
    texto TEXT NOT NULL,
    usuario_id INT NOT NULL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Cria presença
CREATE TABLE presenca (
    id SERIAL PRIMARY KEY,
    equipe_id INT NOT NULL,
    usuario_id INT NOT NULL,
    data DATE,
    presente BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (equipe_id) REFERENCES equipe(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Inserir dados básicos
INSERT INTO tipo_circulo (nome) VALUES 
('EAC'),
('Encontrista'),
('Dirigente');

-- Inserir usuário admin padrão (senha: admin123)
INSERT INTO usuario (nome, email, senha, tipo_usuario) VALUES 
('Administrador', 'admin@eacpnssa.com.br', '$2b$10$rN8rJ5K6L8mF9X2hQ3pY3.Y6vK4nT8qP9wE1sA7dC6bU5oM0nL3eZ', 'admin');

-- Inserir algumas equipes básicas
INSERT INTO equipe (nome, descricao, funcao) VALUES 
('Coordenação Geral', 'Equipe de coordenação do EAC', 'coordenacao'),
('Logística', 'Equipe responsável pela logística dos eventos', 'logistica'),
('Marketing', 'Equipe de divulgação e marketing', 'marketing'),
('Palestra', 'Equipe responsável pelas palestras', 'palestra'),
('Mesa Redonda', 'Equipe das mesas redondas', 'mesa_redonda');
