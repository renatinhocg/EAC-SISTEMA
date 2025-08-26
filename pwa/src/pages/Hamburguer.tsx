
import React, { useState } from 'react';
import { reservarHamburguer, getMinhasReservas } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import bannerHamburguer from '../assets/img/hamburguer-banner.png';

const Hamburguer: React.FC = () => {
  const navigate = useNavigate();
  const [hamburguer, setHamburguer] = useState(0);
  const [trio, setTrio] = useState(1);
  const [mensagem, setMensagem] = useState('');
  const [confirmado, setConfirmado] = useState(false);
  const [minhasReservas, setMinhasReservas] = useState<{ hamburguer: number; trio: number }>({ hamburguer: 0, trio: 0 });
  const [loading, setLoading] = useState(false);

  // Buscar reservas do usuário logado
  const fetchMinhasReservas = async () => {
    try {
      const res = await getMinhasReservas();
      if (res.data && typeof res.data === 'object') {
        setMinhasReservas({
          hamburguer: Number(res.data.hamburguer) || 0,
          trio: Number(res.data.trio) || 0
        });
      } else {
        setMinhasReservas({ hamburguer: 0, trio: 0 });
      }
    } catch {
      setMinhasReservas({ hamburguer: 0, trio: 0 });
    }
  };
  React.useEffect(() => {
    fetchMinhasReservas();
  }, []);

  const handleConfirmar = async () => {
    if (hamburguer === 0 && trio === 0) {
      setMensagem('Selecione ao menos uma opção e quantidade!');
      return;
    }
    setMensagem('');
    setLoading(true);
    try {
      setLoading(true);
      await reservarHamburguer(hamburguer, trio);
      await fetchMinhasReservas(); // Atualiza reservas após confirmar
      setConfirmado(true);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        setMensagem((err as any)?.response?.data?.error || 'Erro ao reservar. Tente novamente.');
      } else {
        setMensagem('Erro ao reservar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, marginRight: 8 }}>
          <ArrowLeftOutlined />
        </button>
        <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Hamburguer</span>
      </div>

      <div style={{ background: 'linear-gradient(90deg,#b3c7f7 0%,#e2e8f0 100%)', borderRadius: 16, padding: 0, marginBottom: 24, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 140 }}>
        <img src={bannerHamburguer} alt="Banner Hamburguer" style={{ maxWidth: '100%', maxHeight: '140px', objectFit: 'contain' }} />
      </div>

      {!confirmado && (
        <div style={{ background: '#11182c', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 18, color: '#fff' }}>Selecione o tipo e a quantidade</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <span style={{ color: '#fff', fontWeight: 500 }}>TRIO (hamburguer + batata + bebida)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => setTrio(Math.max(0, trio - 1))} style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid #fff', background: 'none', color: '#fff', fontSize: 20 }}>-</button>
              <span style={{ fontSize: 18, color: '#fff', minWidth: 24, textAlign: 'center' }}>{trio}</span>
              <button onClick={() => setTrio(trio + 1)} style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid #fff', background: 'none', color: '#fff', fontSize: 20 }}>+</button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#fff', fontWeight: 500 }}>Hamburguer</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => setHamburguer(Math.max(0, hamburguer - 1))} style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid #fff', background: 'none', color: '#fff', fontSize: 20 }}>-</button>
              <span style={{ fontSize: 18, color: '#fff', minWidth: 24, textAlign: 'center' }}>{hamburguer}</span>
              <button onClick={() => setHamburguer(hamburguer + 1)} style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid #fff', background: 'none', color: '#fff', fontSize: 20 }}>+</button>
            </div>
          </div>
        </div>
      )}

      {mensagem && <div style={{ color: '#f00', marginBottom: 12, textAlign: 'center' }}>{mensagem}</div>}
      {!confirmado ? (
        <button
          onClick={handleConfirmar}
          style={{ width: '100%', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 20, borderRadius: 12, padding: '14px 0', border: 'none', marginBottom: 8, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', position: 'relative' }}
          disabled={loading}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span className="loader" style={{ width: 22, height: 22, border: '3px solid #fff', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }}></span>
              Reservando...
            </span>
          ) : 'Confirmar'}
        </button>
      ) : (
        <div style={{ color: '#22c55e', textAlign: 'center', fontWeight: 700, fontSize: 20, marginTop: 16 }}>
          Pré-reserva de: {trio} trios e {hamburguer} hamburguer realizada com sucesso.<br />
          Não precisa fazer o pagamento agora, será cobrado no mini-bar.<br />
          <button
            style={{ marginTop: 24, background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 18, borderRadius: 10, padding: '10px 24px', border: 'none', cursor: 'pointer' }}
            onClick={() => {
              setHamburguer(0);
              setTrio(1);
              setConfirmado(false);
              setMensagem('');
            }}
          >
            Fazer nova pré-reserva
          </button>
        </div>
      )}
      {/* Reservas já feitas */}
      <div style={{ background: '#f1f5f9', borderRadius: 12, padding: 12, marginBottom: 16, color: '#1a202c', fontWeight: 600, fontSize: 16 }}>
        <span>Você já reservou:</span>
        <div style={{ marginTop: 8 }}>
          <span style={{ marginRight: 16 }}>Hambúrguer: <b>{minhasReservas.hamburguer}</b></span>
          <span>Trio: <b>{minhasReservas.trio}</b></span>
        </div>
      </div>
    </div>
  );
};

export default Hamburguer;
