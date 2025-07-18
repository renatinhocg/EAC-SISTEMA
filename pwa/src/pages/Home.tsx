import React, { useContext, useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Button, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PlayCircleOutlined, DownloadOutlined, ShareAltOutlined, PlusOutlined } from '@ant-design/icons';
import { AuthContext } from '../contexts/AuthContext';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  // Adiciona estado para instalação do PWA
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Detecta iOS (Safari) para mostrar instrução manual
  const [isIOS, setIsIOS] = useState(false);
  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua) && /safari/.test(ua));
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const evt = e as BeforeInstallPromptEvent;
      evt.preventDefault();
      setDeferredPrompt(evt);
      setShowInstall(true);
      
      // Mostra o modal automaticamente após 2 segundos se for Android/Chrome
      setTimeout(() => {
        if (!isIOS) {
          setShowInstallModal(true);
        }
      }, 2000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isIOS]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstall(false);
        setShowInstallModal(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleShowIOSModal = () => {
    setShowInstallModal(true);
  };

  return (
    <div>
      {/* Modal para instalação do PWA */}
      <Modal
        title={
          <div style={{ textAlign: 'center' }}>
            <DownloadOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
            <div>Instalar App</div>
          </div>
        }
        open={showInstallModal}
        onCancel={() => setShowInstallModal(false)}
        footer={null}
        centered
        width={320}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          {isIOS ? (
            <div>
              <ShareAltOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
              <Paragraph style={{ fontSize: 16, marginBottom: 16 }}>
                Para instalar este app no seu iPhone:
              </Paragraph>
              <Paragraph style={{ color: '#666' }}>
                1. Toque no ícone <ShareAltOutlined style={{ color: '#1890ff' }} /> (compartilhar) na barra inferior<br/>
                2. Selecione <PlusOutlined style={{ color: '#1890ff' }} /> "Adicionar à Tela de Início"<br/>
                3. Toque em "Adicionar"
              </Paragraph>
            </div>
          ) : (
            <div>
              <DownloadOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
              <Paragraph style={{ fontSize: 16, marginBottom: 16 }}>
                Instale nosso app para uma melhor experiência!
              </Paragraph>
              <Paragraph style={{ color: '#666', marginBottom: 20 }}>
                Acesso rápido, notificações e funcionamento offline
              </Paragraph>
              <Button 
                type="primary" 
                size="large" 
                onClick={handleInstallClick}
                style={{ width: '100%', height: 48, fontSize: 16 }}
              >
                <DownloadOutlined /> Instalar Agora
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Botão flutuante para mostrar modal de instalação */}
      {(showInstall || isIOS) && (
        <>
          <style>{`
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }
          `}</style>
          <div style={{ 
            position: 'fixed', 
            top: 16, 
            right: 16, 
            zIndex: 1000,
            animation: 'pulse 2s infinite'
          }}>
            <Button 
              type="primary" 
              shape="round"
              icon={<DownloadOutlined />}
              onClick={isIOS ? handleShowIOSModal : () => setShowInstallModal(true)}
              style={{
                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.4)',
                border: 'none'
              }}
            >
              Instalar App
            </Button>
          </div>
        </>
      )}

      <Title level={3}>Olá {user?.nome || 'Usuário'},</Title>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            onClick={() => navigate('/loja')}
            style={{ backgroundColor: '#ff146c', color: '#fff', cursor: 'pointer', borderRadius: 8 }}
            bodyStyle={{ padding: '24px' }}
          >
            <Title level={2} style={{ color: '#fff' }}>LOJA DO EAC</Title>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            onClick={() => navigate('/equipe')}
            style={{ backgroundColor: '#2c325b', color: '#fff', cursor: 'pointer', borderRadius: 8 }}
            bodyStyle={{ padding: '16px' }}
          >
            <Title level={4} style={{ color: '#fff' }}>A Equipe</Title>
            <Paragraph style={{ color: '#fff' }}>Objetivo, caridade, gratidão. Leia sobre o propósito.</Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            onClick={() => navigate('/checklist')}
            style={{ backgroundColor: '#2c325b', color: '#fff', cursor: 'pointer', borderRadius: 8 }}
            bodyStyle={{ padding: '16px' }}
          >
            <Title level={4} style={{ color: '#fff' }}>Checklist</Title>
            <Paragraph style={{ color: '#fff' }}>Checklist da sua equipe</Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            onClick={() => navigate('/presenca')}
            style={{ backgroundColor: '#2c325b', color: '#fff', cursor: 'pointer', borderRadius: 8 }}
            bodyStyle={{ padding: '16px' }}
          >
            <Title level={4} style={{ color: '#fff' }}>Presença</Title>
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            onClick={() => navigate('/reflexoes')}
            style={{ backgroundColor: '#e6f7ff', cursor: 'pointer', borderRadius: 8 }}
            bodyStyle={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}
          >
            <div>
              <Title level={5}>1ª preparatória</Title>
              <Paragraph style={{ margin: 0 }}>reflexão sobre o ano jubilar</Paragraph>
            </div>
            <PlayCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Adiciona a interface para o evento BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; }>;
}

export default Home;
