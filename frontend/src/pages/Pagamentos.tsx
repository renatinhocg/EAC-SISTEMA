import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Tag, Modal, message, Space, Statistic, Row, Col, Image } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined, DollarOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const Pagamentos = () => {
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [estatisticas, setEstatisticas] = useState({});

  useEffect(() => {
    fetchPagamentos();
    fetchEstatisticas();
  }, []);

  const fetchPagamentos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/pagamentos/usuarios');
      setPagamentos(response.data);
    } catch (error) {
      message.error('Erro ao carregar pagamentos');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEstatisticas = async () => {
    try {
      const response = await axios.get('/api/pagamentos/estatisticas');
      setEstatisticas(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const aprovarPagamento = async (usuarioId) => {
    try {
      await axios.put(`/api/pagamentos/usuario/${usuarioId}/aprovar`);
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
      await axios.put(`/api/pagamentos/usuario/${usuarioId}/rejeitar`, {
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

    const imageUrl = `${API_BASE_URL.replace('/api', '')}/uploads/comprovantes/${comprovante}`;
    
    Modal.info({
      title: 'Comprovante de Pagamento',
      width: 600,
      content: (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Image
            src={imageUrl}
            alt="Comprovante"
            style={{ maxWidth: '100%', maxHeight: '400px' }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
          />
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

  const columns = [
    {
      title: 'Usuário',
      dataIndex: 'nome',
      key: 'nome',
      render: (text, record) => (
        <Space>
          {record.foto ? (
            <img 
              src={`${API_BASE_URL.replace('/api', '')}/uploads/usuarios/${record.foto}`}
              alt={text}
              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ 
              width: 32, 
              height: 32, 
              borderRadius: '50%', 
              backgroundColor: '#f0f0f0', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <UserOutlined />
            </div>
          )}
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Valor',
      dataIndex: 'valor',
      key: 'valor',
      render: (valor) => valor ? `R$ ${parseFloat(valor).toFixed(2)}` : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status_pagamento',
      key: 'status_pagamento',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
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
                onClick={() => confirmarAcao('aprovar', record.id, record.nome)}
              >
                Aprovar
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => confirmarAcao('rejeitar', record.id, record.nome)}
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
      <Card title="Lista de Usuários e Status de Pagamento">
        <Table
          columns={columns}
          dataSource={pagamentos}
          loading={loading}
          rowKey="id"
          pagination={{
            total: pagamentos.length,
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