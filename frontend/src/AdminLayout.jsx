import React, { useState } from 'react';
import defaultAvatar from './assets/img/default-avatar.svg?url';
import logoEacAdmin from './assets/img/logo-eac-admin.png?url';
import { Layout, Menu, Avatar, Typography, Input, Dropdown } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { getApiUrl } from './config/api';
import { API_BASE_URL } from './config/api';
import {
  UserOutlined,
  TeamOutlined,
  NotificationOutlined,
  HomeOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  SearchOutlined,
  MailOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  CommentOutlined,
  CheckSquareOutlined, // ícone para checklists
  DollarOutlined, // ícone para pagamentos
  FileTextOutlined, // ícone para camisa
} from '@ant-design/icons';

const { Sider, Content, Header } = Layout;
const { Title, Text } = Typography;

const AdminLayout = ({ user, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  // Segmentação de menu por tipo de usuário
  let menuItems = [
    { key: 'dashboard', icon: <HomeOutlined />, label: <Link to="/admin/dashboard">Dashboard</Link> },
    { key: 'usuarios', icon: <UserOutlined />, label: <Link to="/admin/usuarios">Usuários</Link> },
    { key: 'equipes', icon: <TeamOutlined />, label: <Link to="/admin/equipes">Equipes</Link> },
    { key: 'tipo_circulo', icon: <AppstoreOutlined />, label: <Link to="/admin/tipo_circulo">Tios de Círculo</Link> },
    { key: 'checklists', icon: <CheckSquareOutlined />, label: <Link to="/admin/checklists">Checklists</Link> },
    { key: 'agendas', icon: <CalendarOutlined />, label: <Link to="/admin/agendas">Agenda</Link> },
    { key: 'reflexoes', icon: <CommentOutlined />, label: <Link to="/admin/reflexoes">Reflexões</Link> },
    { key: 'pagamentos', icon: <DollarOutlined />, label: <Link to="/admin/pagamentos">Pagamentos</Link> },
    { key: 'camisa', icon: <FileTextOutlined />, label: <Link to="/admin/camisa">Camisa</Link> },
    { key: 'notificacoes', icon: <NotificationOutlined />, label: <Link to="/admin/notificacoes">Notificações</Link> },
    { key: 'push', icon: <NotificationOutlined />, label: <Link to="/admin/push">Push</Link> },
    { key: 'admin_hamburguer', icon: <FileTextOutlined />, label: <Link to="/admin/hamburguer">Hambúrguer</Link> },
  { key: 'fotos', icon: <UserOutlined />, label: <Link to="/admin/fotos">Fotos</Link> },
  ];

if (user?.tipo_usuario?.toLowerCase() === 'integrante') {
  menuItems = menuItems.filter(item => !['checklists', 'agendas', 'reflexoes'].includes(item.key));
}

  // Menu de dropdown no avatar
  const avatarMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={onLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh', width: '100vw' }}>
      <Sider
        collapsible collapsed={collapsed} onCollapse={setCollapsed} width={240}
        style={{ position: 'relative', background: '#fff', boxShadow: '2px 0 8px #f0f1f2' }}
      >
        <div style={{ padding: collapsed ? 16 : 24, textAlign: 'center' }}>
            <img
              src={logoEacAdmin}
              alt="EAC Logo"
              style={{ maxWidth: '100%', height: 48, objectFit: 'contain' }}
            />
           
        </div>
        <div style={{ padding: collapsed ? 0 : '0 24px' }}>
          <Menu mode="inline" selectedKeys={[location.pathname.replace('/', '') || 'dashboard']} style={{ border: 'none', marginTop: 8 }} items={menuItems} />
        </div>
        <div style={{ position: 'absolute', bottom: 0, width: '100%' }}>
          <Menu
            mode="inline"
            style={{ border: 'none' }}
            items={[{ key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: onLogout }]}
          />
        </div>
      </Sider>
      <Layout style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Header style={{ background: 'transparent', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Input prefix={<SearchOutlined />} placeholder="Buscar" style={{ width: collapsed ? 200 : 400 }} />
          <div style={{ display: 'flex', alignItems: 'center' }}>
          
            {/* Dropdown no avatar */}
            <Dropdown overlay={avatarMenu} trigger={['click']} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Avatar
                  src={user?.foto
                    ? `${API_BASE_URL.replace('/api', '')}/uploads/usuarios/${user.foto}`
                    : defaultAvatar}
                  icon={!user?.foto && <UserOutlined />}
                />
                <Text style={{ marginLeft: 8, textTransform: 'capitalize' }}>{user?.tipo_usuario}</Text>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ flex: 1, padding: 24, background: '#f0f2f5' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
