import React, { useContext } from 'react';
import { Layout as AntLayout, Badge, Avatar } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import BottomMenu from './BottomMenu';
import { useOutlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import logo from '../assets/img/logo.png';

const { Header, Content } = AntLayout;

const Layout: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const outlet = useOutlet();
  return (
    <AntLayout style={{ minHeight: '100vh',  }}>
      <Header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', height: 64 }}>
        <img src={logo} alt="EAC" style={{ height: 32 }} />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Badge dot>
            <BellOutlined
              onClick={() => navigate('/notificacoes')}
              style={{ fontSize: 20, marginRight: 16, color: '#000', cursor: 'pointer' }}
            />
          </Badge>
          <Avatar
            src={
              user?.foto
                ? `${api.defaults.baseURL}/${user.foto}`
                : 'https://via.placeholder.com/32'
            }
            onClick={() => navigate('/perfil')}
            style={{ marginRight: 8, cursor: 'pointer' }}
          />
        </div>
      </Header>
      <Content
        style={{
          background: '#ffffff',
          padding: '10px 2px 40px', // padding-top ajustado para não ficar escondido pelo Header fixo
        }}
      >
        <div style={{ maxWidth: 360, margin: '0 auto' }}>
          {outlet}
        </div>
      </Content>
      <BottomMenu />
    </AntLayout>
  );
};

export default Layout;
