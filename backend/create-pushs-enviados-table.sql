-- Criação da tabela pushs_enviados para registrar cada envio de push notification
CREATE TABLE IF NOT EXISTS pushs_enviados (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    url VARCHAR(255),
    equipe_id INTEGER,
    usuario_id INTEGER,
    enviado_por INTEGER,
    status VARCHAR(50) DEFAULT 'enviado',
    erro TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adiciona FK se desejar (ajustar nomes das tabelas conforme necessário)
-- ALTER TABLE pushs_enviados ADD CONSTRAINT fk_equipe FOREIGN KEY (equipe_id) REFERENCES equipes(id);
-- ALTER TABLE pushs_enviados ADD CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id);
-- ALTER TABLE pushs_enviados ADD CONSTRAINT fk_enviado_por FOREIGN KEY (enviado_por) REFERENCES usuarios(id);
