import React, { useContext } from "react";
import FormularioCriancas from "../components/FormularioCriancas";
import SlideExplicativoCrianca from "../components/SlideExplicativoCrianca";
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function CriancaPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [slideFim, setSlideFim] = React.useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#141B34',
      padding: '20px 16px 0 16px',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <ArrowLeftOutlined
          onClick={() => navigate('/')}
          style={{
            fontSize: '24px',
            color: 'white',
            marginRight: '16px',
            cursor: 'pointer'
          }}
        />
        <h1 style={{
          color: 'white',
          fontSize: '24px',
          fontWeight: '600',
          margin: 0
        }}>
          Crianças
        </h1>
      </div>
      {!slideFim ? (
        <SlideExplicativoCrianca onFim={() => setSlideFim(true)} />
      ) : (
        <FormularioCriancas user={user} />
      )}
    </div>
  );
}
