import React from 'react'
import Camisa from './pages/Camisa';
import Hamburguer from './pages/Hamburguer';
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import InstallPWAModal from './components/InstallPWAModal'
import './App.css'
import Home from './pages/Home'
import Notificacoes from './pages/Notificacoes'
import Sobre from './pages/Sobre'
import Checklist from './pages/Checklist'
import Presenca from './pages/Presenca'
import PresencaDetalhe from './pages/PresencaDetalhe'
import Reflexoes from './pages/Reflexoes'
import ReflexaoDetalhe from './pages/ReflexaoDetalhe'
import Calendario from './pages/Calendario'
import Perfil from './pages/Perfil'
import PresencaEquipe from './pages/PresencaEquipe'
import PagamentoTaxa from './pages/PagamentoTaxa'
import { usePushNotifications } from './hooks/usePushNotifications'

function App() {

  usePushNotifications()

  // Listener para mensagens do service worker (alerta de push)
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handler = (event: MessageEvent) => {
        if (event.data && event.data.type === 'PUSH_RECEIVED') {
          alert('Notificação recebida!\n' + event.data.title + '\n' + (event.data.body || ''));
        }
      };
      navigator.serviceWorker.addEventListener('message', handler);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handler);
      };
    }
  }, []);

  return (
    <>
  <InstallPWAModal />
      <Routes>
        {/* rota pública de login */}
        <Route path="/login" element={<Login />} />
        {/* rota de pagamento sem layout (sem menu footer) */}
        <Route path="/pagamento" element={<RequireAuth><PagamentoTaxa /></RequireAuth>} />
        {/* rotas privadas protegidas com layout */}
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/presenca" element={<Presenca />} />
          <Route path="/presenca-detalhe/:eventoId" element={<PresencaDetalhe />} />
          <Route path="/reflexoes" element={<Reflexoes />} />
          <Route path="/reflexoes/:id" element={<ReflexaoDetalhe />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/notificacoes" element={<Notificacoes />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/presenca-equipe" element={<PresencaEquipe />} />
          <Route path="/camisa" element={<Camisa />} />
            <Route path="/hamburguer" element={<Hamburguer />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
