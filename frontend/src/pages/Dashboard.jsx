
import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import { UserOutlined, CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const Dashboard = () => {
	const [loading, setLoading] = useState(true);
	const [usuarios, setUsuarios] = useState(0);
	const [pagamentos, setPagamentos] = useState({ aprovados: 0, pendentes: 0 });
	const [presencas, setPresencas] = useState(0);
	const [usuariosPorEquipe, setUsuariosPorEquipe] = useState([]);
	const [porcentagemPresenca, setPorcentagemPresenca] = useState(0);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				// Usuários
				const usuariosRes = await axios.get('usuarios');
				const usuariosArr = Array.isArray(usuariosRes.data) ? usuariosRes.data : [];
				setUsuarios(usuariosArr.length);
				// Usuários por equipe
				const equipesMap = {};
				usuariosArr.forEach(u => {
					if (!u.equipe_nome) return;
					equipesMap[u.equipe_nome] = (equipesMap[u.equipe_nome] || 0) + 1;
				});
				setUsuariosPorEquipe(Object.entries(equipesMap).map(([nome, qtd]) => ({ nome, qtd })));
				// Pagamentos
				const pagamentosRes = await axios.get('pagamentos/estatisticas');
				setPagamentos({
					aprovados: pagamentosRes.data.aprovados || 0,
					pendentes: pagamentosRes.data.pendentes || 0
				});
				// Presenças
				const presencasRes = await axios.get('presencas');
				const presencasArr = Array.isArray(presencasRes.data) ? presencasRes.data : [];
				setPresencas(presencasArr.length);
				// Porcentagem geral de presença
				const totalPossivel = usuariosArr.length > 0 ? usuariosArr.length : 1;
				setPorcentagemPresenca(((presencasArr.length / totalPossivel) * 100).toFixed(1));
			} catch (err) {
				setUsuarios(0);
				setPagamentos({ aprovados: 0, pendentes: 0 });
				setPresencas(0);
				setUsuariosPorEquipe([]);
				setPorcentagemPresenca(0);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

		return (
			<div>
				<h1>Dashboard</h1>
				<Row gutter={24} style={{ marginTop: 24 }}>
					<Col span={6}>
						<Card>
							<Statistic
								title="Usuários Cadastrados"
								value={usuarios}
								prefix={<UserOutlined />}
								loading={loading}
							/>
						</Card>
					</Col>
					<Col span={6}>
						<Card>
							<Statistic
								title="Pagamentos Aprovados"
								value={pagamentos.aprovados}
								valueStyle={{ color: '#3f8600' }}
								prefix={<CheckCircleOutlined />}
								loading={loading}
							/>
						</Card>
					</Col>
					<Col span={6}>
						<Card>
							<Statistic
								title="Pagamentos Pendentes"
								value={pagamentos.pendentes}
								valueStyle={{ color: '#fa8c16' }}
								prefix={<ClockCircleOutlined />}
								loading={loading}
							/>
						</Card>
					</Col>
					<Col span={6}>
						<Card>
							<Statistic
								title="Presenças Registradas"
								value={presencas}
								valueStyle={{ color: '#1890ff' }}
								prefix={<FileTextOutlined />}
								loading={loading}
							/>
						</Card>
					</Col>
				</Row>

				{/* Porcentagem geral de presença */}
				<Row gutter={24} style={{ marginTop: 24 }}>
					<Col span={8}>
						<Card>
							<Statistic
								title="% Geral de Presença"
								value={porcentagemPresenca}
								suffix="%"
								valueStyle={{ color: '#722ed1' }}
								loading={loading}
							/>
						</Card>
					</Col>
					<Col span={16}>
						<Card title="Usuários por Equipe">
							{usuariosPorEquipe.length === 0 ? (
								<Spin spinning={loading}>Nenhum dado</Spin>
							) : (
								<ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
									{usuariosPorEquipe.map(eq => (
										<li key={eq.nome} style={{ marginBottom: 8, fontSize: 16 }}>
											<b>{eq.nome}:</b> {eq.qtd} usuário(s)
										</li>
									))}
								</ul>
							)}
						</Card>
					</Col>
				</Row>
			</div>
		);
};

export default Dashboard;
