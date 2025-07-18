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
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="Ilustração" style={{ width: 180, height: 180, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.2))' }} />
  </div>
);

export default Illustration;
