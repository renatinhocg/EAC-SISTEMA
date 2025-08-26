

import React, { useEffect, useState } from 'react';
import { Table, Card, Input, Space, Tag, Spin, Statistic, Row, Col } from 'antd';
import api from '../services/api';

const AdminHamburguer = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    fetchReservas();
  }, []);

  const fetchReservas = async () => {
    setLoading(true);
    setErro('');
    try {
  const res = await api.get('/admin/hamburguer/reservas');
  setReservas(Array.isArray(res.data.reservas) ? res.data.reservas : []);
    } catch (err) {
      setErro('Erro ao carregar reservas');
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  // Estatísticas para dashboard
  const total = reservas.reduce((acc, r) => acc + (r.quantidade || 0), 0);
  const totalHamburguer = reservas.filter(r => r.tipo === 'hamburguer').reduce((acc, r) => acc + (r.quantidade || 0), 0);
  const totalTrio = reservas.filter(r => r.tipo === 'trio').reduce((acc, r) => acc + (r.quantidade || 0), 0);
  const equipes = Array.from(new Set(reservas.map(r => r.equipe_nome).filter(Boolean)));

  const reservasPorEquipe = equipes.map(eq => ({
    equipe: eq,
    total: reservas.filter(r => r.equipe_nome === eq).reduce((acc, r) => acc + (r.quantidade || 0), 0)
  }));

  const reservasFiltradas = reservas.filter(r => {
    if (!busca) return true;
    const nome = (r.usuario_nome || '').toLowerCase();
    return nome.includes(busca.toLowerCase());
  });

  const columns = [
    {
      title: 'Usuário',
      dataIndex: 'usuario_nome',
      key: 'usuario_nome',
      render: (text, record) => (
        <Space>
          <span>{text || record.usuario_id}</span>
        </Space>
      ),
    },
    {
      title: 'Equipe',
      dataIndex: 'equipe_nome',
      key: 'equipe_nome',
      render: eq => eq || '-',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      render: tipo => <Tag color={tipo === 'hamburguer' ? 'gold' : 'blue'}>{tipo}</Tag>,
    },
    {
      title: 'Quantidade',
      dataIndex: 'quantidade',
      key: 'quantidade',
    },
    {
      title: 'Data',
      dataIndex: 'data_reserva',
      key: 'data_reserva',
      render: data => data ? new Date(data).toLocaleString('pt-BR') : '-',
    },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Pré-reservas de Hambúrguer</h2>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={6}><Statistic title="Total de Reservas" value={total} /></Col>
          <Col span={6}><Statistic title="Hambúrguer" value={totalHamburguer} /></Col>
          <Col span={6}><Statistic title="Trio" value={totalTrio} /></Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          {reservasPorEquipe.map(eq => (
            <Col key={eq.equipe} span={6}><Statistic title={eq.equipe} value={eq.total} /></Col>
          ))}
        </Row>
        <Input
          placeholder="Buscar por nome do usuário"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          style={{ maxWidth: 300, marginTop: 24 }}
        />
      </Card>
      {loading ? <Spin /> : erro ? <div style={{ color: 'red' }}>{erro}</div> : (
        <Table
          columns={columns}
          dataSource={reservasFiltradas}
          rowKey={r => `${r.usuario_id}-${r.tipo}-${r.data_reserva}`}
          pagination={{ pageSize: 20 }}
        />
      )}
    </div>
  );
};

export default AdminHamburguer;
