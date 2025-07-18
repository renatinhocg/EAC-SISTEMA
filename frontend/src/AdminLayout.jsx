import React, { useState } from 'react';
import { Layout, Menu, Avatar, Typography, Input, Dropdown } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { getApiUrl } from './config/api';
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
} from '@ant-design/icons';

const { Sider, Content, Header } = Layout;
const { Title, Text } = Typography;

const AdminLayout = ({ user, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const menuItems = [
    { key: 'dashboard', icon: <HomeOutlined />, label: <Link to="/dashboard">Dashboard</Link> },
    { key: 'usuarios', icon: <UserOutlined />, label: <Link to="/usuarios">Usuários</Link> },
    { key: 'equipes', icon: <TeamOutlined />, label: <Link to="/equipes">Equipes</Link> },
    { key: 'tipo_circulo', icon: <AppstoreOutlined />, label: <Link to="/tipo_circulo">Tios de Círculo</Link> },
    { key: 'checklists', icon: <CheckSquareOutlined />, label: <Link to="/checklists">Checklists</Link> },
    { key: 'agendas', icon: <CalendarOutlined />, label: <Link to="/agendas">Agenda</Link> },
    { key: 'reflexoes', icon: <CommentOutlined />, label: <Link to="/reflexoes">Reflexões</Link> },
    { key: 'notificacoes', icon: <NotificationOutlined />, label: <Link to="/notificacoes">Notificações</Link> },
  ];

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
        {/* Título e busca removidos conforme solicitado */}
        <div style={{ padding: collapsed ? 16 : 24, textAlign: 'center' }}>
          {!collapsed && <Title level={3} style={{ margin: 0 }}>EAC</Title>}
        </div>
        <div style={{ padding: collapsed ? 0 : '0 24px' }}>
          {!collapsed && <Text strong>Overview</Text>}
          <Menu mode="inline" selectedKeys={[location.pathname.replace('/', '') || 'dashboard']} style={{ border: 'none', marginTop: 8 }} items={menuItems} />
        </div>
        <div style={{ padding: collapsed ? 0 : '0 24px', marginTop: 24 }}>
          {!collapsed && <Text strong>Friends</Text>}
          <Menu
            mode="inline"
            style={{ border: 'none', marginTop: 8 }}
            items={[
              { key: 'friend1', icon: <UserOutlined />, label: 'Bagas Mahpie', disabled: true },
              { key: 'friend2', icon: <UserOutlined />, label: 'Sir Dandy', disabled: true },
              { key: 'friend3', icon: <UserOutlined />, label: 'Jhon Tosan', disabled: true }
            ]}
          />
        </div>
        <div style={{ position: 'absolute', bottom: 0, width: '100%' }}>
          <Menu
            mode="inline"
            style={{ border: 'none' }}
            items={[
              { key: 'settings', icon: <SettingOutlined />, label: 'Setting' },
              { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: onLogout }
            ]}
          />
        </div>
      </Sider>
      <Layout style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Header style={{ background: 'transparent', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Input prefix={<SearchOutlined />} placeholder="Search courses" style={{ width: collapsed ? 200 : 400 }} />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <MailOutlined style={{ fontSize: 20, marginRight: 24 }} />
            <BellOutlined style={{ fontSize: 20, marginRight: 24 }} />
            {/* Dropdown no avatar */}
            <Dropdown overlay={avatarMenu} trigger={['click']} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Avatar
                  src={user?.foto ? getApiUrl('${user.foto}') : undefined}
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
