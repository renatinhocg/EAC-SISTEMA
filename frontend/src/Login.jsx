import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Typography, message, Card } from 'antd';
import axios from 'axios';
import { getApiUrl } from './config/api';
import Illustration from './Illustration';

const { Title, Text } = Typography;

// Componente para forçar atualização do Service Worker e limpar cache
function ForceSWUpdate() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(reg => {
          reg.update();
          reg.unregister();
        });
      });
      // Limpa todos os caches do navegador relacionados ao domínio
      if (window.caches) {
        caches.keys().then(keys => {
          keys.forEach(key => caches.delete(key));
        });
      }
    }
  }, []);
  return null;
}

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(getApiUrl('usuarios/login'), values);
      message.success('Login realizado com sucesso!');
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      onLogin(response.data.token, response.data.user);
    } catch (error) {
      message.error(error.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flex: 1, overflow: 'auto' }}>
      <div style={{ flex: 1, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Illustration />
      </div>
      <div style={{ flex: 1, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <Card style={{ width: 360, boxShadow: '0 2px 8px #f0f1f2', borderRadius: 12, border: 'none' }} bodyStyle={{ padding: 32 }}>
          <div style={{ marginBottom: 32 }}>
            <Title level={2} style={{ marginBottom: 0 }}>Log In</Title>
            <Text type="secondary">Entre com seu usuário e senha para acessar o painel.</Text>
          </div>
          <Form name="login" layout="vertical" onFinish={onFinish}>
            <Form.Item name="username" label="Usuário" rules={[{ required: true, message: 'Digite seu usuário!' }]}> 
              <Input autoComplete="username" size="large" />
            </Form.Item>
            <Form.Item name="senha" label="Senha" rules={[{ required: true, message: 'Digite sua senha!' }]}> 
              <Input.Password autoComplete="current-password" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading} size="large">
                Sign In
              </Button>
            </Form.Item>
          </Form>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Text type="secondary">Não tem uma conta? <a href="#">Cadastre-se</a></Text><br />
            <a href="#" style={{ fontSize: 12 }}>Esqueceu a senha?</a>
          </div>
        </Card>
        versão 4.1
        {/* Força atualização do Service Worker e cache ao carregar a tela de login */}
        <ForceSWUpdate />
      </div>
    </div>
  );
};

export default Login;
