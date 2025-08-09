import React, { useContext, useEffect, useState } from 'react';
import { Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import { BellOutlined } from '@ant-design/icons';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

interface TeamMember {
  id: number;
  nome: string;
  foto: string | null;
  tipo_usuario: string;
}

const Home: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Carregar membros da equipe
  useEffect(() => {
    const loadTeamMembers = async () => {
      if (user?.equipe?.id) {
        try {
          console.log('🔍 Carregando membros da equipe:', user.equipe.id);
          const response = await api.get(`/equipes/${user.equipe.id}/membros`);
          console.log('✅ Membros carregados:', response.data);
          setTeamMembers(response.data || []);
        } catch (error) {
          console.error('❌ Erro ao carregar membros da equipe:', error);
          setTeamMembers([]);
        }
      }
    };
    loadTeamMembers();
  }, [user?.equipe]);

  // Debug do usuário
  useEffect(() => {
    console.log('👤 Dados do usuário logado:', user);
    console.log('📷 Foto do usuário:', user?.foto);
  }, [user]);

  if (!user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#2d3748',
        color: 'white'
      }}>
        Carregando...
      </div>
    );
  }

  return (
    <>
      <div style={{ 
        minHeight: '100vh', 

        padding: '20px 16px 90px 16px',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
      {/* Header com saudação e notificação */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '24px' 
      }}>
        <div>
          <div style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)' }}>
            Olá,
          </div>
          <div style={{ fontSize: '24px', fontWeight: '600' }}>
            {user?.nome?.split(' ')[0] || 'Usuário'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '40px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <BellOutlined 
              onClick={() => navigate('/notificacoes')}
              style={{ fontSize: '24px', color: '#2E3D63', padding:'0 16px', cursor: 'pointer' }} 
            />
            <Avatar
              src={
                user?.foto && user.foto.trim() !== ''
                  ? `http://localhost:3000/uploads/usuarios/${user.foto}`
                  : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
              }
              size={48}
              onClick={() => navigate('/perfil')}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Card da equipe */}
      <div style={{ 
        background: '#09112C',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            🍽️
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
              {user?.equipe?.nome || 'Garçom'}
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.4' }}>
              A equipe de garçons é responsável pelo atendimento aos encontristas, portanto deve sempre se comportar de maneira adequada.
            </div>
          </div>
        </div>
      </div>

      {/* Banner amarelo com imagem */}
      <div style={{
        background: 'linear-gradient(135deg, #f6d55c 0%, #fbbf24 100%)',
        borderRadius: '16px',
        padding: '0',
        marginBottom: '20px',
        position: 'relative',
        overflow: 'hidden',
        height: '120px'
      }}>
        <img 
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=120&fit=crop&crop=center"
          alt="Banner da equipe"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '16px'
          }}
        />
      </div>

      {/* Sua equipe */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          marginBottom: '16px', 
          color: 'white' 
        }}>
          Sua equipe
        </h3>
        <div style={{ 
          display: 'flex', 
          gap: '12px',
          overflowX: 'auto',
          overflowY: 'hidden',
          paddingBottom: '4px',
          margin: '0 -16px',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}>
          {Array.isArray(teamMembers) && teamMembers.length > 0 ? teamMembers.slice(0, 4).map((member, index) => (
            <div
              key={member.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px 12px',
                textAlign: 'center',
                minWidth: '80px',
                color: '#1a202c'
              }}
            >
              <Avatar
                src={
                  member.foto && member.foto.trim() !== ''
                    ? `http://localhost:3000/uploads/usuarios/${member.foto}`
                    : `https://images.unsplash.com/photo-${1472099645785 + index}?w=48&h=48&fit=crop&crop=face`
                }
                size={48}
                style={{ marginBottom: '8px' }}
              />
              <div style={{ 
                fontSize: '12px', 
                fontWeight: '600',
                color: '#1a202c'
              }}>
                {member.nome.split(' ')[0]}
              </div>
              <div style={{ 
                fontSize: '10px', 
                color: '#666',
                textTransform: 'capitalize'
              }}>
                {member.tipo_usuario}
              </div>
            </div>
          )) : (
            // Placeholder se não há membros carregados
            [1, 2, 3, 4].map((index) => (
              <div
                key={index}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '16px 12px',
                  textAlign: 'center',
                  minWidth: '80px',
                  color: '#1a202c'
                }}
              >
                <Avatar
                  src={`https://images.unsplash.com/photo-${1472099645785 + index}?w=48&h=48&fit=crop&crop=face`}
                  size={48}
                  style={{ marginBottom: '8px' }}
                />
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: '600',
                  color: '#1a202c'
                }}>
                  Membro {index}
                </div>
                <div style={{ 
                  fontSize: '10px', 
                  color: '#666'
                }}>
                  Equipe
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Grid com cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {/* Card Pós-montagem */}
        <div 
          style={{ 
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            borderRadius: '16px',
            padding: '20px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.3)',
            gridColumn: '1 / -1'
          }}
          onClick={() => navigate('/pos-montagem')}
        >
          <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
            Pós-montagem
          </div>
          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '2px' }}>
            17.08.2025
          </div>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>
            17h
          </div>
        </div>

        {/* Card Hambúrguer */}
        <div style={{
          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
          borderRadius: '16px',
          padding: '16px',
          cursor: 'pointer',
          color: '#1a202c',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            fontSize: '12px', 
            fontWeight: '600', 
            marginBottom: '4px',
            color: '#64748b'
          }}>
            Sábado
          </div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '700',
            marginBottom: '8px'
          }}>
            Hambúrguer
          </div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: '700',
            color: '#f59e0b'
          }}>
            $35
          </div>
          <div style={{
            position: 'absolute',
            right: '8px',
            top: '8px',
            fontSize: '24px'
          }}>
            🍔
          </div>
        </div>

        {/* Card em branco (placeholder) */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '16px',
          cursor: 'pointer',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100px'
        }}>
          <div style={{ 
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.5)'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
            <div style={{ fontSize: '12px' }}>Em breve</div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default Home;
