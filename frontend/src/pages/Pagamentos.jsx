import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Tag, Modal, message, Space, Statistic, Row, Col, Image, Select, Input } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined, DollarOutlined, UserOutlined, FileTextOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const Pagamentos = () => {
  const [pagamentos, setPagamentos] = useState([]);
  const [pagamentosFiltrados, setPagamentosFiltrados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [equipes, setEquipes] = useState([]);
  const [filtroEquipe, setFiltroEquipe] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [busca, setBusca] = useState('');
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    aprovados: 0,
    pendentes: 0,
    aguardando_aprovacao: 0,
    rejeitados: 0,
    percentual_pagos: 0
  });

  useEffect(() => {
    fetchPagamentos();
    fetchEstatisticas();
    fetchEquipes();
  }, []);

  useEffect(() => {
    let filtrados = [...pagamentos];

    // Filtro por equipe
    if (filtroEquipe) {
      filtrados = filtrados.filter(p => String(p.equipe_id || p.equipe?.id) === String(filtroEquipe));
    }

    // Filtro por status
    if (filtroStatus) {
      filtrados = filtrados.filter(p => {
        const status = (p.status_pagamento || p.status || p.pagamento_status || 'sem_pagamento').toLowerCase();
        return status === filtroStatus;
      });
    }

    // Filtro por busca (nome)
    if (busca && busca.trim() !== '') {
      const buscaLower = busca.trim().toLowerCase();
      filtrados = filtrados.filter(p => (p.nome || '').toLowerCase().includes(buscaLower));
    }

    setPagamentosFiltrados(filtrados);
  }, [pagamentos, filtroEquipe, filtroStatus, busca]);

  const fetchEquipes = async () => {
    try {
      console.log('Fazendo requisição para /api/equipes');
      const response = await axios.get('equipes');
      console.log('Resposta de equipes:', response.data);
      const data = Array.isArray(response.data) ? response.data : [];
      console.log('Equipes processadas:', data);
      setEquipes(data);
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
      setEquipes([]); // Definir array vazio em caso de erro
    }
  };

  const limparFiltros = () => {
    setFiltroEquipe('');
    setFiltroStatus('');
    setBusca('');
  };

  const fetchPagamentos = async () => {
    try {
      setLoading(true);
      console.log('Fazendo requisição para /api/pagamentos/usuarios');
      const response = await axios.get('pagamentos/usuarios');
      console.log('Resposta recebida:', response.data);
      // Verificar se response.data é um array
      const data = Array.isArray(response.data) ? response.data : [];
      console.log('Dados processados:', data);
      // Agrupa por usuario_id e pega o pagamento de maior prioridade
      const prioridade = {
        aprovado: 4,
        aguardando_aprovacao: 3,
        pendente: 2,
        sem_pagamento: 1
      };
      const pagamentosPorUsuario = {};
      for (const item of data) {
        const usuarioId = item.usuario_id || item.id;
        const status = (item.status_pagamento || item.status || item.pagamento_status || 'sem_pagamento').toLowerCase();
        if (usuarioId) {
          if (!pagamentosPorUsuario[usuarioId] || prioridade[status] > prioridade[(pagamentosPorUsuario[usuarioId].status_pagamento || pagamentosPorUsuario[usuarioId].status || pagamentosPorUsuario[usuarioId].pagamento_status || 'sem_pagamento').toLowerCase()]) {
            pagamentosPorUsuario[usuarioId] = item;
          }
        }
      }
      setPagamentos(Object.values(pagamentosPorUsuario));
    } catch (error) {
      message.error('Erro ao carregar pagamentos');
      console.error('Erro ao carregar pagamentos:', error);
      setPagamentos([]); // Definir array vazio em caso de erro
      setPagamentosFiltrados([]); // Definir array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const fetchEstatisticas = async () => {
    try {
      const response = await axios.get('pagamentos/estatisticas');
      // Verificar se response.data existe e tem as propriedades esperadas
      const data = response.data || {};
      setEstatisticas({
        total: data.total || 0,
        aprovados: data.aprovados || 0,
        pendentes: data.pendentes || 0,
        aguardando_aprovacao: data.aguardando_aprovacao || 0,
        rejeitados: data.rejeitados || 0,
        percentual_pagos: data.percentual_pagos || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      // Manter valores padrão em caso de erro
    }
  };

  const aprovarPagamento = async (usuarioId) => {
    try {
      await axios.put(`pagamentos/usuario/${usuarioId}/aprovar`);
      message.success('Pagamento aprovado com sucesso!');
      fetchPagamentos();
      fetchEstatisticas();
    } catch (error) {
      message.error('Erro ao aprovar pagamento');
      console.error('Erro:', error);
    }
  };

  const rejeitarPagamento = async (usuarioId, observacoes = '') => {
    try {
      await axios.put(`pagamentos/usuario/${usuarioId}/rejeitar`, {
        observacoes
      });
      message.success('Pagamento rejeitado');
      fetchPagamentos();
      fetchEstatisticas();
    } catch (error) {
      message.error('Erro ao rejeitar pagamento');
      console.error('Erro:', error);
    }
  };

  const visualizarComprovante = (comprovante) => {
    if (!comprovante) {
      message.warning('Nenhum comprovante disponível');
      return;
    }

    console.log('Valor do comprovante:', comprovante);
    
    // Se o comprovante já vem com o path completo (uploads/comprovantes/), usar diretamente
    // Senão, construir o path
    const imageUrl = comprovante.startsWith('uploads/') 
      ? `${API_BASE_URL.replace('/api', '')}/${comprovante}`
      : `${API_BASE_URL.replace('/api', '')}/uploads/comprovantes/${comprovante}`;
    
    console.log('URL da imagem:', imageUrl);
    console.log('API_BASE_URL:', API_BASE_URL);
    
    // Abrir modal diretamente com melhor tratamento de erro
    Modal.info({
      title: 'Comprovante de Pagamento',
      width: 600,
      content: (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <img
            src={imageUrl}
            alt="Comprovante"
            style={{ 
              maxWidth: '100%', 
              maxHeight: '400px',
              border: '1px solid #d9d9d9',
              borderRadius: '8px'
            }}
            onLoad={() => console.log('✅ Imagem carregou com sucesso')}
            onError={(e) => {
              console.error('❌ Erro ao carregar imagem:', e);
              console.error('❌ URL que falhou:', imageUrl);
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div style={{ 
            display: 'none', 
            padding: '20px', 
            background: '#f5f5f5', 
            border: '1px solid #d9d9d9',
            borderRadius: '8px',
            color: '#666'
          }}>
            <p>❌ Erro ao carregar imagem</p>
            <p><strong>URL:</strong> {imageUrl}</p>
            <p><strong>Comprovante:</strong> {comprovante}</p>
          </div>
          <p style={{ marginTop: '16px', color: '#666', fontSize: '12px' }}>
            <strong>URL:</strong> {imageUrl}
          </p>
        </div>
      ),
      okText: 'Fechar'
    });
  };

  const confirmarAcao = (acao, usuarioId, nomeUsuario) => {
    const isAprovar = acao === 'aprovar';
    
    Modal.confirm({
      title: `${isAprovar ? 'Aprovar' : 'Rejeitar'} Pagamento`,
      content: `Deseja ${isAprovar ? 'aprovar' : 'rejeitar'} o pagamento de ${nomeUsuario}?`,
      okText: isAprovar ? 'Aprovar' : 'Rejeitar',
      okType: isAprovar ? 'primary' : 'danger',
      cancelText: 'Cancelar',
      onOk: () => {
        if (isAprovar) {
          aprovarPagamento(usuarioId);
        } else {
          rejeitarPagamento(usuarioId);
        }
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aprovado': return 'green';
      case 'pendente': return 'orange';
      case 'aguardando_aprovacao': return 'blue';
      case 'rejeitado': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'aprovado': return 'Aprovado';
      case 'pendente': return 'Pendente';
      case 'aguardando_aprovacao': return 'Aguardando Aprovação';
      case 'rejeitado': return 'Rejeitado';
      default: return status;
    }
  };

  // Log do array final para depuração
  console.log('Array final para tabela:', pagamentosFiltrados);

  const columns = [
    {
      title: 'Usuário',
      dataIndex: 'nome',
      key: 'nome',
      render: (text, record) => {
        if (!record) return null;
        return (
          <Space>
            {record.foto && record.foto.trim() !== '' ? (
              <img 
                src={`${API_BASE_URL.replace('/api', '')}/uploads/usuarios/${record.foto}`}
                alt={text || 'Usuário'}
                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = '/default-avatar.svg';
                }}
              />
            ) : (
              <img 
                src={'/default-avatar.svg'}
                alt={'Avatar padrão'}
                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
              />
            )}
            <span>{text || 'Sem nome'}</span>
          </Space>
        );
      },
    },
    {
      title: 'Equipe',
      dataIndex: 'equipe_nome',
      key: 'equipe_nome',
      render: (equipeNome, record) => {
        // Tenta buscar o nome da equipe de várias formas possíveis
        const nomeEquipe = equipeNome || record.nome_equipe || record.equipe?.nome || 'Não informado';
        return nomeEquipe;
      },
    },
    {
      title: 'Valor',
      dataIndex: 'valor',
      key: 'valor',
      render: (valor) => valor ? `R$ ${parseFloat(valor).toFixed(2)}` : 'R$ 25,00',
    },
    {
      title: 'Status',
      dataIndex: 'status_pagamento',
      key: 'status_pagamento',
      render: (status, record) => {
        // Tenta buscar o status de várias formas possíveis
        const statusPagamento = status || record.status || record.pagamento_status || 'sem_pagamento';
        return (
          <Tag color={getStatusColor(statusPagamento)}>
            {getStatusText(statusPagamento)}
          </Tag>
        );
      },
    },
    {
      title: 'Data Envio',
      dataIndex: 'data_envio',
      key: 'data_envio',
      render: (data) => data ? new Date(data).toLocaleDateString('pt-BR') : '-',
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_, record) => (
        <Space>
          {record.comprovante && (
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => visualizarComprovante(record.comprovante)}
            >
              Ver Comprovante
            </Button>
          )}
          {record.status_pagamento === 'aguardando_aprovacao' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => confirmarAcao('aprovar', record.usuario_id, record.nome)}
              >
                Aprovar
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => confirmarAcao('rejeitar', record.usuario_id, record.nome)}
              >
                Rejeitar
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1>Gestão de Pagamentos</h1>
      
      {/* Filtros */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 500 }}>Filtrar por Equipe:</label>
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder="Selecione uma equipe"
              allowClear
              value={filtroEquipe}
              onChange={setFiltroEquipe}
              suffixIcon={<TeamOutlined />}
            >
              {Array.isArray(equipes) && equipes.map(equipe => (
                <Select.Option key={equipe.id} value={equipe.id}>
                  {equipe.nome}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 500 }}>Filtrar por Status:</label>
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder="Selecione o status"
              allowClear
              value={filtroStatus}
              onChange={setFiltroStatus}
            >
              <Select.Option value="aprovado">Aprovado</Select.Option>
              <Select.Option value="pendente">Pendente</Select.Option>
              <Select.Option value="aguardando_aprovacao">Aguardando Aprovação</Select.Option>
              <Select.Option value="rejeitado">Rejeitado</Select.Option>
            </Select>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 500 }}>Buscar por Nome:</label>
            </div>
            <Input
              placeholder="Digite o nome do usuário"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 500, opacity: 0 }}>Ações:</label>
            </div>
            <Space>
              <Button onClick={limparFiltros}>
                Limpar Filtros
              </Button>
              <Button type="primary" onClick={() => { fetchPagamentos(); fetchEstatisticas(); }}>
                Atualizar
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
      
      {/* Estatísticas */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total de Usuários"
              value={estatisticas.total || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pagamentos Aprovados"
              value={estatisticas.aprovados || 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pagamentos Pendentes"
              value={estatisticas.pendentes || 0}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Percentual Pagos"
              value={parseFloat(estatisticas.percentual_pagos || 0).toFixed(1)}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabela de Pagamentos */}
      <Card title={`Lista de Usuários e Status de Pagamento (${pagamentosFiltrados.length} de ${pagamentos.length})`}>
        <Table
          columns={columns}
          dataSource={pagamentosFiltrados}
          loading={loading}
          rowKey={record => record.usuario_id}
          pagination={{
            total: pagamentosFiltrados.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} itens`,
          }}
        />
      </Card>
    </div>
  );
};

export default Pagamentos;