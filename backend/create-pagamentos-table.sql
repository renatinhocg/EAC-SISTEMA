-- Criação da tabela de pagamentos
CREATE TABLE IF NOT EXISTS pagamento (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    valor DECIMAL(10,2) NOT NULL DEFAULT 25.00,
    status VARCHAR(50) NOT NULL DEFAULT 'pendente',
    comprovante VARCHAR(255),
    data_envio TIMESTAMP,
    data_aprovacao TIMESTAMP,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pagamento_usuario_id ON pagamento(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pagamento_status ON pagamento(status);

-- Comentários nas colunas
COMMENT ON TABLE pagamento IS 'Tabela para gerenciar pagamentos da taxa EAC';
COMMENT ON COLUMN pagamento.usuario_id IS 'ID do usuário que fez o pagamento';
COMMENT ON COLUMN pagamento.valor IS 'Valor do pagamento em reais';
COMMENT ON COLUMN pagamento.status IS 'Status: pendente, aguardando_aprovacao, aprovado, rejeitado';
COMMENT ON COLUMN pagamento.comprovante IS 'Nome do arquivo do comprovante';
COMMENT ON COLUMN pagamento.data_envio IS 'Data de envio do comprovante';
COMMENT ON COLUMN pagamento.data_aprovacao IS 'Data de aprovação/rejeição do pagamento';
COMMENT ON COLUMN pagamento.observacoes IS 'Observações sobre o pagamento';
