-- Arquivo de schema para a tabela "reflexao"
-- Execute este SQL para criar/recriar a tabela de reflexões com anexos e chaves estrangeiras.

DROP TABLE IF EXISTS reflexao;

CREATE TABLE reflexao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  texto TEXT NOT NULL,
  usuario_id INT NOT NULL,
  agenda_id INT NULL,
  equipe_id INT NULL,
  anexo VARCHAR(255) NULL,
  data DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reflexao_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
  CONSTRAINT fk_reflexao_agenda FOREIGN KEY (agenda_id) REFERENCES agenda(id) ON DELETE SET NULL,
  CONSTRAINT fk_reflexao_equipe FOREIGN KEY (equipe_id) REFERENCES equipe(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
