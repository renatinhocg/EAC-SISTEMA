import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spin, Select } from 'antd';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const COLORS = ['#52c41a', '#ff4d4f', '#faad14'];
const STATUS_LABELS = ['Presente', 'Falta', 'Justificada'];

const PresencaRelatorio = () => {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Buscar todas as agendas/preparatórias com presença ativa
        const agendasRes = await axios.get('agendas');
        const agendas = (agendasRes.data || []).filter(a => a.presenca_ativa);
        setEventos(agendas);
        // Seleciona o primeiro evento por padrão
        if (agendas.length > 0 && !eventoSelecionado) {
          setEventoSelecionado(agendas[0].id);
        }
      } catch {
        setEventos([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventoSelecionado]);

  useEffect(() => {
    async function fetchRelatorio() {
      if (!eventoSelecionado) return;
      setLoading(true);
      try {
        const agendaId = eventoSelecionado;
        const equipesRes = await axios.get(`equipes?agendaId=${agendaId}`);
        const equipes = equipesRes.data || [];
        const equipesDados = await Promise.all(equipes.map(async equipe => {
          const presRes = await axios.get(`presencas/evento/${agendaId}/equipe/${equipe.id}`);
          const presencas = presRes.data || [];
          let presente = 0, falta = 0, justificada = 0;
          presencas.forEach(p => {
            if (p.presente === 1) presente++;
            else if (p.presente === 2) justificada++;
            else falta++;
          });
          const total = presencas.length;
          const porcentagem = total > 0 ? Math.round((presente / total) * 100) : 0;
          return {
            equipe: equipe.nome,
            presente,
            falta,
            justificada,
            total,
            porcentagem
          };
        }));
        setDados(equipesDados);
      } catch {
        setDados([]);
      } finally {
        setLoading(false);
      }
    }
    fetchRelatorio();
  }, [eventoSelecionado]);

  if (loading) return <Spin />;

  // Totais absolutos
  const totalPresente = dados.reduce((acc, eq) => acc + eq.presente, 0);
  const totalFalta = dados.reduce((acc, eq) => acc + eq.falta, 0);
  const totalJustificada = dados.reduce((acc, eq) => acc + eq.justificada, 0);

  return (
    <div>
      {/* Filtro de evento */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontWeight: 500 }}>Evento:</span>
        <Select
          style={{ minWidth: 220 }}
          value={eventoSelecionado}
          onChange={setEventoSelecionado}
          options={eventos.map(ev => ({ label: ev.titulo || ev.nome, value: ev.id }))}
        />
      </div>
      {/* Cards de totais */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center' }}>
            <span style={{ color: COLORS[0], fontWeight: 600, fontSize: 18 }}>Total de Presentes</span>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{totalPresente}</div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center' }}>
            <span style={{ color: COLORS[2], fontWeight: 600, fontSize: 18 }}>Total de Justificadas</span>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{totalJustificada}</div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center' }}>
            <span style={{ color: COLORS[1], fontWeight: 600, fontSize: 18 }}>Total de Faltas</span>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{totalFalta}</div>
          </Card>
        </Col>
      </Row>
      {/* Gráficos por equipe */}
      <Row gutter={[16, 16]}>
        {dados.map(eq => (
          <Col xs={24} md={12} lg={8} key={eq.equipe}>
            <Card title={eq.equipe} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <ResponsiveContainer width="45%" height={180}>
                  <PieChart>
                    <Pie data={[{ name: 'Presente', value: eq.presente }, { name: 'Falta', value: eq.falta }, { name: 'Justificada', value: eq.justificada }]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                      {STATUS_LABELS.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <ResponsiveContainer width="45%" height={180}>
                  <BarChart data={[{ ...eq }]}> 
                    <XAxis dataKey="equipe" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="presente" fill={COLORS[0]} name="Presente" />
                    <Bar dataKey="falta" fill={COLORS[1]} name="Falta" />
                    <Bar dataKey="justificada" fill={COLORS[2]} name="Justificada" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop: 16 }}>
                <span style={{ color: COLORS[0], fontWeight: 500 }}>Presente: {eq.presente}</span> |{' '}
                <span style={{ color: COLORS[1], fontWeight: 500 }}>Falta: {eq.falta}</span> |{' '}
                <span style={{ color: COLORS[2], fontWeight: 500 }}>Justificada: {eq.justificada}</span> |{' '}
                <span style={{ fontWeight: 500 }}>Total: {eq.total}</span> |{' '}
                <span style={{ color: '#1890ff', fontWeight: 500 }}>Presença: {eq.porcentagem}%</span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default PresencaRelatorio;
