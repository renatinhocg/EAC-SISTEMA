-- =====================================================
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

INSERT INTO tipo_circulo (id, nome) VALUES (3, 'Fabricio e Jessica');
INSERT INTO tipo_circulo (id, nome) VALUES (4, 'Jose e Maycon');
INSERT INTO tipo_circulo (id, nome) VALUES (1, 'Renato e Bruna');
INSERT INTO tipo_circulo (id, nome) VALUES (2, 'Rodrigo e Bárbara');

INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (1, 'Renato', '(21) 99711-3839', 'renato@gmail.com', '', 'admin', 1, '76', 'uploads/usuarios/1751483116898.png', '12345', NULL);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (2, 'Bruna', '(21) 91416-8496', 'bruna@gmail.com', '', 'admin', 1, '', NULL, '12345', 1);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (3, 'teste', '(21) 98198-4919', 'teste@tecom.br', '', 'integrante', 4, '', NULL, '123456', NULL);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (4, 'Joao', '(23) 13213-1312', 'joao@email.com', '', 'admin', 4, '', NULL, '123456', 2);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (579, 'TIOS SANDRO E ELIANE', NULL, 'sandro@email.com', NULL, 'coordenador', NULL, NULL, NULL, '$2b$08$UZAffiWInGGLpNNO.rM6oOJQY4JC/gD3zFBQ/v/FZEcWMeHQ.dJB.', 4);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (580, 'ARTHUR NOGUEIRA', '(32) 13213-2131', 'arthur@email.com', NULL, 'coordenador', 4, NULL, NULL, '123456', 4);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (581, 'ANA ROSA PASINI', NULL, 'anarosa@email.com', NULL, 'coordenador', NULL, NULL, NULL, '$2b$08$T2qKPqXdTOEOVq4qojFaN.iU0TK0whtg97xR.nKyQIAZfQSgrwz22', 4);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (582, 'ARTHUR NEVES', NULL, 'neves@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$S7OIxyMoOSE1/d8K207IduSBhT/BpO6aDh57n/oc/I20D8OvrvCOO', 4);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (583, 'LAURA RIBEIRO', NULL, 'laura@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$Diy6rP04NFLc0dMwzsJXUu/3Qle7x68esJva4aCQ9X/sS0eILMhny', 4);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (584, 'MARINA SANTARÉM', NULL, 'marina@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$5FyX4HW3ahNajWdy7qkvvOEQSzl7U9ZjdKsNFYqV3RGujGAo.AT4m', 4);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (585, 'MIGUEL LUZ', NULL, 'miguel@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$crcV5KZ64n3Y.saxN1wIve6d6SKg.oAdm9jMzgJ67QdmbLmWUkTf.', 4);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (586, 'CLARA CHAME', NULL, 'chame@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$hBELobDpaH//Uzbd5w.7H.2xyT7sMrh9FfnSkXiM2hynAwNsMSyy.', 4);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (587, 'MIGUEL AMARAL', NULL, 'amaral@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$NIrXyY2Pi1AYqwZ/rruWFeQO5E91vyQdY8Wbfo6ZQdWaS0YTk8Gu.', 4);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (588, 'TIOS LEANDRO E MANU', NULL, 'leandro@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$m2nFMfjxlUGathQs6XAsQu/Cy7Do7amPn7zxa2hFdZ7aGzSLp7b6e', 4);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (589, 'TIO RENATO ALMEIDA', NULL, 'almeida@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$xza/nZNu5J4WqvZsnodNjuvonwsZGZz.xzNmRN28T4Sl4wFH9Rmpu', 4);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (590, 'JOÃO PAULO MANCEBO', NULL, 'mancebo@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$Aoj6Em3y8FlZ2Kv52cTzsunJQ2RPtkqfTsn0Ec63/J9exwS4AtZNO', 4);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (591, 'TIOS RODRIGO E BABI', NULL, 'babi@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$PcpV1TlDdcsWeBgG98Yk/OeUzMhRbt9Z80D9sa7ZOz5.EV8X7OZn.', 4);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (592, 'TIOS ANDERSON E ROBERTA', NULL, 'andersonroberta@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$wRezlXDv2XZ9Iw18W.yy6OfajOQVPLCD.s5Hf4CTnQk6ezbjt5IDe', 4);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (593, 'TIOS MARCUS E ALESSANDRA', NULL, 'marcusalessandra@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$OJKGu/Iztuju3J8e3TPnYOjeu1fQBWbwk2aToRsuCBgCtPdIqaIHC', 4);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (594, 'TIOS RYAN E RAFAELLA', NULL, 'ryanrafaella@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$NwHZVvYd72hiThuojVL29ufpx6VUk0r0Ktqok034rxdbq2IEvP93i', 4);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (595, 'TIOS MAYCON E JOSE', NULL, 'mayconjose@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$EtHXRKZRCIq1GpNBYmrEKeNMKP/bZQnFdDbFElom./g8395HIDEOS', 4);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (596, 'ISABELA BOECHAT', NULL, 'bela@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$H0TZBeJFbROFtdAIJZM/1.eyo.lgM2Fc6t6IFQ1vtqQLwVcHCwGuC', 4);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (597, 'JOÃO MIGUEL AREIAS', NULL, 'joaomiguel@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$Ytj4FkH7GoI7qI1asZ.aQOKbmM/yodimymQkfs0jqbCpW6PAU9a4S', 4);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (598, 'Tios Guiga e Paty', NULL, 'guiga@email.com', NULL, 'coordenador', NULL, NULL, NULL, '$2b$08$BaUtaxa4mshgnbA5JvHUDu5zmMN3dFb2JMRa2OZfxA8QmD1.dbKc2', 3);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (599, 'Daniel Mendes Aguiar', NULL, 'daniel@email.com', NULL, 'coordenador', NULL, NULL, NULL, '$2b$08$eQR6ByhQDJiDLNBSN2WKpuHXmH8NmMcte.3FghD5tXYlO5Te4VniO', 3);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (600, 'Giovanna Mangelli Almeida', NULL, 'giovanna@email.com', NULL, 'coordenador', NULL, NULL, NULL, '$2b$08$c6cLED.POnWF6.vI3YvVWePTes3u1MYoCAk5ICZ/pr7MU6hCiZrgO', 3);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (601, 'Benícia Nogueira França', NULL, 'benícia@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$m.fXcb/nrxcEV2LH72XhHuCSibKJqwHGC94OzB28FJgbNIXGoDAEG', 3);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (602, 'Bernardo Velloso Martins', NULL, 'bernardo@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$ucE7uQBLwGRmH.JSpzPEfu.NYiOC0jJpsv3ZR04yZKfChwRBSUnEe', 3);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (603, 'Bianca Fiorentino Menezes', NULL, 'bianca@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$eG7cJ6SmUghhGG8sf.xaUeqNH6KUJIHyygzNVeBNbLx84wJLY/A..', 3);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (604, 'Breno Santarém Figueiredo', NULL, 'breno@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$nHko/5cHvVB2VgmNnvgxZuk2BB3fjFxdsZStxC8UImdejpAEpfR4a', 3);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (605, 'Carolina Ribas Mendes', NULL, 'carolina@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$EVwE7EffICmHuHUJwDpJZeBT0mePZpmddeoBmAmR.yaQbXGyWSVM2', 3);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (606, 'Lucas Saramago Nunes Rangel', NULL, 'saramago@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$52bK9Z.F0d0bA8uUmdFkCeFS3.zq.v/tg1n9fMuXfOAs1zed.NeLq', 3);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (607, 'Maria Antonia Rabello Franco Carvalho Dias', NULL, 'franco@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$UFBgZr5ldfyeQbPFfxioaed/9kNyIcPHNQEWkmlIOyLd5UDrPgtSi', 3);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (608, 'Mariana Andrade de Oliveira Araujo', NULL, 'de@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$QvSMO1AvSKVcZcUx7F6rie9UuJPXBm7TBAH42P0nTIpZTRmy9PLli', 3);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (609, 'Paula Bravo Barbosa de Avelar', NULL, 'barbosa@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$q7u1aFsf7lja1yDZET9EU.8EmoHLWBglgRRgycdBpDPaJfnuaD9MW', 3);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (610, 'Pedro Cosendey C. da Costa', NULL, 'c@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$mnz4Ondkpe1GOScjWCw6AORC.rOhmUlgZKFtXfvk3TakpflPSx4yS', 3);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (611, 'Tios Phil e Carol', NULL, 'phil@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$dHPrhAWNpkoevDUXp.8q3uZyD0Lv4cvAaQKVbslpRgEyDKHOWpOaK', 3);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (612, 'Tios Leo e Sarah', NULL, 'leo@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$vAKG2AahABSK/1SZf/dQhOm6C71Fwg3tmw2qad0b./c9g.Qq89q6u', 3);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (613, 'Tios Marquinhos e Leniana', NULL, 'marquinhosleniana@email.com', NULL, 'coordenador', NULL, NULL, NULL, '$2b$08$ge21SKCkJsVPkhyiVUpRBeoyLAuj544fnMpSP6IZQXbAS9JB35kkK', 5);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (614, 'Giovana Gomes Bacci', NULL, 'bacci@email.com', NULL, 'coordenador', NULL, NULL, NULL, '$2b$08$yPApgYbR3Zx731Gh4AsvtuaucZFxkDWcFc/CxKpWcdy.GcexlNsg.', 5);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (615, 'João Vitor Fernandes Ribeiro', NULL, 'ribeiro@email.com', NULL, 'coordenador', NULL, NULL, NULL, '$2b$08$8uN.42CoOgJsNPFFuhogp.5US41D5GWnk1Mze9LfZoAJVY83i/6qa', 5);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (616, 'Ana Clara Coelho Ferreira', NULL, 'ferreira@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$6LHXlLGOLSnSll0fpLN5fucJwClFQAQe3PoBDBNHQGBZvnsjZXTCK', 5);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (617, 'Ana Luiza Ferreira de Souza', NULL, 'souza@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$WjQnvagivzRKMZzyNwoCbOkEvD/wi0S5mTeScKS4NMSoo9fUGPUFC', 5);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (618, 'Anna Beatriz Alves dos Santos', NULL, 'santos@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$HfHSlZoftJty7ITsO3S04ulIICszgI7UoRcv2E48rNLALg0ZJXeWS', 5);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (619, 'Estella Erthal Caldas Reis', NULL, 'reis@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$9ideFht9a8/pPtihqS.isujvVkCJhxkm0LwORNO/nio1slsjofXVi', 5);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (620, 'Ester Maria de Oliveira Teixeira', NULL, 'teixeira@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$wMCCInrkev5bgKtAAVfdKOK1aFmgpqHcKOWTCRxnQn/TqaMcsEDpS', 5);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (621, 'João Gabriel Dalla Costa Devillart', NULL, 'devillart@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$yQRbJdrnEiQz9b3OosTXi.zD6arNEKx/edKw2SWFYVjDjyV6Af3ty', 5);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (622, 'João Gabriel Soares Paulos', NULL, 'paulos@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$HcGB.zqcEAR0lj.YQ1LRR.Z3279CYyX4nqMcQ95Nd0Q5ESM45BKmq', 5);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (623, 'Juliana Galante Pereira', NULL, 'pereira@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$IZ9ObVUoD49fzJV4oD9EFuMtYWcaDgIQ35mqAv/7KUH7zD0lg0i8W', 5);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (624, 'Letícia Moreira Maciel', NULL, 'maciel@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$GAhArR0aGPa7UQqNHK.04uorwSKCNats1zkktxbWSsY4.DmJ1D1bS', 5);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (625, 'Manuella Polycarpo Balthazar', NULL, 'balthazar@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$MZWQVojY3rGulVMmNlBp4ubPDpMCEK9KWMtbd7Kt36.GnAfmxxSbi', 5);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (626, 'Maria Clara Buenaga Haddad', NULL, 'haddad@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$ZxyhdQJJDupJ/7WE6uOZAu00dRSf6ZdS8lD/sqG434KMiR4kKtqau', 5);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (627, 'Maria Luisa Gomes de Mendonça', NULL, 'mendonça@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$SrMP9Oud5Q47P4Leeq4q1.L5BUmYPn3eVZLnwKSQLxi8kmBzNDArm', 5);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (628, 'Mateus Ferreira Salgado', NULL, 'salgado@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$4x5U6yOI0XDm0KSUUVENxOzdzyTAiKVfgpT3miTfC8zSRf.a1qsaa', 5);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (629, 'Pedro Luiz Justi Siqueira', NULL, 'siqueira@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$woSKVuv6HguYK6PAImTqWu7wkNv3kB61IdkwI1so/nV12UyaB//9a', 5);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (630, 'Tiago Amazonas de Carvalho', NULL, 'carvalho@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$SK5Mp5De2y4ckIQA4lB6zeHX3CUBxJpHYEPjxWPZVf4PmXn8Jman.', 5);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (631, 'Tios Valter e Patrícia', NULL, 'valterpatricia@email.com', NULL, 'coordenador', NULL, NULL, NULL, '$2b$08$GDXzKsfYIb7CCjEKDqGA7e9AayaFP0I8ONH4DVH3f0887XZNoHOT2', 1);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (632, 'Anita Santos Bisi da Costa', NULL, 'costa@email.com', NULL, 'coordenador', NULL, NULL, NULL, '$2b$08$zhds9P2MuMoQQvrwa6a.EeP5eFWAhMpNgQyrS2/dsheF3fgw2SOAe', 1);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (633, 'Arthur Neves Bastos', NULL, 'bastos@email.com', NULL, 'coordenador', NULL, NULL, NULL, '$2b$08$ZwgCVVYz808Vy6rtvxIz8etyXXaPTcB0mj9cZFbWDMlseeXOeuNE2', 1);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (634, 'Beatriz Affonso Blaiotta', NULL, 'blaiotta@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$I3yFrfe0qGBdHjtbhtaQQeKLnI2xZzkTnsoFi2D5.Tg5487sxy2Je', 1);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (635, 'Bernardo Dantas Ribas', NULL, 'ribas@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$z7g3.t4/xjdi4JyjLK9eZeoHubC/vB0k5.j.7/O3iRwDg57B15MVi', 1);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (636, 'Catarina Pinheiro', NULL, 'pinheiro@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$yPGopGqCNokZPH4beimTgOd041iObbE3KPz15v1uiA9fvofchqfPq', 1);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (637, 'Clarice Eduarda Vieira Monteiro', NULL, 'eduardapatricia@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$8PIzW6/hpXD69sqBplbvi.J.4lI.wXQAY1s3TdZtZwGifog2s5QqO', 1);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (638, 'Daniel Christé Nogueira', NULL, 'nogueira@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$K0Y/RWXfnwXeuI.iEJJ1.uocFq5H8T7.fDJpXF2TJOOa.Ed/F3z5u', 1);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (639, 'Eduardo Calil Elias de Carvalho Gonçalves', NULL, 'gonçalves@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$hbfrgHIb1y2TdyPJ0W5TROS8//rbNZdc69A1kU1qrtA20NjKdcuPi', 1);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (640, 'Filipe de Oliveira Marcelino', NULL, 'depatricia@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$YJehDEkjYq8aB5quLyNkE.tmGhV/hn/Q5rYbV73EqCEd.TpLdVA4q', 1);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (641, 'Gabriel da Cunha Silva', NULL, 'dapatricia@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$Pa8JFuKAwy/kwmJOe7fzJexGNrlXHOmeefUYdJsBrzOoLXbrGHCcy', 1);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (642, 'Giovana Assad de Magalhães', NULL, 'assadpatricia@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$SYjZcuFm/9.OkG6u5k.NRez2d7umJTNUwJCEI14MQcXs/TkGGch0m', 1);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (643, 'Giovana Pinheiro Alvares Rodrigues', NULL, 'pinheiropatricia@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$dnO0WM6vQWfw.oIRhUmQ4uX5VSxsh/P5rG8KZgr0K7BBTytQJQVT6', 1);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (644, 'Maria Clara Brito de Souza e Silva', NULL, 'silva@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$QXPpS9owq2PsbntSMQRwCuuTliIqN7VVY.WTLuddc9z2E9MuvuC7q', 1);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (645, 'Marina Dorchete', NULL, 'dorchete@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$fhv91bf0z4nsLhNyCjCCkO7wg4nggCh2LDn5CPprwU6ikc2wxqbrO', 1);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (646, 'Rafael Colucci Guerreiro da Silva', NULL, 'silvasss@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$hq4p71S3hEhVO9vrQ5WW.usn3sRZYmHJbfM3PWQ1sSa/RHXU3LRoy', 1);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (647, 'Victor Ciaravolo Teixeira de Moraes', NULL, 'moraes@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$eDTXpQs7ZhL0hnq6Tdbu9.vFfxmOnZKqdbIQYN9mjqfJM0Wg75zXi', 1);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (648, 'Tios Ralph e Erica', NULL, 'ralphpatricia@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$Cb/BsdIKSe2066FB3AeX3O9QYib.pCxaFxX8PJi5c0u8oFxk3f1mK', 1);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (649, 'Renatos', NULL, 'nato@emai.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$qgX4ji1iVbQzplsgB71HGemeExbpZauzhIQtyM3AWy1p0qQcczhGC', 1);
INSERT INTO usuario (id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo_id, eac_que_fez, foto, senha, equipe_id) VALUES (650, 'claro', NULL, 'nass@email.com', NULL, 'integrante', NULL, NULL, NULL, '$2b$08$yI5bb7gveQ/QMuRIZfn5T.1.xTWTzwIHJu.ns2T2J9I.YABsLc7uq', 1);

INSERT INTO equipe (id, nome, descricao, sobre, funcao) VALUES (1, 'Garçom', 'Equipe de garçom', 'Serve os adolescentes e tios', 'Equipe externa');
INSERT INTO equipe (id, nome, descricao, sobre, funcao) VALUES (2, 'Ordem e Montagem', 'Arruma e limpa o ambiente', 'A Equipe Ordem e Montagem é formada por dois casais coordenadores: um adulto e um adolescente e por um grupo de apoio, de acordo com a necessidade.<div><br></div><div><b>Introdução</b>&nbsp;</div><div>A boa ordem das dependências do local do Encontro do E A C  depende muito da equipe de Ordem e Montagem.</div><div><br></div><div><b>Objetivo</b>&nbsp;</div><div>&nbsp;A Equipe deve manter as dependências comuns do E A C  na mais perfeita ordem e higienizadas.
</div>', 'Equipe interna');
INSERT INTO equipe (id, nome, descricao, sobre, funcao) VALUES (3, 'Banda', '', '', 'Equipe externa ');
INSERT INTO equipe (id, nome, descricao, sobre, funcao) VALUES (4, 'Sala', '', '<p class="MsoNormal" style="text-align:justify"><span style="font-size:11.0pt">A
Equipe de Sala é formada por um casal coordenador adulto por um casal
coordenador adolescente pelos apresentadores, pelo casal Boa Vontade, pela
Recepção de Palestrantes (pelo Núcleo Palestras),&nbsp; pelos Coordenadores de dirigentes, pelos
Dirigentes de círculo, pelos Espiões&nbsp; e
pela ligação.<o:p></o:p></span></p><p class="MsoNormal" style="text-align:justify"><span style="font-size:11.0pt"><br></span></p><h3 style="margin-bottom:0cm"><b><span style="font-size:13.0pt;line-height:150%">APRESENTADORES<o:p></o:p></span></b></h3><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l0 level1 lfo1;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Pegar com
os coordenadores gerais a pasta de apresentadores.<o:p></o:p></span></i></p><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l0 level1 lfo1;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Verificar e
confirmar com o Núcleo Palestra a ordem das mesmas e a necessidade da
realização de&nbsp; sócio-drama, texto
introdutório, música...Combinar previamente com a Equipe de Banda as músicas a
serem tocadas.<o:p></o:p></span></i></p><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l0 level1 lfo1;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Ver com
Coordenadores se haverá Convidado Especial e inserir na pasta chamadas do
mesmo. Providenciar junto a Equipe de Secretaria cartaz com o dizer indicando o
lugar reservado para Ele.<o:p></o:p></span></i></p><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l0 level1 lfo1;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Alegria,
animação, atenção...são atributos indispensáveis aos apresentadores que deverão
também se preocuparem com a qualidade do som, se todos estão escutando o que
falam.<o:p></o:p></span></i></p><p class="MsoNormal" style="text-align:justify;line-height:150%"><i><span style="font-size:11.0pt;mso-bidi-font-size:
10.0pt;line-height:150%">&nbsp;</span></i></p><h3 style="margin-bottom:0cm"><b><span style="font-size:13.0pt;line-height:150%">BOA VONTADE<o:p></o:p></span></b></h3><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l0 level1 lfo1;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Providenciar
junto ao casal finanças a caixa de remédios (Cuidado com o Vencimento), a
compra de copos descartáveis e garrafões com água para os palestrantes e os
encontristas. Sugestão : Verificar com a Equipe de Visitação se há a
necessidade de algum medicamento em especial para algum encontrista.<o:p></o:p></span></i></p><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l0 level1 lfo1;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Providenciar
toalha, jarra e flores para a mesa&nbsp;
que&nbsp; fica&nbsp; de&nbsp;
frente&nbsp; na&nbsp; sala&nbsp;
de&nbsp; palestra (as flores são
compradas pelo núcleo).<o:p></o:p></span></i></p><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l0 level1 lfo1;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Ao conduzir
o (a) encontrista ao banheiro, verificar se não há presença de equipes internas
no caminho, principalmente a Equipe de Ordem e Montagem.<o:p></o:p></span></i></p><p class="MsoNormal" style="text-align:justify;line-height:150%"><i><span style="font-size:11.0pt;mso-bidi-font-size:
10.0pt;line-height:150%">&nbsp;</span></i></p><h5><u>RECEPÇÃO DE PALESTRANTES</u> (Núcleo
Palestra)<o:p></o:p></h5><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l0 level1 lfo1;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Confirmar
as palestras com 10 dias de antecedência e na semana do Encontro. <o:p></o:p></span></i></p><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l0 level1 lfo1;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Ver junto
aos palestrantes se estes vão precisar de recursos áudio visuais (projetor de
slides, retro-projetor, data-show, som etc). Se necessário, providenciá-los.<o:p></o:p></span></i></p><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l0 level1 lfo1;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">É
obrigatória a permanência do núcleo palestra na sala.<o:p></o:p></span></i></p><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l0 level1 lfo1;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Preparar
mensagens para os palestrantes.<o:p></o:p></span></i></p><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l0 level1 lfo1;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Providenciar
junto ao casal finanças a compra de flores ou outra possibilidade criativa de
lembrança &nbsp;para os palestrantes.<o:p></o:p></span></i></p><p class="MsoNormal" style="text-align:justify;line-height:150%"><u><o:p>&nbsp;</o:p></u></p><p class="MsoNormal" style="text-align:justify;line-height:150%"><u><o:p>&nbsp;</o:p></u></p><h5><u>ÁUDIO VISUAL<o:p></o:p></u></h5><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l0 level1 lfo1;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Responsável
pelo som da sala de palestras no sábado e no domingo, pela missa de entrega,
Noite de Interiorização, EPAC e a sexta-feira.<o:p></o:p></span></i></p><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l0 level1 lfo1;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Ver junto
aos palestrantes se estes vão precisar de recursos áudio visuais (projetor de
slides, retro-projetor, data-show, som etc). Se necessário, providenciá-los.<o:p></o:p></span></i></p><h5><u>LIGAÇÃO<o:p></o:p></u></h5><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l1 level1 lfo2;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Ver com os
coordenadores gerais as equipes que vão ligar.<o:p></o:p></span></i></p><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l1 level1 lfo2;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Observar
possíveis “passeios desnecessários” nos corredores e orientar para que não
hajam..<o:p></o:p></span></i></p><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l1 level1 lfo2;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Recepcionar
os palestrantes, levá-los para fazer Vigília (se assim desejarem) e depois para
a sala de palestras.<o:p></o:p></span></i></p><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l1 level1 lfo2;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Evitar a
entrada de encontreiros na sala de palestras, após o início de cada palestra.<o:p></o:p></span></i></p><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l1 level1 lfo2;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Buscar as equipes
nas salas para Meditação e Doutrina (ver os horários com os coordenadores
gerais).<o:p></o:p></span></i></p><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l1 level1 lfo2;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Recolher as
mensagens das equipes que estão responsáveis e entregá-las aos coordenadores das
equipes “destinadas” (que deverão colocar nos &nbsp;respectivos envelopes &nbsp;destinatários).<o:p></o:p></span></i></p><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l1 level1 lfo2;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Buscar as
equipes nas salas na hora da apresentação final.<o:p></o:p></span></i></p><h5><u>DIRIGENTES DE CÍRCULO<o:p></o:p></u></h5><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l1 level1 lfo2;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Participar
do treinamento, sob a responsabilidade do casal Pós-Encontro (antes do EAC) e
depois para orientações nas reuniões de círculo.<o:p></o:p></span></i></p><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l1 level1 lfo2;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Participar
do EPAC aonde serão apresentados aos pais dos seus futuros adolescentes.<o:p></o:p></span></i></p><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l1 level1 lfo2;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Durante o
EAC, procurar não evidenciar que formam um casal preservando assim a surpresa
no momento que os círculos se juntarem.<o:p></o:p></span></i></p><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l1 level1 lfo2;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Os
compromissos com os novos adolescentes, além do final de semana do EAC, serão
nos Pós-Encontros ( de 15 em 15 dias) e ao menos uma vez por mês realizar uma
Reunião de Círculo (Festiva ou&nbsp; de
Doutrina). O comparecimento nas missas também será fundamental já que passarão
a ser considerados referências.<o:p></o:p></span></i></p><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l1 level1 lfo2;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Ao final do
encontro, solicitar que seus adolescentes anotem os próximos compromissos no
quadrante (próximo Pós-Encontro) e nesse Pós já marcar a primeira reunião do
Círculo, se possível for conjuntamente com os outros Tios na mesma data,
horário e local<o:p></o:p></span></i></p><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l1 level1 lfo2;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Lembrar que
se foram convidados e disseram Sim a Deus, certamente Ele os capacitará e todo
o mais será plenamente bem realizado.<o:p></o:p></span></i></p><h5><u>ESPIÕES<o:p></o:p></u></h5><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l1 level1 lfo2;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Participar
do treinamento dos dirigentes de círculo (descrito acima) antes do EAC, ser bem
ativo integrando os Encontristas e após o término do EAC ainda assim ligar para
motivar ajudando os Tios de círculo. A continuidade dos novos adolescentes
depende de vocês também<o:p></o:p></span></i></p><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l1 level1 lfo2;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Tomar a
iniciativa para falar caso os encontristas esteja tímidos e assim os
encorajando. É importante que todos sejam participativos, porém não devem
exagerar despertando assim a desconfiança por parte dos membros do grupo.<o:p></o:p></span></i></p><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l1 level1 lfo2;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Combinar
com os tios a possibilidade de estarem freqüentando as primeiras reuniões do
Círculo dando o exemplo e continuando seu trabalho e caso o Círculo de origem
não mais exista, ver possibilidade de engajar no “novo”&nbsp; junto ao Núcleo.<o:p></o:p></span></i></p><p class="MsoNormal" style="margin-left:18.0pt;text-align:justify;text-indent:
-18.0pt;line-height:150%;mso-list:l1 level1 lfo2;tab-stops:list 18.0pt"><!--[if !supportLists]--><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%;font-family:
Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol">¨<span style="font-variant-numeric: normal; font-variant-east-asian: normal; font-variant-alternates: normal; font-size-adjust: none; font-kerning: auto; font-optical-sizing: auto; font-feature-settings: normal; font-variation-settings: normal; font-variant-position: normal; font-variant-emoji: normal; font-stretch: normal; font-size: 7pt; line-height: normal; font-family: &quot;Times New Roman&quot;;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><!--[endif]--><i><span style="font-size:11.0pt;mso-bidi-font-size:10.0pt;line-height:150%">Estudar as
dinâmicas que serão vivenciadas durante o encontro juntamente com os tios.<o:p></o:p></span></i></p><p class="MsoNormal" style="text-align:justify">



















































































</p><p class="MsoNormal" style="text-align:justify;line-height:150%"><i><span style="font-size:11.0pt;mso-bidi-font-size:
10.0pt;line-height:150%">&nbsp;</span></i></p>', 'Equipe externa ');
INSERT INTO equipe (id, nome, descricao, sobre, funcao) VALUES (5, 'Mini-bar', '', '', 'Equipe externa');
INSERT INTO equipe (id, nome, descricao, sobre, funcao) VALUES (6, 'Vigília', '', '', 'Equipe interna');
INSERT INTO equipe (id, nome, descricao, sobre, funcao) VALUES (7, 'Meditação', '', '', 'Equipe interna');
INSERT INTO equipe (id, nome, descricao, sobre, funcao) VALUES (8, 'Doutrina', '', '', 'Equipe interna');
INSERT INTO equipe (id, nome, descricao, sobre, funcao) VALUES (9, 'Cozinha', '', '', 'Equipe interna');
INSERT INTO equipe (id, nome, descricao, sobre, funcao) VALUES (10, 'Secretaria', '', '', 'Equipe interna');
INSERT INTO equipe (id, nome, descricao, sobre, funcao) VALUES (11, 'Evangelização Infantil', '', '', 'Equipe interna');
INSERT INTO equipe (id, nome, descricao, sobre, funcao) VALUES (12, 'Portaria', '', '', 'Equipe externa');
INSERT INTO equipe (id, nome, descricao, sobre, funcao) VALUES (13, 'Visitação', '', '', 'Equipe externa');

INSERT INTO checklist (id, titulo, descricao, tipo) VALUES (1, 'testes', 'teste', 'pré-encontro');
INSERT INTO checklist (id, titulo, descricao, tipo) VALUES (2, 'teste 2', 'testes 2', 'durante o encontro');
INSERT INTO checklist (id, titulo, descricao, tipo) VALUES (3, 'Participar', 'Participar das reuniões preparatórias, Noite de Interiorização, Missa de Entrega e das atividades programadas para a sexta-feira, véspera do Encontro.', 'pré-encontro');

INSERT INTO checklist_equipes (id, checklist_id, equipe_id) VALUES (5, 1, 2);
INSERT INTO checklist_equipes (id, checklist_id, equipe_id) VALUES (6, 2, 2);
INSERT INTO checklist_equipes (id, checklist_id, equipe_id) VALUES (7, 3, 4);

INSERT INTO notificacao (id, titulo, descricao, para_todos, equipe_id) VALUES (1, 'teste ', 'teste notificação', 0, 1);
INSERT INTO notificacao (id, titulo, descricao, para_todos, equipe_id) VALUES (2, 'Notificação', 'Notificaão nova', 0, 2);

INSERT INTO agenda (id, titulo, descricao, data, hora_inicio, hora_fim, local, presenca_ativa) VALUES (2, 'Pós-Montagem', 'Pós montagem é quando os adolescentes descobrem as equipes que irão trabalhar', '2025-08-17 03:00:00', '17:00:00', '18:50:00', 'CPA', 1);
INSERT INTO agenda (id, titulo, descricao, data, hora_inicio, hora_fim, local, presenca_ativa) VALUES (3, '1ª Preparatória', 'Primeira reunião preparatória para o EAC 77', '2025-08-24 03:00:00', '17:00:00', '18:50:00', 'CPA', 1);
INSERT INTO agenda (id, titulo, descricao, data, hora_inicio, hora_fim, local, presenca_ativa) VALUES (4, '2ª Preparatória', 'Segunda reunião preparatória do EAC7 77', '2025-08-31 03:00:00', '17:00:00', '18:50:00', 'CPA', 1);
INSERT INTO agenda (id, titulo, descricao, data, hora_inicio, hora_fim, local, presenca_ativa) VALUES (5, '3ª Preparatória', 'Terceira Reunião Preparatória', '2025-09-07 03:00:00', '17:00:00', '18:50:00', 'CPA', 1);
INSERT INTO agenda (id, titulo, descricao, data, hora_inicio, hora_fim, local, presenca_ativa) VALUES (6, 'EPAC', 'Encontro com os Pais dos adolescentes que irão fazer o encontro.', '2025-09-25 03:00:00', '19:00:00', '22:00:00', 'CPA', 0);
INSERT INTO agenda (id, titulo, descricao, data, hora_inicio, hora_fim, local, presenca_ativa) VALUES (7, 'Missa de Entrega', 'Missa de entrega dos Adolescentes que irão fazer o encontro no final de semana do encontro.', '2025-09-26 03:00:00', '19:00:00', '20:00:00', 'Basílica', 0);
INSERT INTO agenda (id, titulo, descricao, data, hora_inicio, hora_fim, local, presenca_ativa) VALUES (8, 'Sábado - EAC 77', '', '2025-09-27 03:00:00', '08:00:00', '19:00:00', 'CPA ', 0);
INSERT INTO agenda (id, titulo, descricao, data, hora_inicio, hora_fim, local, presenca_ativa) VALUES (9, 'Domingo - EAC', '', '2025-09-28 03:00:00', '07:00:00', '19:00:00', 'CPA', 0);
INSERT INTO agenda (id, titulo, descricao, data, hora_inicio, hora_fim, local, presenca_ativa) VALUES (10, 'Tarde de Interiorização', 'Tarde de Interiorização para meditar sobre o tema e ficar preparado espiritualmente para o EAC', '2025-09-20 03:00:00', '14:00:00', '18:00:00', 'Oratório Mamãe Margarida', 1);

INSERT INTO reflexao (id, texto, usuario_id, agenda_id, equipe_id, anexo, data) VALUES (7, 'teste', 4, 2, NULL, 'uploads/reflexoes/1751601721444.jpg', '2025-07-04 03:57:47');

INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (111, 4, 579, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (112, 4, 580, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (113, 4, 581, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (114, 4, 582, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (115, 4, 584, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (116, 4, 583, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (117, 4, 585, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (118, 4, 586, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (119, 4, 587, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (120, 4, 588, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (121, 4, 589, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (122, 4, 590, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (123, 4, 591, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (124, 4, 592, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (125, 4, 593, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (126, 4, 594, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (127, 4, 595, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (128, 4, 596, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (129, 4, 597, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (213, 3, 598, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (214, 3, 599, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (215, 3, 600, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (216, 3, 601, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (217, 3, 602, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (218, 3, 603, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (219, 3, 604, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (220, 3, 605, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (221, 3, 608, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (222, 3, 609, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (223, 3, 610, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (224, 3, 612, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (295, 2, 4, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (296, 5, 613, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (297, 5, 615, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (298, 5, 614, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (299, 5, 617, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (300, 5, 618, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (301, 5, 619, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (302, 5, 616, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (303, 5, 620, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (304, 5, 621, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (305, 5, 623, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (306, 5, 628, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (307, 1, 2, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (308, 1, 631, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (309, 1, 632, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (310, 1, 633, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (311, 1, 634, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (312, 1, 635, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (313, 1, 636, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (314, 1, 638, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (315, 1, 640, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (316, 1, 645, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (317, 1, 649, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (318, 1, 650, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (319, 1, 2, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (320, 1, 631, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (321, 1, 634, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (322, 1, 632, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (323, 1, 633, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (324, 1, 635, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (325, 1, 636, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (326, 1, 638, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (327, 1, 640, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (328, 1, 645, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (329, 1, 649, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (330, 1, 650, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (331, 1, 2, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (332, 1, 631, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (333, 1, 632, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (334, 1, 633, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (335, 1, 634, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (336, 1, 635, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (337, 1, 636, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (338, 1, 638, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (339, 1, 640, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (340, 1, 645, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (341, 1, 649, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (342, 1, 650, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (343, 1, 2, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (344, 1, 631, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (345, 1, 632, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (346, 1, 633, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (347, 1, 634, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (348, 1, 635, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (349, 1, 636, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (350, 1, 638, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (351, 1, 640, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (352, 1, 645, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (353, 1, 649, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (354, 1, 650, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (355, 2, 4, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (356, 2, 4, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (357, 2, 4, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (358, 2, 4, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (359, 2, 4, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (360, 2, 4, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (361, 2, 4, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (362, 1, 2, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (363, 1, 631, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (364, 1, 632, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (365, 1, 633, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (366, 1, 634, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (367, 1, 635, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (368, 1, 636, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (369, 1, 638, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (370, 1, 640, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (371, 1, 645, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (372, 1, 649, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (373, 1, 650, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (374, 1, 2, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (375, 1, 631, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (376, 1, 632, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (377, 1, 633, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (378, 1, 634, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (379, 1, 635, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (380, 1, 636, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (381, 1, 645, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (382, 1, 638, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (383, 1, 640, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (384, 1, 649, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (385, 1, 650, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (386, 2, 4, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (387, 2, 4, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (388, 2, 4, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (389, 2, 4, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (390, 2, 4, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (391, 4, 579, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (392, 4, 580, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (393, 4, 581, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (394, 4, 582, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (395, 4, 583, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (396, 4, 584, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (397, 4, 585, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (398, 4, 586, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (399, 4, 587, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (400, 4, 588, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (401, 4, 589, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (402, 4, 590, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (403, 4, 591, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (404, 4, 592, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (405, 4, 593, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (406, 4, 594, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (407, 4, 595, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (408, 4, 596, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (409, 4, 597, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (410, 2, 4, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (411, 2, 4, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (412, 2, 4, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (413, 2, 4, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (414, 2, 4, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (415, 2, 4, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (416, 2, 4, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (417, 2, 4, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (418, 2, 4, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (419, 1, 2, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (420, 1, 631, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (421, 1, 632, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (422, 1, 633, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (423, 1, 634, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (424, 1, 635, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (425, 1, 636, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (426, 1, 638, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (427, 1, 647, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (428, 1, 640, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (429, 1, 645, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (430, 1, 649, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (431, 1, 650, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (432, 2, 4, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (433, 2, 4, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (434, 1, 2, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (435, 1, 631, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (436, 1, 632, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (437, 1, 633, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (438, 1, 634, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (439, 1, 635, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (440, 1, 636, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (441, 1, 637, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (442, 1, 638, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (443, 1, 640, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (444, 1, 639, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (445, 1, 641, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (446, 1, 642, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (447, 1, 643, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (448, 1, 644, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (449, 1, 645, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (450, 1, 646, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (451, 1, 647, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (452, 1, 648, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (453, 1, 649, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (454, 1, 650, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (455, 1, 2, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (456, 1, 631, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (457, 1, 632, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (458, 1, 633, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (459, 1, 634, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (460, 1, 635, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (461, 1, 636, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (462, 1, 637, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (463, 1, 638, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (464, 1, 639, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (465, 1, 640, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (466, 1, 641, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (467, 1, 642, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (468, 1, 643, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (469, 1, 644, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (470, 1, 645, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (471, 1, 646, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (472, 1, 647, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (473, 1, 648, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (474, 1, 649, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (475, 1, 650, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (476, 1, 2, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (477, 1, 631, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (478, 1, 632, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (479, 1, 633, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (480, 1, 634, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (481, 1, 635, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (482, 1, 636, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (483, 1, 637, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (484, 1, 638, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (485, 1, 639, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (486, 1, 640, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (487, 1, 641, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (488, 1, 642, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (489, 1, 643, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (490, 1, 644, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (491, 1, 645, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (492, 1, 646, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (493, 1, 647, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (494, 1, 648, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (495, 1, 649, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (496, 1, 650, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (497, 1, 2, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (498, 1, 631, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (499, 1, 632, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (500, 1, 633, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (501, 1, 634, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (502, 1, 635, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (503, 1, 636, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (504, 1, 637, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (505, 1, 638, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (506, 1, 639, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (507, 1, 640, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (508, 1, 641, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (509, 1, 642, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (510, 1, 643, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (511, 1, 644, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (512, 1, 645, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (513, 1, 646, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (514, 1, 647, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (515, 1, 648, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (516, 1, 649, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (517, 1, 650, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (518, 1, 2, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (519, 1, 631, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (520, 1, 632, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (521, 1, 633, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (522, 1, 634, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (523, 1, 635, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (524, 1, 636, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (525, 1, 637, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (526, 1, 638, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (527, 1, 639, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (528, 1, 640, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (529, 1, 641, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (530, 1, 642, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (531, 1, 643, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (532, 1, 644, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (533, 1, 645, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (534, 1, 646, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (535, 1, 647, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (536, 1, 648, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (537, 1, 649, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (538, 1, 650, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (539, 4, 581, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (540, 4, 582, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (541, 4, 580, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (542, 4, 586, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (543, 4, 596, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (544, 4, 597, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (545, 4, 590, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (546, 4, 583, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (547, 4, 584, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (548, 4, 587, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (549, 4, 585, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (550, 4, 589, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (551, 4, 592, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (552, 4, 588, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (553, 4, 593, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (554, 4, 595, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (555, 4, 591, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (556, 4, 594, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (557, 4, 579, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (558, 4, 579, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (559, 4, 580, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (560, 4, 581, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (561, 4, 582, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (562, 4, 583, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (563, 4, 584, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (564, 4, 585, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (565, 4, 586, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (566, 4, 587, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (567, 4, 588, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (568, 4, 589, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (569, 4, 590, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (570, 4, 591, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (571, 4, 592, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (572, 4, 593, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (573, 4, 594, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (574, 4, 595, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (575, 4, 596, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (576, 4, 597, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (577, 4, 579, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (578, 4, 580, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (579, 4, 581, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (580, 4, 582, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (581, 4, 583, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (582, 4, 584, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (583, 4, 585, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (584, 4, 586, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (585, 4, 587, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (586, 4, 588, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (587, 4, 589, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (588, 4, 590, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (589, 4, 591, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (590, 4, 592, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (591, 4, 593, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (592, 4, 594, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (593, 4, 595, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (594, 4, 596, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (595, 4, 597, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (596, 4, 581, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (597, 4, 582, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (598, 4, 586, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (599, 4, 580, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (600, 4, 596, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (601, 4, 597, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (602, 4, 590, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (603, 4, 583, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (604, 4, 584, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (605, 4, 587, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (606, 4, 585, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (607, 4, 589, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (608, 4, 592, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (609, 4, 588, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (610, 4, 593, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (611, 4, 595, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (612, 4, 591, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (613, 4, 594, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (614, 4, 579, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (615, 4, 579, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (616, 4, 580, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (617, 4, 581, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (618, 4, 582, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (619, 4, 583, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (620, 4, 584, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (621, 4, 585, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (622, 4, 586, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (623, 4, 587, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (624, 4, 588, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (625, 4, 589, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (626, 4, 590, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (627, 4, 591, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (628, 4, 592, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (629, 4, 593, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (630, 4, 594, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (631, 4, 595, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (632, 4, 596, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (633, 4, 597, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (634, 4, 579, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (635, 4, 580, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (636, 4, 581, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (637, 4, 582, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (638, 4, 583, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (639, 4, 584, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (640, 4, 585, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (641, 4, 586, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (642, 4, 587, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (643, 4, 588, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (644, 4, 589, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (645, 4, 590, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (646, 4, 591, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (647, 4, 592, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (648, 4, 593, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (649, 4, 594, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (650, 4, 595, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (651, 4, 596, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (652, 4, 597, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (653, 4, 579, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (654, 4, 580, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (655, 4, 581, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (656, 4, 582, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (657, 4, 583, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (658, 4, 584, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (659, 4, 585, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (660, 4, 586, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (661, 4, 587, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (662, 4, 588, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (663, 4, 589, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (664, 4, 590, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (665, 4, 591, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (666, 4, 592, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (667, 4, 593, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (668, 4, 594, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (669, 4, 595, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (670, 4, 596, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (671, 4, 597, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (672, 4, 579, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (673, 4, 580, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (674, 4, 581, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (675, 4, 582, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (676, 4, 583, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (677, 4, 584, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (678, 4, 585, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (679, 4, 586, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (680, 4, 587, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (681, 4, 588, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (682, 4, 589, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (683, 4, 590, '2025-08-17 03:00:00', 1);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (684, 4, 591, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (685, 4, 592, '2025-08-17 03:00:00', 2);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (686, 4, 593, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (687, 4, 594, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (688, 4, 595, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (689, 4, 596, '2025-08-17 03:00:00', 0);
INSERT INTO presenca (id, equipe_id, usuario_id, data, presente) VALUES (690, 4, 597, '2025-08-17 03:00:00', 0);


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
