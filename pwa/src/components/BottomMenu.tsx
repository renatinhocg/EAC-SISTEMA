import React, { useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  Info,
  CheckSquare,
  Users,
  FileText,
  Calendar
} from 'lucide-react'
import { AuthContext } from '../contexts/AuthContext'

const allIcons: { path: string; icon: React.ReactNode; key: string }[] = [
  { path: '/', icon: <Home />, key: 'home' },
  { path: '/sobre', icon: <Info />, key: 'sobre' },
  { path: '/checklist', icon: <CheckSquare />, key: 'checklist' },
  { path: '/presenca', icon: <Users />, key: 'presenca' },
  { path: '/reflexoes', icon: <FileText />, key: 'reflexoes' },
  { path: '/calendario', icon: <Calendar />, key: 'calendario' }
]

const BottomMenu: React.FC = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()

  // Segmentação para integrantes
  let icons = allIcons
  if (user?.tipo_usuario?.toLowerCase() === 'integrante') {
    icons = allIcons.filter(item => !['sobre', 'checklist', 'presenca'].includes(item.key))
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 24px)',
        maxWidth: '360px',
        height: '65px',
        backgroundColor: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        display: 'flex',
        zIndex: 1000
      }}
    >
      {icons.map(item => {
        const active = location.pathname === item.path
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              background: 'none',
              border: 'none',
              padding: 0,
              margin: 0,
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                backgroundColor: active ? '#2563eb' : 'transparent',
                transition: 'background-color 0.2s'
              }}
            >
              <div style={{ 
                color: active ? 'white' : '#6b7280',
                width: '24px',
                height: '24px'
              }}>
                {item.icon}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default BottomMenu
