import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#fff',
    }}>
      <img src="/vite.svg" alt="Logo" style={{ maxWidth: 180, marginBottom: 24 }} />
    </div>
  );
};

export default SplashScreen;
