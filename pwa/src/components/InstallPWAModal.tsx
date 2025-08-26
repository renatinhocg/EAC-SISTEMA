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
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Verifica se já foi instalado ou rejeitado
    const hasRejected = localStorage.getItem('pwa-install-rejected');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as typeof navigator & { standalone?: boolean }).standalone === true;
    const isInstalled = isStandalone || isInWebAppiOS;

    // Detecta iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as typeof window & { MSStream?: unknown }).MSStream;
    setIsIOS(iOS);

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
    if (iOS && !isInstalled) {
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

  return (
    <>
      {isVisible && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          background: 'rgba(20,27,52,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.5s',
        }}>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
          <div className="text-center p-4" style={{ background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px #0002', minWidth: 320, maxWidth: 360, width: '90vw', margin: '0 auto' }}>
            <img src={logoEac} alt="Logo EAC" style={{ width: 72, height: 72, margin: '0 auto 16px', display: 'block' }} />
            <h3 style={{ fontSize: 26, fontWeight: 700, marginBottom: 10, color: '#11182c' }}>Instale o APP do EAC</h3>
            <p style={{ color: '#222', fontWeight: 500, marginBottom: 18, fontSize: 17 }}>
              Tenha acesso rápido ao EAC direto da tela inicial do seu celular.<br />
              <span style={{ color: '#0345EF', fontWeight: 600 }}>Android:</span> {deferredPrompt ? <>Clique em <b>Instalar</b> abaixo.</> : <>Abra no Chrome para instalar.</>}<br />
              <span style={{ color: '#0345EF', fontWeight: 600 }}>iPhone:</span> Toque em <b>Compartilhar</b> e depois <b>Adicionar à Tela de Início</b>.
            </p>
            <div style={{ background: '#f8fafc', borderRadius: 16, padding: 18, marginBottom: 18 }}>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12 }}>
                {!isIOS && deferredPrompt && (
                  <Button type="primary" onClick={handleInstall} size="large" style={{ fontWeight: 700, fontSize: 18, borderRadius: 10, padding: '0 32px', boxShadow: '0 2px 8px #0345ef33' }}>Instalar</Button>
                )}
                <Button onClick={handleReject} size="large" style={{ background: '#a5b4fc', color: '#11182c', fontWeight: 700, fontSize: 18, borderRadius: 10, border: 'none', padding: '0 32px', boxShadow: '0 2px 8px #a5b4fc33' }}>Agora não</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPWAModal;
import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import logoEac from '../assets/img/icon-180.png';
