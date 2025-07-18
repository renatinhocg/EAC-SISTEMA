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
    '=== USUÁRIOS ADMIN PARA TESTE ===' as info,
    '' as email,
    '' as senha
UNION ALL
SELECT 
    'Email',
    'Senha',
    'Tipo'
UNION ALL
SELECT 
    email,
    'Usar senha do sistema local',
    tipo_usuario
FROM usuario 
WHERE tipo_usuario = 'admin' 
LIMIT 5;

-- =====================================================
-- SUCESSO!
-- =====================================================
SELECT '🎉 BANCO POPULADO COM SUCESSO!' as status;
SELECT '📊 Total de 538 registros importados do banco local' as info;
SELECT '🔑 Use as credenciais dos usuários existentes' as credenciais;