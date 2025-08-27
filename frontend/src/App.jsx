import React, { useState, useEffect } from 'react';
import CriancaAdmin from './pages/CriancaAdmin';
import Camisa from './pages/Camisa';
import CamisaPedido from './pages/CamisaPedido';
import AdminHamburguer from './pages/AdminHamburguer';
import Login from './Login';
import AdminLayout from './AdminLayout';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PushPage from './pages/PushPage';
import Usuarios from './pages/Usuarios';
import UsuarioForm from './pages/UsuarioForm';
import Equipes from './pages/Equipes';
import EquipeForm from './pages/EquipeForm';
import Notificacoes from './pages/Notificacoes';
import NotificacaoForm from './pages/NotificacaoForm';
import TipoCirculo from './pages/TipoCirculo';
import TipoCirculoForm from './pages/TipoCirculoForm';
import Agenda from './pages/Agenda';
import AgendaForm from './pages/AgendaForm';
import Reflexoes from './pages/Reflexoes';
import ReflexaoForm from './pages/ReflexaoForm';
import Checklists from './pages/Checklists';
import ChecklistForm from './pages/ChecklistForm';
import AgendaPresencaEquipes from './pages/AgendaPresencaEquipes';
import AgendaEquipePresenca from './pages/AgendaEquipePresenca';
import Pagamentos from './pages/Pagamentos';
import 'antd/dist/reset.css';
import './App.css';
import axios from 'axios';
import FotosUsuarios from './pages/FotosUsuarios';
import TodosUsuarios from './pages/TodosUsuarios';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  // Função para logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

    return (
      <Routes>
        <Route path="/pedido/camisa" element={<CamisaPedido />} />
        {/* Rotas protegidas/admin */}
        {!user ? (
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        ) : (
          <Route path="/admin" element={<AdminLayout user={user} onLogout={handleLogout} />}> 
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="push" element={<PushPage />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="usuarios/novo" element={<UsuarioForm />} />
            <Route path="usuarios/:id/editar" element={<UsuarioForm />} />
            <Route path="tipo_circulo" element={<TipoCirculo />} />
            <Route path="tipo_circulo/novo" element={<TipoCirculoForm />} />
            <Route path="tipo_circulo/:id/editar" element={<TipoCirculoForm />} />
            <Route path="equipes" element={<Equipes />} />
            <Route path="equipes/novo" element={<EquipeForm />} />
            <Route path="equipes/:id/editar" element={<EquipeForm />} />
            <Route path="notificacoes" element={<Notificacoes />} />
            <Route path="notificacoes/novo" element={<NotificacaoForm />} />
            <Route path="notificacoes/:id/editar" element={<NotificacaoForm />} />
            <Route path="reflexoes" element={<Reflexoes />} />
              <Route path="fotos" element={<FotosUsuarios />} />
                <Route path="todos-usuarios" element={<TodosUsuarios />} />
            <Route path="reflexoes/novo" element={<ReflexaoForm />} />
            <Route path="reflexoes/:id/editar" element={<ReflexaoForm />} />
            <Route path="agendas/novo" element={<AgendaForm />} />
            <Route path="agendas/:id/editar" element={<AgendaForm />} />
            <Route path="agendas" element={<Agenda />} />
            <Route path="checklists" element={<Checklists />} />
            <Route path="checklists/novo" element={<ChecklistForm />} />
            <Route path="checklists/:id/editar" element={<ChecklistForm />} />
            <Route path="pagamentos" element={<Pagamentos />} />
            <Route path="camisa" element={<Camisa />} />
            <Route path="hamburguer" element={<AdminHamburguer />} />
            <Route path="crianca" element={<CriancaAdmin />} />
            <Route path="agendas/:agendaId/presenca" element={<AgendaPresencaEquipes />} />
            <Route path="agendas/:agendaId/presenca/equipe/:equipeId" element={<AgendaEquipePresenca />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        )}
      </Routes>
    );

}

export default App;
