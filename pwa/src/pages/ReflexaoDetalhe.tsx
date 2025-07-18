import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, message, Button } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const { Title, Text } = Typography;

interface Equipe { id: number; nome: string }
interface Reflexao {
  id: number;
  texto: string;
  data: string;
  equipes?: Equipe[];
  anexo?: string;
}

const ReflexaoDetalhe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [reflexao, setReflexao] = useState<Reflexao | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/reflexoes/${id}`)
      .then(res => setReflexao(res.data))
      .catch(() => message.error('Erro ao carregar reflexão'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !reflexao) return <Spin style={{ margin: 32 }} />;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>Voltar</Button>
        <Card bodyStyle={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
          <Title level={4}>Reflexão</Title>
          <Text strong>Data:</Text> {new Date(reflexao.data).toLocaleString()}<br />
          <Text strong>Texto:</Text> <div style={{ margin: '8px 0 16px 0' }}>{reflexao.texto}</div>
          <Text strong>Equipes:</Text> {(reflexao.equipes || []).map(e => e.nome).join(', ') || '-'}<br />
          {reflexao.anexo && (
            <div style={{ marginTop: 16 }}>
              <a href={api.defaults.baseURL + '/' + reflexao.anexo} target="_blank" rel="noopener noreferrer">Baixar Anexo</a>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ReflexaoDetalhe;
