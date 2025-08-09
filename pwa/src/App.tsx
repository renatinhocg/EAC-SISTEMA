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

function App() {
  return (
    <>
      <InstallPWAModal />
      <Routes>
        {/* rota pública de login */}
        <Route path="/login" element={<Login />} />
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
        </Route>
      </Routes>
    </>
  )
}

export default App
