import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'antd';
import { DownloadOutlined, CloseOutlined, MobileOutlined } from '@ant-design/icons';

interface InstallPWAModalProps {
  onClose?: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWAModal: React.FC<InstallPWAModalProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Verifica se já foi instalado ou se o usuário já rejeitou
    const hasRejected = localStorage.getItem('pwa-install-rejected');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as typeof navigator & { standalone?: boolean }).standalone === true;
    const isInstalled = isStandalone || isInWebAppiOS;

    if (hasRejected || isInstalled) {
      return;
    }

    // Listener para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostra o modal após 3 segundos
      setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    };

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa-install-rejected', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Para iOS - mostra o modal mesmo sem o evento beforeinstallprompt
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as typeof window & { MSStream?: unknown }).MSStream;
    if (isIOS && !isInstalled) {
      setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        localStorage.setItem('pwa-install-accepted', 'true');
      } else {
        localStorage.setItem('pwa-install-rejected', 'true');
      }
      
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  const handleReject = () => {
    localStorage.setItem('pwa-install-rejected', 'true');
    setIsVisible(false);
    onClose?.();
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <Modal
      open={isVisible}
      footer={null}
      closable={false}
      width={400}
      centered
      className="install-pwa-modal"
      style={{
        animation: isVisible ? 'slideInDown 0.5s ease-out' : undefined
      }}
    >
      <div className="text-center p-4">
        <div className="mb-4">
          <MobileOutlined 
            style={{ 
              fontSize: '48px', 
              color: '#1890ff',
              animation: 'pulse 2s infinite'
            }} 
          />
        </div>
        
        <h3 className="text-xl font-bold mb-2">
          Instale o EAC App
        </h3>
        
        <p className="text-gray-600 mb-4">
          Tenha acesso rápido ao EAC diretamente da sua tela inicial!
        </p>

        {isIOS ? (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              Para instalar no iOS:
            </p>
            <ol className="text-sm text-left space-y-1">
              <li>1. Toque no ícone de compartilhar</li>
              <li>2. Role para baixo e toque em "Adicionar à Tela de Início"</li>
              <li>3. Toque em "Adicionar"</li>
            </ol>
          </div>
        ) : (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              O app será instalado em seu dispositivo para acesso rápido.
            </p>
          </div>
        )}

        <div className="flex gap-2 justify-center">
          {!isIOS && deferredPrompt && (
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleInstall}
              size="large"
            >
              Instalar App
            </Button>
          )}
          
          <Button
            icon={<CloseOutlined />}
            onClick={handleReject}
            size="large"
          >
            Agora não
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes slideInDown {
          from {
            transform: translate3d(0, -100%, 0);
            visibility: visible;
          }
          to {
            transform: translate3d(0, 0, 0);
          }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .install-pwa-modal .ant-modal-content {
          border-radius: 12px;
          overflow: hidden;
        }
      `}</style>
    </Modal>
  );
};

export default InstallPWAModal;
