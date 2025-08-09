USE novo;

CREATE TABLE tipo_circulo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

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
  equipe_id INT,
  senha VARCHAR(255) NOT NULL,
  FOREIGN KEY (equipe_id) REFERENCES equipe(id),
  FOREIGN KEY (tipo_circulo_id) REFERENCES tipo_circulo(id)
);

    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    sobre TEXT,
    funcao VARCHAR(100)
);

CREATE TABLE checklist (
    id INT AUTO_INCREMENT PRIMARY KEY,
CREATE TABLE agenda (
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT
);

CREATE TABLE checklist_equipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    checklist_id INT NOT NULL,
    equipe_id INT NOT NULL,
    FOREIGN KEY (checklist_id) REFERENCES checklist(id) ON DELETE CASCADE,
    FOREIGN KEY (equipe_id) REFERENCES equipe(id) ON DELETE CASCADE
);

CREATE TABLE notificacao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    para_todos BOOLEAN DEFAULT FALSE,
    equipe_id INT,
    FOREIGN KEY (equipe_id) REFERENCES equipe(id)
);

CREATE TABLE notificacao_lidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notificacao_id INT NOT NULL,
    usuario_id INT NOT NULL,
    data_lida DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notificacao_id) REFERENCES notificacao(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE agenda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    data DATE,
    hora_inicio TIME,
    hora_fim TIME,
    local VARCHAR(100)
);

CREATE TABLE reflexao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    texto TEXT NOT NULL,
    usuario_id INT NOT NULL,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE presenca (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipe_id INT NOT NULL,
    usuario_id INT NOT NULL,
    data DATE,
    presente BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (equipe_id) REFERENCES equipe(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);
