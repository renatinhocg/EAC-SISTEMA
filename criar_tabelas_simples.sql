-- Script SQL SIMPLES para executar via Railway CLI
-- Execute: railway run mysql < criar_tabelas_simples.sql

CREATE TABLE IF NOT EXISTS tipo_circulo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('admin','coordenador','integrante') DEFAULT 'integrante',
    telefone VARCHAR(20),
    tipo_circulo_id INT,
    equipe_id INT
);

CREATE TABLE IF NOT EXISTS equipe (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);

-- Inserir dados básicos
INSERT IGNORE INTO tipo_circulo (id, nome) VALUES 
(1, 'Renato e Bruna'),
(2, 'Rodrigo e Bárbara'),
(3, 'Fabricio e Jessica'),
(4, 'Jose e Maycon');

INSERT IGNORE INTO usuario (id, nome, email, senha, tipo_usuario) VALUES 
(1, 'Renato', 'renato@gmail.com', '12345', 'admin'),
(2, 'Bruna', 'bruna@gmail.com', '12345', 'admin'),
(3, 'João', 'joao@email.com', '123456', 'admin'),
(4, 'Teste', 'teste@tecom.br', '123456', 'integrante');

INSERT IGNORE INTO equipe (id, nome, descricao) VALUES
(1, 'Equipe Alpha', 'Equipe principal'),
(2, 'Equipe Beta', 'Segunda equipe');

SELECT 'Tabelas e dados básicos criados!' as resultado;
