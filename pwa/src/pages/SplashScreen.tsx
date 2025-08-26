import React from 'react';
import logoSplash from '../assets/img/logo-splash.png';

const SplashScreen: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#141B34', // Cor de fundo igual ao tema do app
    }}>
      <img 
        src={logoSplash} 
        alt="Logo EAC" 
        style={{ 
          maxWidth: 387, 
          marginBottom: 24,
        }} 
      />
      <div style={{
        color: '#fff',
        fontSize: '18px',
        fontWeight: '600',
        marginTop: '20px'
      }}>
        EAC
      </div>
    </div>
  );
};

export default SplashScreen;
