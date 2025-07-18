import React, { useContext } from 'react';
import { Card, Avatar, Typography, Button } from 'antd';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Perfil: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <Card style={{ maxWidth: 360, margin: '0 auto', textAlign: 'center' }}>
      <Avatar
        size={100}
        src={
          user?.foto
            ? `${api.defaults.baseURL}/${user.foto}`
            : 'https://via.placeholder.com/100'
        }
      />
      <Title level={2} style={{ marginTop: 16 }}>{user?.nome}</Title>
      <Text>Email: {user?.email}</Text>
      <Text>Tipo: {user?.tipo_usuario}</Text>
      <Text>Equipe: {user?.equipe?.nome}</Text>
      <Button
        type="primary"
        icon={<LogoutOutlined />}
        danger
        block
        style={{ marginTop: 24 }}
        onClick={() => {
          logout();
          navigate('/login');
        }}
      >
        Sair
      </Button>
    </Card>
  );
};

export default Perfil;
