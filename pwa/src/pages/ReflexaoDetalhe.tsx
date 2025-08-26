import React, { useEffect, useState } from 'react';
import { Typography, Spin, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import api from '../services/api';

const { Title, Text } = Typography;

interface Equipe { id: number; nome: string }
interface Reflexao {
  id: number;
  texto: string;
  data: string;
  agenda_nome?: string;
  agenda_data?: string;
  equipes?: Equipe[];
  anexo?: string;
}

const ReflexaoDetalhe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [reflexao, setReflexao] = useState<Reflexao | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/reflexoes/${id}`)
      .then(res => setReflexao(res.data))
      .catch(() => message.error('Erro ao carregar reflexão'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !reflexao) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#141B34',
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#141B34',
      padding: '24px 16px',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => navigate('/reflexoes')}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            {reflexao.agenda_nome || 'Reflexão'}
          </Title>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
            {(() => {
              const dataParaUsar = reflexao.agenda_data && reflexao.agenda_data.trim() !== '' ? reflexao.agenda_data : reflexao.data;
              // Corrigir timezone para evitar dia anterior
              const parts = dataParaUsar.split('T')[0].split('-');
              const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
              return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            })()}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{
        background: '#0F1528',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ marginBottom: '16px' }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '600' }}>
            Descrição:
          </Text>
          <div style={{ 
            color: 'white', 
            marginTop: '8px',
            lineHeight: '1.5',
            fontSize: '16px'
          }}>
            {reflexao.texto}
          </div>
        </div>

       
        {reflexao.anexo && (
          <div>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '600' }}>
              ANEXO:
            </Text>
            <div style={{ marginTop: '8px' }}>
              <a
                href={reflexao.anexo}
                download
                style={{
                  background: '#4A90E2',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  textDecoration: 'none'
                }}
              >
                <Download size={20} />
                Baixar Anexo
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReflexaoDetalhe;
