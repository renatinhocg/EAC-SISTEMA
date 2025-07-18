-- Arquivo definitivo de schema para importar no MySQL Workbench
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
