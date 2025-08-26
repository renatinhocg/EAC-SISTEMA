
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import bannerCamisaPag from '../assets/img/banner-camisa-paginav2.png';

import api, { getMinhasCamisas } from '../services/api';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const tamanhos = ['PP', 'P', 'M', 'G', 'GG', 'XG'];

const Camisa: React.FC = () => {
  const navigate = useNavigate();
  const [camisas, setCamisas] = useState<string[]>(['']);
  const [etapa, setEtapa] = useState(1);
  const [comprovante, setComprovante] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingResumo, setLoadingResumo] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { user } = useContext(AuthContext);
  const [minhasCamisas, setMinhasCamisas] = useState<{ total: number; tamanhos: string[] }>({ total: 0, tamanhos: [] });

  // Função de busca reutilizável
  const fetchMinhasCamisas = React.useCallback(async () => {
    if (!user?.id) {
      setLoadingResumo(false);
      return;
    }
    setLoadingResumo(true);
    try {
      const res = await getMinhasCamisas();
      if (res.data && Array.isArray(res.data)) {
        type PedidoCamisa = { usuario_id: number; tamanhos: string };
        const pedidosUsuario = res.data.filter((p: PedidoCamisa) => p.usuario_id == user.id);
        const tamanhos = pedidosUsuario.flatMap((p: PedidoCamisa) => {
          try {
            return JSON.parse(p.tamanhos);
          } catch {
            return [];
          }
        });
        setMinhasCamisas({ total: tamanhos.length, tamanhos });
      }
    } catch {
      setMinhasCamisas({ total: 0, tamanhos: [] });
    } finally {
      setLoadingResumo(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMinhasCamisas();
  }, [fetchMinhasCamisas]);
  // const navigate = useNavigate(); // Removido: não utilizado

  // Seleção de tamanho para cada camisa
  const handleSelecionarTamanho = (index: number, tamanho: string) => {
  const novas = [...camisas];
  novas[index] = tamanho;
  setCamisas(novas);
  console.log(`[Camisa] Tamanho selecionado para camisa ${index + 1}:`, tamanho);
  };

  const handleAdicionarCamisa = () => {
  setCamisas([...camisas, '']);
  console.log('[Camisa] Adicionada nova camisa. Total:', camisas.length + 1);
  };

  const handleRemoverCamisa = (index: number) => {
    if (camisas.length > 1) {
      setCamisas(camisas.filter((_, i) => i !== index));
      console.log(`[Camisa] Camisa ${index + 1} removida. Total:`, camisas.length - 1);
    }
  };

  const handleConfirmarTamanhos = () => {
    if (camisas.some(t => !t)) {
      setMensagem('Selecione o tamanho de todas as camisas!');
      console.warn('[Camisa] Falta selecionar tamanho de alguma camisa:', camisas);
      return;
    }
    setMensagem('');
    setEtapa(2);
    console.log('[Camisa] Tamanhos confirmados:', camisas);
  };

  // Upload do comprovante
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      setTimeout(() => {
        setComprovante(file);
        setUploading(false);
        setMensagem('Comprovante enviado com sucesso!');
        console.log('[Camisa] Comprovante anexado:', file.name);
      }, 1200);
    }
  };

  // Enviar pedido para o backend
  const handleEnviarPedido = async () => {
    setMensagem('Processando pedido...');
    console.log('[Camisa] Iniciando envio do pedido...');
    if (!user?.id) {
      setMensagem('Usuário não identificado. Faça login novamente.');
      console.error('[Camisa] Usuário não identificado!');
      return;
    }
    if (camisas.some(t => !t)) {
      setMensagem('Selecione o tamanho de todas as camisas!');
      console.warn('[Camisa] Falta selecionar tamanho de alguma camisa:', camisas);
      return;
    }
    if (!comprovante) {
      setMensagem('Envie o comprovante antes de finalizar.');
      console.warn('[Camisa] Comprovante não anexado!');
      return;
    }
    setEnviando(true);
    setMensagem('');
    try {
      const formData = new FormData();
      formData.append('usuario_id', String(user.id));
      formData.append('tamanhos', JSON.stringify(camisas));
      formData.append('comprovante', comprovante);
      console.log('[Camisa] Dados enviados:', {
        usuario_id: user.id,
        tamanhos: camisas,
        comprovante: comprovante?.name
      });
      const response = await api.post('/camisas', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('[Camisa] Resposta do backend:', response.data);
      if (response.data.pedido) {
        setMensagem(''); // Limpa mensagem de erro
        await fetchMinhasCamisas(); // Atualiza resumo imediatamente
        setEtapa(3);
        console.log('[Camisa] Pedido finalizado com sucesso!');
      } else {
        setMensagem('Erro ao enviar pedido. Tente novamente.');
        console.error('[Camisa] Erro no backend:', response.data);
      }
    } catch (err) {
      setMensagem('Erro ao enviar pedido. Tente novamente.');
      console.error('[Camisa] Erro ao enviar pedido:', err);
    }
    setEnviando(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 24 }}>
      {/* Header com seta de voltar e título */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <ArrowLeftOutlined
          onClick={() => navigate(-1)}
          style={{
            fontSize: '24px',
            color: 'white',
            marginRight: '16px',
            cursor: 'pointer'
          }}
        />
        <h2 style={{ color: 'white', textAlign: 'left', margin: 0, fontSize: 24, fontWeight: 600 }}>Camisa Tema</h2>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 0 }}>
        <img src={bannerCamisaPag} alt="Camisa Tema" style={{ maxWidth: '100%', borderRadius: 8 }} />
      </div>

      {etapa === 1 && (
        <div style={{ background: '#0F1528', borderRadius: 16, padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ color: '#fff', paddingBottom:'16px', fontWeight: 700 }}>Selecione o tamanho da camisa</span>
            {camisas.map((tamanho, idx) => (
              <div key={idx} style={{ marginBottom: 12 }}>
                <div style={{ color: '#fff', fontWeight: 300, marginBottom: 4 }}>Camisa {idx + 1}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {tamanhos.map(t => (
                    <button
                      key={t}
                      style={{
                        flex: '1 1 30%',
                        padding: '10px 0',
                        borderRadius: 8,
                        border: tamanho === t ? '2px solid #2563eb' : '1px solid #ccc',
                        background: tamanho === t ? '#2563eb' : '#fff',
                        color: tamanho === t ? '#fff' : '#181f3a',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginBottom: 8
                      }}
                      onClick={() => handleSelecionarTamanho(idx, t)}
                    >
                      {t}
                    </button>
                  ))}
                  {camisas.length > 1 && (
                    <button
                      style={{
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid #dc2626',
                        background: '#fff',
                        color: '#dc2626',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginBottom: 8
                      }}
                      onClick={() => handleRemoverCamisa(idx)}
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div style={{ color: '#f7b787', marginTop: 8, fontSize: 14 }}>{mensagem}</div>
          </div>
          <button
            style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 600, fontSize: 15, marginBottom: 8, cursor: 'pointer' }}
            onClick={handleAdicionarCamisa}
          >
            Adicionar +1 camisa
          </button>
          <button
            style={{ width: '100%', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 600, fontSize: 16, marginTop: 8, cursor: 'pointer' }}
            onClick={handleConfirmarTamanhos}
          >
            Confirmar
          </button>
          {/* Resumo de camisas já pedidas */}
          <div style={{ background: '#f1f5f9', borderRadius: 12, padding: 12, marginTop: 16, color: '#1a202c', fontWeight: 600, fontSize: 16 }}>
            <span>Você já pediu:</span>
            <div style={{ marginTop: 8 }}>
              {loadingResumo ? (
                <span style={{ color: '#2563eb', fontWeight: 400 }}>
                  <span className="loader" style={{ width: 18, height: 18, border: '3px solid #2563eb', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: 8 }}></span>
                  Carregando...
                </span>
              ) : (
                <>
                  <span style={{ marginRight: 16 }}>Total: <b>{minhasCamisas.total}</b></span>
                  <span>Tamanhos: <b>{minhasCamisas.tamanhos.join(', ') || '-'}</b></span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {etapa === 2 && (
        <div style={{ background: '#181f3a', borderRadius: 16, padding: 24 }}>
          <div style={{ marginBottom: 16, color: '#fff' }}>
            <strong><span style={{fontSize:'24px'}}>🟢 Pedido da camisa confirmado! </span></strong>
            <p style={{ marginTop: 16 }}>
              A chave do pix para o pagamento é: <strong>contatoeacpnsa@gmail.com</strong><br /><br />
              Após realizar o pagamento, envie o comprovante abaixo.<br />
              Você irá receber a camisa na sexta-feira da missa de entrega ou no sábado, dia do encontro.
            </p>
          </div>
          <button
            type="button"
            onClick={() => document.getElementById('comprovante-upload')?.click()}
            style={{
              display: 'block',
              marginBottom: 12,
              background: '#2563eb',
              color: '#fff',
              fontWeight: 500,
              border: 'none',
              borderRadius: 8,
              padding: '10px 0',
              width: '100%',
              cursor: 'pointer'
            }}
            disabled={uploading || !!comprovante}
          >
            Enviar comprovante
          </button>
          <input
            id="comprovante-upload"
            type="file"
            accept="image/*,application/pdf"
            onChange={handleUpload}
            disabled={uploading || !!comprovante}
            style={{ marginBottom: 12, width: '100%', color:'#ffffff' }}
          />
          {uploading && <div style={{ color: '#ffffff', marginBottom: 8 }}>Enviando comprovante...</div>}
          {comprovante && (
            <div style={{ color: '#ffffff', marginBottom: 8 }}>Comprovante enviado!</div>
          )}
          <button
            style={{ width: '100%', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 600, fontSize: 16, marginTop: 8, cursor: 'pointer' }}
            onClick={handleEnviarPedido}
            // REMOVIDO disabled para debug
          >
            {enviando ? 'Enviando...' : 'Finalizar pedido'}
          </button>
          <div style={{ color: '#f7b787', marginTop: 8, fontSize: 14 }}>{mensagem}</div>
        </div>
      )}

      {etapa === 3 && (
        <div style={{ background: '#181f3a', borderRadius: 16, padding: 24, textAlign: 'center' }}>
          <h3 style={{ color: '#22c55e', marginBottom: 16, fontSize:'24px' }}><strong>🟢</strong>Pedido enviado com sucesso!</h3>
          <p style={{ color: '#fff', marginBottom: 16 }}>Seu pedido foi registrado. Você poderá pegar a camisa na sexta-feira, Missa de Entrega ou no Sábado no dia do encontro.</p>
          <div style={{ color: '#fff', marginBottom: 12, fontSize: 15 }}>
            <strong>Resumo do pedido:</strong><br />
            Quantidade: {camisas.length}<br />
            Tamanhos: {camisas.join(', ')}
          </div>
          <div style={{ background: '#f1f5f9', borderRadius: 12, padding: 12, marginTop: 16, color: '#1a202c', fontWeight: 600, fontSize: 16 }}>
            <span>Todos os pedidos já reservados:</span>
            <div style={{ marginTop: 8 }}>
              {loadingResumo ? (
                <span style={{ color: '#2563eb', fontWeight: 400 }}>
                  <span className="loader" style={{ width: 18, height: 18, border: '3px solid #2563eb', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: 8 }}></span>
                  Carregando...
                </span>
              ) : (
                <>
                  <span style={{ marginRight: 16 }}>Total: <b>{minhasCamisas.total}</b></span>
                  <span>Tamanhos: <b>{minhasCamisas.tamanhos.join(', ') || '-'}</b></span>
                </>
              )}
            </div>
          </div>
          <button
            style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 600, fontSize: 16, marginTop: 8, cursor: 'pointer' }}
            onClick={async () => {
              setEtapa(1);
              setCamisas(['']);
              setComprovante(null);
              setMensagem('');
              await fetchMinhasCamisas(); // Atualiza resumo ao resetar
            }}
          >
            Fazer novo pedido
          </button>
        </div>
      )}
    </div>
  );
};

export default Camisa;
