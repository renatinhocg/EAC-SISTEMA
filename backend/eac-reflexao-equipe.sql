-- Tabela de relação N:N entre reflexao e equipe
CREATE TABLE IF NOT EXISTS reflexao_equipe (
  reflexao_id INT NOT NULL,
  equipe_id INT NOT NULL,
  PRIMARY KEY (reflexao_id, equipe_id),
  CONSTRAINT fk_re_reflexao FOREIGN KEY (reflexao_id) REFERENCES reflexao(id) ON DELETE CASCADE,
  CONSTRAINT fk_re_equipe FOREIGN KEY (equipe_id) REFERENCES equipe(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
