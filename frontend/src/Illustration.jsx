import React from 'react';

const Illustration = () => (
  <div style={{
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #7b2ff2 0%, #f357a8 100%)',
  }}>
    <img src="/assets/img/logo-admin-login.png" alt="Encontro de Adolescentes com Cristo" style={{ width: 180, height: 180, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.2))' }} />
  </div>
);

export default Illustration;
