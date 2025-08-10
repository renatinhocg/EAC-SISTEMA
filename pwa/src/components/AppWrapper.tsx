import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import SplashScreen from '../pages/SplashScreen';
import App from '../App';

const AppWrapper: React.FC = () => {
  const { loading } = useContext(AuthContext);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Timer para garantir que o splash apareça por pelo menos 5 segundos
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000); // 5 segundos

    return () => clearTimeout(timer);
  }, []);

  // Mostra o splash enquanto estiver carregando OU durante os 5 segundos mínimos
  if (loading || showSplash) {
    return <SplashScreen />;
  }

  return <App />;
};

export default AppWrapper;
