import React, { useContext, useEffect, useState } from 'react';
import { Card, Typography, Spin, message } from 'antd';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

const { Paragraph, Title, Text } = Typography;

const Sobre: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [teamInfo, setTeamInfo] = useState<{ nome: string; sobre: string; funcao: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.equipe?.id) {
      setLoading(true);
      api.get(`/equipes/${user.equipe.id}`)
        .then(res => setTeamInfo({ nome: res.data.nome, sobre: res.data.sobre, funcao: res.data.funcao }))
        .catch(() => message.error('Erro ao carregar informações da equipe'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user?.equipe) {
    return (
      <Card>
        <Paragraph>Você não está associado a nenhuma equipe.</Paragraph>
      </Card>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {teamInfo && (
          <>
            <Title level={2} style={{ marginBottom: 0, textAlign: 'left' }}>Sobre {teamInfo.nome}</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24, textAlign: 'left' }}>{teamInfo.funcao}</Text>
          </>
        )}
        <Card bodyStyle={{ background: '#fff', borderRadius: 12, border: '1 solid #f00', padding: 24 }}>
          {loading ? (
            <Spin />
          ) : (
            <div
              style={{ whiteSpace: 'pre-wrap', textAlign: 'left', fontSize: 16 }}
              dangerouslySetInnerHTML={{ __html: teamInfo?.sobre || '' }}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default Sobre;
