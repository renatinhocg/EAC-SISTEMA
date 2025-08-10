import React from 'react';
import BottomMenu from './BottomMenu';
import { useOutlet, useLocation } from 'react-router-dom';

const Layout: React.FC = () => {
  const outlet = useOutlet();
  const location = useLocation();
  
  // Rotas onde o menu flutuante deve ser ocultado
  const hideMenuRoutes = ['/presenca-detalhe', '/reflexoes/'];
  const shouldHideMenu = hideMenuRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div style={{ 
        maxWidth: '360px', 
        margin: '0 auto', 
        minHeight: '100vh', 
        paddingBottom: shouldHideMenu ? '20px' : '90px' 
      }}>
        {outlet}
      </div>
      {!shouldHideMenu && <BottomMenu />}
    </div>
  );
};

export default Layout;
