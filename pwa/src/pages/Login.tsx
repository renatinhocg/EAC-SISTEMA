import React, { useContext, useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios, { type AxiosError } from 'axios';

const { Title } = Typography;

interface LocationState { from?: { pathname: string } }

import SplashScreen from './SplashScreen';

const Login: React.FC = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  const state = location.state as LocationState;
  const from = state?.from?.pathname ?? '/';

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const onFinish = async (values: { email: string; senha: string }) => {
    setError(null);
    setLoading(true);
    try {
      await login(values.email, values.senha);
      navigate(from, { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError<{ error: string }>;
        const errorMessage = axiosErr.response?.data.error;
        
        // Personaliza as mensagens de erro para o usuário
        if (errorMessage === 'Usuário não encontrado') {
          setError('Email não cadastrado no sistema');
        } else if (errorMessage === 'Senha incorreta') {
          setError('Senha incorreta. Verifique e tente novamente');
        } else {
          setError(errorMessage ?? 'Erro ao efetuar login');
        }
      } else {
        setError('Erro de conexão. Verifique sua internet e tente novamente');
      }
    } finally {
      setLoading(false);
    }
  };

  // Limpa erro quando usuário começa a digitar
  const handleFormChange = () => {
    if (error) {
      setError(null);
    }
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div style={{ maxWidth: 360, margin: '100px auto', padding: '0 16px' }}>
      <Title level={2}>Login</Title>
      {error && (
        <Alert 
          message="Erro no Login" 
          description={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: 16 }} 
          closable
          onClose={() => setError(null)}
        />
      )}
      <Form name="login" onFinish={onFinish} layout="vertical" onValuesChange={handleFormChange}>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, type: 'email', message: 'Informe um email válido' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Senha"
          name="senha"
          rules={[{ required: true, message: 'Informe a senha' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Entrar
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
