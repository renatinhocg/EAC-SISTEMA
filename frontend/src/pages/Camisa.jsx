  // Função para aprovar pedido
  const aprovarPedido = async (usuarioId) => {
    try {
      await axios.put(`camisas/usuario/${usuarioId}/aprovar`);
      message.success('Pedido aprovado!');
    } catch (error) {
      message.error('Erro ao aprovar pedido');
    }
  };

  // Função para rejeitar pedido
  const rejeitarPedido = async (usuarioId) => {
    try {
      await axios.put(`camisas/usuario/${usuarioId}/rejeitar`);
      message.success('Pedido rejeitado!');
    } catch (error) {
      message.error('Erro ao rejeitar pedido');
    }
  };
  // Função para visualizar comprovante
  const visualizarComprovante = (comprovante) => {
    if (!comprovante) {
      message.warning('Nenhum comprovante disponível');
      return;
    }
    // Se vier do S3, já é uma URL completa
    const url = comprovante.startsWith('http')
      ? comprovante
      : `${API_BASE_URL.replace('/api', '')}/${comprovante}`;
    const isPdf = comprovante.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      Modal.info({
        title: 'Comprovante do Pedido (PDF)',
        width: 400,
        content: (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p>O comprovante enviado é um PDF.</p>
            <Button type="primary" href={url} target="_blank" download style={{ marginBottom: 12 }}>
              Baixar PDF
            </Button>
            <p style={{ marginTop: '16px', color: '#666', fontSize: '12px' }}>
              <strong>URL:</strong> {url}
            </p>
          </div>
        ),
        okText: 'Fechar'
      });
    } else {
      Modal.info({
        title: 'Comprovante do Pedido',
        width: 600,
        content: (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <img src={url} alt="Comprovante" style={{ maxWidth: '100%', maxHeight: '400px', border: '1px solid #d9d9d9', borderRadius: '8px' }} />
            <p style={{ marginTop: '16px', color: '#666', fontSize: '12px' }}>
              <strong>URL:</strong> {url}
            </p>
          </div>
        ),
        okText: 'Fechar'
      });
    }
  };

  // Função para confirmar ação de aprovação/rejeição
  const confirmarAcao = (acao, usuarioId, nomeUsuario) => {
    const isAprovar = acao === 'aprovar';
    Modal.confirm({
      title: `${isAprovar ? 'Aprovar' : 'Rejeitar'} Pedido`,
      content: `Deseja ${isAprovar ? 'aprovar' : 'rejeitar'} o pedido de ${nomeUsuario}?`,
      okText: isAprovar ? 'Aprovar' : 'Rejeitar',
      okType: isAprovar ? 'primary' : 'danger',
      cancelText: 'Cancelar',
      onOk: () => {
        if (isAprovar) {
          aprovarPedido(usuarioId);
        } else {
          rejeitarPedido(usuarioId);
        }
      }
    });
  };
  // Função para texto do status
  const getStatusText = (status) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'pagamento aprovado': return 'Pagamento Aprovado';
      case 'entregue': return 'Entregue';
      default: return status;
    }
  };
  // Função para cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return 'orange';
      case 'pagamento aprovado': return 'blue';
      case 'entregue': return 'green';
      default: return 'default';
    }
  };
  // Função para limpar filtros
  const limparFiltros = () => {
    setFiltroEquipe('');
    setFiltroStatus('');
    setBusca('');
  };
import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Tag, Modal, message, Space, Statistic, Row, Col, Image, Select, Input } from 'antd';
import defaultAvatar from '../assets/img/default-avatar.svg?url';
import { CheckOutlined, CloseOutlined, EyeOutlined, UserOutlined, FileTextOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const Camisa = () => {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
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
    percentual_entregues: 0
  });

  useEffect(() => {
    fetchPedidos();
    fetchEstatisticas();
    fetchEquipes();
  }, []);

  useEffect(() => {
    let filtrados = [...pedidos];
    // Normaliza status para evitar duplicidade
    filtrados = filtrados.map(p => ({
      ...p,
      status: (p.status === 'aguardando aprovação') ? 'aguardando_aprovacao' : (p.status || 'pendente')
    }));
    if (filtroEquipe) {
      filtrados = filtrados.filter(p => {
        const id = String(p.equipe_id || p.equipe?.id || p.equipeId || p.equipe);
        return id === String(filtroEquipe);
      });
    }
    if (filtroStatus) {
      let statusFiltro = filtroStatus === 'aguardando aprovação' ? 'aguardando_aprovacao' : filtroStatus;
      filtrados = filtrados.filter(p => (p.status || 'pendente').toLowerCase() === statusFiltro);
    }
    if (busca && busca.trim() !== '') {
      const buscaLower = busca.trim().toLowerCase();
      filtrados = filtrados.filter(p => (p.nome || '').toLowerCase().includes(buscaLower));
    }
    setPedidosFiltrados(filtrados);
  }, [pedidos, filtroEquipe, filtroStatus, busca]);


  const fetchEquipes = async () => {
    try {
      const response = await axios.get('equipes');
      setEquipes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      message.error('Erro ao buscar equipes');
    setEquipes([]);
    message.error('Erro ao buscar equipes');
    }
  };

  const fetchPedidos = async () => {
    try {
      setLoading(true);
  // Buscar pedidos diretamente da tabela 'camisas'
  const response = await axios.get('camisas');
      // Mapeia os campos para o formato esperado pela tabela
      const pedidos = Array.isArray(response.data) ? response.data.map(p => ({
        id: p.id,
        usuario_id: p.usuario_id,
        nome: p.usuario_nome || 'Sem nome',
        equipe_id: p.equipe_id || (p.equipe && p.equipe.id) || '',
        equipe_nome: p.equipe_nome || (p.equipe && p.equipe.nome) || 'Não informado',
        tamanhos: Array.isArray(p.tamanhos) ? p.tamanhos : typeof p.tamanhos === 'string' ? JSON.parse(p.tamanhos.replace(/'/g, '"')) : [],
        comprovante: p.comprovante,
        status: (p.status === 'aguardando aprovação') ? 'aguardando_aprovacao' : (p.status || 'pendente'),
        data_pedido: p.data_pedido,
        dt_envio_comprovante: p.dt_envio_comprovante
      })) : [];
      setPedidos(pedidos);
    } catch (error) {
      setPedidos([]);
      setPedidosFiltrados([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEstatisticas = async () => {
    try {
      const response = await axios.get('camisas/estatisticas');
      const data = response.data || {};
      setEstatisticas({
        total: data.total || 0,
        aprovados: data.aprovados || 0,
        pendentes: data.pendentes || 0,
        aguardando_aprovacao: data.aguardando_aprovacao || 0,
        rejeitados: data.rejeitados || 0,
        percentual_entregues: data.percentual_entregues || 0
      });
    } catch (error) {
      message.error('Erro ao buscar estatísticas');
    }

  // ...existing code...
  }

  // Array columns no escopo principal
  const columns = [
    {
      title: 'Usuário',
      dataIndex: 'nome',
      key: 'nome',
      render: (text, record) => (
        <Space>
          {record.foto && record.foto.trim() !== '' ? (
            <img src={record.foto && record.foto.startsWith('http')
              ? record.foto
              : `${API_BASE_URL.replace('/api', '')}/uploads/usuarios/${record.foto}`}
              alt={text || 'Usuário'} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} onError={e => { e.target.src = defaultAvatar; }} />
          ) : (
            <img src={defaultAvatar} alt={'Avatar padrão'} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
          )}
          <span>{text || 'Sem nome'}</span>
        </Space>
      ),
    },
    {
      title: 'Equipe',
      dataIndex: 'equipe_nome',
      key: 'equipe_nome',
    },
    {
      title: 'Tamanhos',
      dataIndex: 'tamanhos',
      key: 'tamanhos',
      render: tamanhos => Array.isArray(tamanhos) ? tamanhos.join(', ') : tamanhos || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const statusPedido = status || record.status || 'pendente';
        return <Tag color={getStatusColor(statusPedido)}>{getStatusText(statusPedido)}</Tag>;
      },
    },
    {
      title: 'Data Pedido',
      dataIndex: 'data_pedido',
      key: 'data_pedido',
      render: data => data ? new Date(data).toLocaleDateString('pt-BR') : '-',
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_, record) => (
        <Space>
          {record.comprovante && (
            <Button type="link" icon={<EyeOutlined />} onClick={() => visualizarComprovante(record.comprovante)}>
              Ver Comprovante
            </Button>
          )}
          <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => confirmarAcao('aprovar', record.usuario_id, record.nome)}>
            Aprovar
          </Button>
          <Button danger size="small" icon={<CloseOutlined />} onClick={() => confirmarAcao('rejeitar', record.usuario_id, record.nome)}>
            Rejeitar
          </Button>
        </Space>
      ),
    },
  ];

  return React.createElement(
    'div',
    null,
    React.createElement('h1', null, 'Gestão de Camisas'),
    React.createElement(Card, { style: { marginBottom: 24 } },
      React.createElement(Row, { gutter: 16, align: 'middle' },
        React.createElement(Col, { span: 6 },
          React.createElement('div', { style: { marginBottom: 8 } },
            React.createElement('label', { style: { fontWeight: 500 } }, 'Filtrar por Equipe:')
          ),
          React.createElement(Select, {
            style: { width: '100%' },
            placeholder: 'Selecione uma equipe',
            allowClear: true,
            value: filtroEquipe,
            onChange: setFiltroEquipe,
            suffixIcon: React.createElement(TeamOutlined)
          },
            Array.isArray(equipes) && equipes.map(equipe => (
              React.createElement(Select.Option, { key: equipe.id, value: equipe.id }, equipe.nome)
            ))
          )
        ),
        React.createElement(Col, { span: 6 },
          React.createElement('div', { style: { marginBottom: 8 } },
            React.createElement('label', { style: { fontWeight: 500 } }, 'Filtrar por Status:')
          ),
          React.createElement(Select, {
            style: { width: '100%' },
            placeholder: 'Selecione o status',
            allowClear: true,
            value: filtroStatus,
            onChange: setFiltroStatus
          },
            React.createElement(Select.Option, { value: 'aprovado' }, 'Entregue'),
            React.createElement(Select.Option, { value: 'pendente' }, 'Pendente'),
            React.createElement(Select.Option, { value: 'aguardando_aprovacao' }, 'Aguardando Aprovação'),
            React.createElement(Select.Option, { value: 'rejeitado' }, 'Rejeitado')
          )
        ),
        React.createElement(Col, { span: 6 },
          React.createElement('div', { style: { marginBottom: 8 } },
            React.createElement('label', { style: { fontWeight: 500 } }, 'Buscar por Nome:')
          ),
          React.createElement(Input, {
            placeholder: 'Digite o nome do usuário',
            value: busca,
            onChange: e => setBusca(e.target.value),
            prefix: React.createElement(SearchOutlined),
            allowClear: true
          })
        ),
        React.createElement(Col, { span: 6 },
          React.createElement('div', { style: { marginBottom: 8 } },
            React.createElement('label', { style: { fontWeight: 500, opacity: 0 } }, 'Ações:')
          ),
          React.createElement(Space, null,
            React.createElement(Button, { onClick: limparFiltros }, 'Limpar Filtros'),
            React.createElement(Button, { type: 'primary', onClick: () => { fetchPedidos(); fetchEstatisticas(); } }, 'Atualizar')
          )
        )
      )
    ),
    React.createElement(Row, { gutter: 16, style: { marginBottom: 24 } },
      React.createElement(Col, { span: 4 },
        React.createElement(Card, null,
          React.createElement(Statistic, { title: 'Total de Usuários', value: pedidos.length, prefix: React.createElement(UserOutlined) })
        )
      ),
      React.createElement(Col, { span: 4 },
        React.createElement(Card, null,
          React.createElement(Statistic, { title: 'Pedidos Aprovados', value: estatisticas.aprovados || 0, valueStyle: { color: '#3f8600' }, prefix: React.createElement(CheckOutlined) })
        )
      ),
      React.createElement(Col, { span: 4 },
        React.createElement(Card, null,
          React.createElement(Statistic, { title: 'Pedidos Pendentes', value: estatisticas.pendentes || 0, valueStyle: { color: '#fa8c16' }, prefix: React.createElement(FileTextOutlined) })
        )
      ),
      React.createElement(Col, { span: 4 },
        React.createElement(Card, null,
          React.createElement(Statistic, {
            title: 'Número de Pedidos',
            value: pedidos.reduce((total, p) => total + (Array.isArray(p.tamanhos) ? p.tamanhos.length : 0), 0),
            valueStyle: { color: '#1890ff' },
            prefix: React.createElement(FileTextOutlined)
          })
        )
      ),
      React.createElement(Col, { span: 4 },
        React.createElement(Card, null,
          React.createElement(Statistic, { title: 'Percentual Entregue', value: pedidos.length > 0 ? ((estatisticas.aprovados / pedidos.length) * 100).toFixed(1) : '0.0', suffix: '%', valueStyle: { color: '#1890ff' }, prefix: React.createElement(FileTextOutlined) })
        )
      )
    ),
    React.createElement(Card, { title: `Lista de Usuários e Pedidos de Camisa (${pedidosFiltrados.length} de ${pedidos.length})` },
      React.createElement(Table, {
        columns: columns,
        dataSource: pedidosFiltrados,
        loading: loading,
        rowKey: record => record.usuario_id,
        pagination: {
          total: pedidosFiltrados.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} itens`,
        }
      })
    )
  );
};

export default Camisa;
