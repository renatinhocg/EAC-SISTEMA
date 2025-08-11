import React, { useContext, useState } from 'react';
import { Form, Input, Button } from 'antd';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios, { type AxiosError } from 'axios';

interface LocationState { from?: { pathname: string } }

const Login: React.FC = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const state = location.state as LocationState;
  const from = state?.from?.pathname ?? '/';

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

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#141B34',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Logo do EAC fora do box */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '40px' 
      }}>
        <img 
          src="/logo-eac.svg" 
          alt="Encontro de Adolescentes com Cristo" 
          style={{ 
            maxWidth: '280px', 
            height: 'auto',
          }} 
        />
      </div>

      {/* Box branco com formulário */}
      <div style={{ 
        width: '100%', 
        maxWidth: '360px',
        background: 'white',
        borderRadius: '20px',
        padding: '32px 24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '32px' 
        }}>
          <div style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            Login
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: '#6b7280'
          }}>
            Entre com suas credenciais
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#dc2626',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <span>⚠️</span>
              Erro no Login
            </div>
            <div style={{
              color: '#7f1d1d',
              fontSize: '13px',
              marginTop: '4px'
            }}>
              {error}
            </div>
          </div>
        )}
        
        <Form 
          name="login" 
          onFinish={onFinish} 
          layout="vertical" 
          onValuesChange={handleFormChange}
          style={{ width: '100%' }}
        >
          <Form.Item
            label={<span style={{ color: '#374151', fontWeight: '500' }}>Email</span>}
            name="email"
            rules={[{ required: true, type: 'email', message: 'Informe um email válido' }]}
            style={{ marginBottom: '20px' }}
          >
            <Input 
              placeholder="garcom@email.com"
              style={{ 
                height: '48px',
                borderRadius: '12px',
                fontSize: '16px'
              }}
            />
          </Form.Item>
          
          <Form.Item
            label={<span style={{ color: '#374151', fontWeight: '500' }}>Senha</span>}
            name="senha"
            rules={[{ required: true, message: 'Informe a senha' }]}
            style={{ marginBottom: '24px' }}
          >
            <Input.Password 
              placeholder="••••"
              style={{ 
                height: '48px',
                borderRadius: '12px',
                fontSize: '16px'
              }}
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block
              style={{
                height: '48px',
                borderRadius: '12px',
                background: '#2563eb',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              Entrar
            </Button>
          </Form.Item>
        </Form>
        versão 2.2
      </div>
    </div>
  );
};

export default Login;
