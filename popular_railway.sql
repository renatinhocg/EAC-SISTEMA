-- Script SQL para popular o banco MySQL do Railway
-- Execute este script no MySQL Workbench ou interface do Railway

-- 1. Inserir usuários básicos
INSERT INTO usuarios (id, nome, email, senha, tipo, ativo, data_criacao) VALUES 
(1, 'Administrador do Sistema', 'admin@eac.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1, NOW()),
(2, 'João Silva', 'joao@eac.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 1, NOW()),
(3, 'Maria Santos', 'maria@eac.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 1, NOW()),
(4, 'Pedro Costa', 'pedro@eac.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 1, NOW());

-- 2. Inserir equipes de exemplo
INSERT INTO equipes (id, nome, descricao, ativo, data_criacao) VALUES 
(1, 'Equipe Alpha', 'Equipe de desenvolvimento principal', 1, NOW()),
(2, 'Equipe Beta', 'Equipe de testes e qualidade', 1, NOW()),
(3, 'Equipe Gamma', 'Equipe de suporte e operações', 1, NOW()),
(4, 'Equipe Delta', 'Equipe de pesquisa e inovação', 1, NOW());

-- 3. Inserir tipos de círculo
INSERT INTO tipo_circulo (id, nome, descricao) VALUES 
(1, 'Círculo de Melhoria', 'Foco em melhorias contínuas'),
(2, 'Círculo de Inovação', 'Foco em inovação e criatividade'),
(3, 'Círculo de Qualidade', 'Foco em qualidade e processos'),
(4, 'Círculo de Segurança', 'Foco em segurança e bem-estar');

-- 4. Inserir agendas de exemplo
INSERT INTO agendas (id, titulo, descricao, data_agenda, horario_inicio, horario_fim, tipo_circulo_id, usuario_criador_id, ativo, data_criacao) VALUES 
(1, 'Reunião de Planejamento Q1', 'Planejamento estratégico para o primeiro trimestre', '2025-01-15', '09:00:00', '11:00:00', 1, 1, 1, NOW()),
(2, 'Workshop de Inovação', 'Sessão criativa para novos projetos', '2025-01-20', '14:00:00', '17:00:00', 2, 1, 1, NOW()),
(3, 'Revisão de Qualidade', 'Análise dos processos de qualidade', '2025-01-25', '10:00:00', '12:00:00', 3, 1, 1, NOW());

-- 5. Inserir checklists de exemplo
INSERT INTO checklists (id, titulo, descricao, tipo_circulo_id, usuario_criador_id, ativo, data_criacao) VALUES 
(1, 'Checklist de Preparação', 'Itens para preparar reuniões', 1, 1, 1, NOW()),
(2, 'Checklist de Inovação', 'Itens para sessões criativas', 2, 1, 1, NOW()),
(3, 'Checklist de Qualidade', 'Itens para revisão de processos', 3, 1, 1, NOW());

-- 6. Inserir dados dos checklist_equipes (do banco local)
INSERT INTO checklist_equipes (id, checklist_id, equipe_id) VALUES 
(5, 1, 2),
(6, 2, 2),
(7, 3, 4);

-- 7. Inserir presenças de exemplo
INSERT INTO presencas (id, agenda_id, equipe_id, usuario_id, presente, data_criacao) VALUES 
(1, 1, 1, 2, 1, NOW()),
(2, 1, 1, 3, 1, NOW()),
(3, 1, 2, 4, 0, NOW()),
(4, 2, 2, 2, 1, NOW()),
(5, 2, 3, 3, 1, NOW());

-- 8. Inserir reflexões de exemplo
INSERT INTO reflexoes (id, agenda_id, equipe_id, usuario_id, reflexao, tipo, data_criacao) VALUES 
(1, 1, 1, 2, 'A reunião foi muito produtiva, conseguimos definir metas claras.', 'positiva', NOW()),
(2, 1, 1, 3, 'Precisamos melhorar a comunicação entre as equipes.', 'melhoria', NOW()),
(3, 2, 2, 2, 'O workshop trouxe muitas ideias inovadoras.', 'positiva', NOW());

-- 9. Inserir notificações de exemplo
INSERT INTO notificacoes (id, titulo, mensagem, tipo, usuario_destinatario_id, lida, data_criacao) VALUES 
(1, 'Bem-vindo ao EAC!', 'Seja bem-vindo ao sistema EAC. Explore as funcionalidades disponíveis.', 'info', 2, 0, NOW()),
(2, 'Nova Agenda Criada', 'Uma nova agenda foi criada: Reunião de Planejamento Q1', 'agenda', 3, 0, NOW()),
(3, 'Checklist Atualizado', 'O checklist de preparação foi atualizado.', 'checklist', 4, 0, NOW());

-- Mensagem de sucesso
SELECT 'Banco populado com sucesso! Agora você pode testar a aplicação.' as status;
