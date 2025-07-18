import React from 'react'
import { Layout } from 'antd'
import {
  HomeOutlined,
  InfoCircleOutlined,
  CheckSquareOutlined,
  TeamOutlined,
  FileTextOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

// Apenas 6 links principais
const icons: { path: string; icon: React.ReactNode }[] = [
  { path: '/', icon: <HomeOutlined /> },
  { path: '/sobre', icon: <InfoCircleOutlined /> },
  { path: '/checklist', icon: <CheckSquareOutlined /> },
  { path: '/presenca', icon: <TeamOutlined /> },
  { path: '/reflexoes', icon: <FileTextOutlined /> },
  { path: '/calendario', icon: <CalendarOutlined /> }
]

const BottomMenu: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Layout.Footer
      style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 24px)',
        maxWidth: 360,
        height: 65,
        backgroundColor: '#0345EF',
        borderRadius: 16,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        padding: 0,
        margin: 0,
        overflow: 'hidden'
      }}
    >
      {icons.map(item => (
        <div key={item.path} style={{ flex: 1, textAlign: 'center' }}>
          <div
            onClick={() => navigate(item.path)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 8,
              width: 42,
              height: 42,
              margin:'12px 0 0 0',
              borderRadius: 8,
              backgroundColor: location.pathname === item.path ? '#0238C4' : 'transparent',
              cursor: 'pointer',
              color: location.pathname === item.path ? '#fff' : 'rgba(255,255,255,0.6)',
              fontSize: 24
            }}
          >
            {item.icon}
          </div>
        </div>
      ))}
    </Layout.Footer>
  )
}

export default BottomMenu
