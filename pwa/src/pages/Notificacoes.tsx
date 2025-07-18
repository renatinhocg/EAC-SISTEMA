import React, { useContext, useEffect, useState } from 'react';
import { List, Card, Spin, message } from 'antd';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

interface Notificacao {
  id: number;
  titulo: string;
  descricao: string;
  para_todos: boolean;
  equipe_id?: number;
}

const Notificacoes: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Notificacao[]>('/notificacoes')
      .then(res => {
        const data = res.data.filter(n =>
          n.para_todos || n.equipe_id === user?.equipe?.id
        );
        setNotificacoes(data);
      })
      .catch(() => message.error('Erro ao carregar notificações'))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return <Spin style={{ display: 'block', margin: '40px auto' }} />;
  }

  return (
    <List
      itemLayout="vertical"
      dataSource={notificacoes}
      renderItem={item => (
        <List.Item key={item.id} style={{ marginBottom: 16 }}>
          <Card title={item.titulo}>{item.descricao}</Card>
        </List.Item>
      )}
    />
  );
};

export default Notificacoes;
