-- COPIE E COLE ESTE SCRIPT NO RAILWAY QUERY EDITOR
-- Script mínimo para criar tabelas básicas e testar

-- Limpa tabelas se existirem
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS tipo_circulo;

-- Cria tabela tipo_circulo
CREATE TABLE tipo_circulo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Cria tabela usuario simplificada
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

-- Insere dados básicos para teste
INSERT INTO tipo_circulo (id, nome) VALUES 
(1, 'Renato e Bruna'),
(2, 'Rodrigo e Bárbara'),
(3, 'Fabricio e Jessica'),
(4, 'Jose e Maycon');

INSERT INTO usuario (id, nome, telefone, email, tipo_usuario, tipo_circulo_id, senha) VALUES 
(1, 'Renato', '(21) 99711-3839', 'renato@gmail.com', 'admin', 1, '12345'),
(2, 'Bruna', '(21) 91416-8496', 'bruna@gmail.com', 'admin', 1, '12345'),
(3, 'teste', '(21) 98198-4919', 'teste@tecom.br', 'integrante', 4, '123456'),
(4, 'Joao', '(23) 13213-1312', 'joao@email.com', 'admin', 4, '123456');

-- Verifica se funcionou
SELECT 'SUCESSO! Dados inseridos:' as resultado;
SELECT COUNT(*) as total_usuarios FROM usuario;
SELECT COUNT(*) as total_tipos FROM tipo_circulo;

-- Mostra usuários para teste
SELECT 'CREDENCIAIS PARA TESTE:' as info;
SELECT CONCAT(email, ' / ', senha) as login_senha FROM usuario WHERE tipo_usuario = 'admin';
