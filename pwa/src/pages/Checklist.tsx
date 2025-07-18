import React, { useEffect, useState } from 'react';
import { Card, List, Checkbox, Typography, message, Spin, Collapse } from 'antd';
import api from '../services/api';

const { Title } = Typography;
const { Panel } = Collapse;

interface ChecklistItem { id: number; titulo: string; descricao: string; tipo: string; }

type ChecklistByTipo = {
  [tipo: string]: ChecklistItem[];
};

const tipos = [
  { key: 'pré-encontro', label: 'Pré-encontro' },
  { key: 'durante o encontro', label: 'Durante o encontro' },
  { key: 'pós-encontro', label: 'Pós-encontro' }
];

const Checklist: React.FC = () => {
  const [itemsByTipo, setItemsByTipo] = useState<ChecklistByTipo>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/checklists')
      .then(res => {
        const agrupado: ChecklistByTipo = {};
        tipos.forEach(t => agrupado[t.key] = []);
        (res.data || []).forEach((item: ChecklistItem) => {
          if (agrupado[item.tipo]) agrupado[item.tipo].push(item);
        });
        setItemsByTipo(agrupado);
      })
      .catch(() => message.error('Erro ao carregar checklist'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'left', padding: '32px 0' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <Title level={2} style={{ marginBottom: 0, textAlign: 'left' }}>Checklist</Title>
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 24, textAlign: 'left' }}>Acompanhe e marque suas tarefas</Typography.Text>
        <Card bodyStyle={{ background: '#fff', borderRadius: 12, border: '1 solid #f00', padding: 12 }}>
          {loading ? <Spin /> : (
            <Collapse 
              accordion 
              bordered={false} 
              style={{ background: 'transparent' }}
              expandIconPosition="start"
            >
              {tipos.map(tipo => (
                <Panel 
                  header={<span style={{ fontWeight: 'bold', fontSize: 18, display: 'block', textAlign: 'left' }}>{tipo.label}</span>} 
                  key={tipo.key}
                >
                  <List
                    dataSource={itemsByTipo[tipo.key] || []}
                    locale={{ emptyText: 'Nenhum item.' }}
                    renderItem={item => (
                      <List.Item>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Checkbox style={{ fontSize: 16 }}>{item.titulo}</Checkbox>
                          {item.descricao && (
                            <span style={{ fontSize: 14, color: '#888', marginLeft: 28, textAlign: 'left', display: 'block' }}>{item.descricao}</span>
                          )}
                        </div>
                      </List.Item>
                    )}
                  />
                </Panel>
              ))}
            </Collapse>
          )}
        </Card>
      </div>
    </div>
  );
}

export default Checklist;
