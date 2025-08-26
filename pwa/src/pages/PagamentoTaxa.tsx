import React, { useState, useContext, useEffect } from 'react';
import { Button, Upload, Card, message, Progress, Tag } from 'antd';
import { UploadOutlined, ArrowLeftOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import type { UploadFile } from 'antd/es/upload/interface';

interface PagamentoInfo {
  id?: number;
  valor: number;
  status: string;
  comprovante?: string;
  data_envio?: string;
  observacoes?: string;
}

const PagamentoTaxa: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pagamentoInfo, setPagamentoInfo] = useState<PagamentoInfo | null>(null);

  // Carregar informações do pagamento
  useEffect(() => {
    const loadPagamentoInfo = async () => {
      try {
        const response = await api.get(`/pagamentos/usuario/${user?.id}`);
        setPagamentoInfo(response.data);
      } catch (error) {
        console.error('Erro ao carregar informações de pagamento:', error);
        // Se não existe pagamento, define valores padrão
        setPagamentoInfo({
          valor: 25,
          status: 'pendente'
        });
      }
    };

    if (user?.id) {
      loadPagamentoInfo();
    }
  }, [user?.id]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'aprovado':
        return {
          icon: <CheckCircleOutlined />,
          color: 'green',
          text: 'Pagamento Aprovado',
          description: 'Seu pagamento foi aprovado pela coordenação!'
        };
      case 'aguardando_aprovacao':
      case 'aguardando aprovação':
        return {
          icon: <ClockCircleOutlined />,
          color: 'blue',
          text: 'Aguardando Aprovação',
          description: 'Seu comprovante foi enviado e está sendo analisado.'
        };
      case 'rejeitado':
        return {
          icon: <ExclamationCircleOutlined />,
          color: 'red',
          text: 'Pagamento Rejeitado',
          description: 'Comprovante rejeitado. Entre em contato com a coordenação.'
        };
      default:
        return {
          icon: <ClockCircleOutlined />,
          color: 'orange',
          text: 'Pagamento Pendente',
          description: 'Faça o upload do seu comprovante de pagamento.'
        };
    }
  };

  const uploadProps = {
    beforeUpload: (file: File) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('Você só pode enviar arquivos JPG/PNG!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('A imagem deve ter menos de 2MB!');
        return false;
      }
      return false; // Impede upload automático
    },
    onChange: (info: { fileList: UploadFile[] }) => {
      setFileList(info.fileList.slice(-1)); // Manter apenas o último arquivo
    },
    fileList,
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('Por favor, selecione um arquivo!');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    const file = fileList[0].originFileObj;
    if (file && user?.id) {
      formData.append('comprovante', file);
      formData.append('valor', '25');
      formData.append('usuario_id', user.id.toString());
    } else {
      message.error(!file ? 'Erro ao processar o arquivo!' : 'Usuário não identificado!');
      setLoading(false);
      return;
    }

    try {
      console.log('🔑 Token disponível:', localStorage.getItem('token') ? 'SIM' : 'NÃO');
      console.log('� Usuário ID:', user?.id);
      console.log('�📤 Enviando comprovante...');
      
      // Debug dos dados do FormData
      console.log('📋 Dados sendo enviados:');
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `Arquivo: ${value.name}` : value);
      }
      
      // Simular progresso do upload
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await api.post('/pagamentos', formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      message.success('Comprovante enviado com sucesso!');
      
      // Atualizar informações do pagamento
      setPagamentoInfo({
        valor: 25,
        status: 'aguardando aprovação',
        data_envio: new Date().toISOString()
      });

      setFileList([]);
  } catch (error) {
      console.error('❌ Erro ao enviar comprovante:', error);
      
      let errorMessage = 'Erro ao enviar comprovante';
      if (typeof error === 'object' && error !== null) {
        const err = error as { response?: any; request?: any; message?: string };
        if (err.response) {
          // Erro da API
          console.error('📊 Status:', err.response.status);
          console.error('📝 Dados:', err.response.data);
          errorMessage = err.response.data?.error || `Erro ${err.response.status}: ${err.response.statusText}`;
        } else if (err.request) {
          // Erro de rede
          console.error('🌐 Erro de rede:', err.request);
          errorMessage = 'Erro de conexão. Verifique sua internet.';
        } else {
          errorMessage = err.message || 'Erro desconhecido';
        }
      } else {
        errorMessage = String(error);
      }
      message.error(errorMessage);
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const statusInfo = getStatusInfo(pagamentoInfo?.status || 'pendente');

  return (
    <div style={{
      minHeight: '100vh',
      background: '#141B34',
      padding: '20px 16px 90px 16px',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '32px'
      }}>
        <ArrowLeftOutlined 
          onClick={() => navigate('/')}
          style={{ 
            fontSize: '24px', 
            color: 'white',
            marginRight: '16px',
            cursor: 'pointer'
          }} 
        />
        <h1 style={{ 
          color: 'white', 
          fontSize: '24px', 
          fontWeight: '600',
          margin: 0
        }}>
          Taxa EAC
        </h1>
      </div>

      {/* Card de Valor */}
      <Card style={{ 
        marginBottom: '24px',
        borderRadius: '16px',
        border: 'none',
        backgroundColor: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <h3 style={{ 
            margin: 0, 
            marginBottom: '12px', 
            color: '#1a202c',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Valor da Taxa
          </h3>
          <div style={{ 
            fontSize: '36px', 
            fontWeight: '700',
            color: '#22c55e',
            marginBottom: '8px'
          }}>
            R$ {parseFloat(String(pagamentoInfo?.valor || '25')).toFixed(2).replace('.', ',')}
          </div>
          <p style={{ 
            color: '#64748b', 
            fontSize: '14px', 
            margin: 0,
            lineHeight: '1.4'
          }}>
            Taxa de participação do EAC 2025
          </p>
        </div>
      </Card>

      {/* Card de Status */}
      <Card style={{ 
        marginBottom: '24px',
        borderRadius: '16px',
        border: 'none',
        backgroundColor: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '16px',
            color: statusInfo.color === 'green' ? '#22c55e' : 
                   statusInfo.color === 'red' ? '#ef4444' :
                   statusInfo.color === 'blue' ? '#3b82f6' : '#f59e0b'
          }}>
            {statusInfo.icon}
          </div>
          <Tag color={statusInfo.color} style={{ 
            fontSize: '14px', 
            padding: '8px 16px',
            borderRadius: '20px',
            marginBottom: '12px',
            fontWeight: '600'
          }}>
            {statusInfo.text}
          </Tag>
          <p style={{ 
            color: '#666', 
            fontSize: '14px',
            margin: 0,
            lineHeight: '1.4'
          }}>
            {statusInfo.description}
          </p>
        </div>
      </Card>

      

      {/* Card de Upload (apenas se não aprovado) */}
      {pagamentoInfo?.status !== 'aprovado' && (
        <Card style={{ 
          marginBottom: '24px',
          borderRadius: '16px',
          border: 'none',
          backgroundColor: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
          <h3 style={{ 
            marginBottom: '20px', 
            color: '#1a202c',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Enviar Comprovante
          </h3>
          
          <Upload {...uploadProps} style={{ marginBottom: '16px' }}>
            <Button 
              icon={<UploadOutlined />}
              style={{ 
                width: '100%',
                height: '48px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '500'
              }}
              disabled={pagamentoInfo?.status === 'aguardando_aprovacao'}
            >
              {pagamentoInfo?.status === 'aguardando_aprovacao' 
                ? 'Comprovante já enviado' 
                : 'Selecionar Comprovante'
              }
            </Button>
          </Upload>

          {uploadProgress > 0 && (
            <Progress 
              percent={uploadProgress} 
              style={{ marginBottom: '16px' }}
              strokeColor="#22c55e"
            />
          )}

          {fileList.length > 0 && pagamentoInfo?.status !== 'aguardando_aprovacao' && (
            <Button
              type="primary"
              onClick={handleUpload}
              loading={loading}
              style={{ 
                width: '100%',
                height: '48px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '500',
                background: '#22c55e',
                borderColor: '#22c55e'
              }}
            >
              {loading ? 'Enviando...' : 'Enviar Comprovante'}
            </Button>
          )}
        </Card>
      )}

      {/* Informações de Pagamento */}
      <Card style={{ 
        borderRadius: '16px',
        border: 'none',
        backgroundColor: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <h3 style={{ 
          marginBottom: '20px', 
          color: '#1a202c',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          Instruções de Pagamento
        </h3>
        
        <div style={{ marginBottom: '12px', color: '#1a202c' }}>
          <strong style={{ color: '#4338ca' }}>PIX:</strong> contatoeacpnsa@gmail.com
        </div>
        <div style={{ marginBottom: '12px', color: '#1a202c' }}>
          <strong style={{ color: '#4338ca' }}>Banco:</strong> Nubank
        </div>
        <div style={{ marginBottom: '12px', color: '#1a202c' }}>
          <strong style={{ color: '#4338ca' }}>Nome:</strong> Emmanuelle
        </div>
        
        <div style={{ 
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '12px',
          marginTop: '20px',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: '#475569',
            lineHeight: '1.5'
          }}>
            💡 <strong style={{ color: '#1a202c' }}>Dica:</strong> Após realizar o pagamento, tire uma foto ou screenshot 
            do comprovante e envie através do botão acima.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PagamentoTaxa;
