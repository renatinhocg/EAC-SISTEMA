import React, { useEffect, useState } from 'react';
import { Table, Typography, Button, Space, Popconfirm, message, Upload } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { getApiUrl } from '../config/api';

const { Title } = Typography;

const Usuarios = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [csvFileName, setCsvFileName] = useState(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvError, setCsvError] = useState(null);
  const [csvSuccess, setCsvSuccess] = useState(null);

  const fetchData = () => {
    axios.get(getApiUrl('usuarios'))
      .then(res => setData(res.data))
      .catch(() => message.error('Erro ao carregar usuários'));
  };

  useEffect(fetchData, []);

  const handleCreate = () => navigate('/usuarios/novo');

  const handleEdit = (record) => navigate(`/usuarios/${record.id}/editar`);

  const handleDelete = (id) => {
    axios.delete(getApiUrl(`usuarios/${id}`))
      .then(() => { message.success('Usuário deletado'); fetchData(); })
      .catch(() => message.error('Erro ao deletar usuário'));
  };

  // Função para processar CSV
  const handleCSVUpload = (file) => {
    setCsvFileName(file.name);
    setCsvUploading(true);
    setCsvError(null);
    setCsvSuccess(null);
    Papa.parse(file, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
      complete: (results) => {
        // Normaliza os campos: remove espaços, força minúsculo no cabeçalho
        const normalizeKey = key => key && key.trim().toLowerCase();
        const usuarios = results.data.map(obj => {
          const novo = {};
          Object.keys(obj).forEach(k => {
            const nk = normalizeKey(k);
            novo[nk] = obj[k] ? obj[k].toString().trim() : '';
          });
          // Ajusta tipo_usuario para minúsculo
          if (novo.tipo_usuario) novo.tipo_usuario = novo.tipo_usuario.toLowerCase();
          return novo;
        });
        axios.post(getApiUrl('usuarios/import-csv'), { usuarios })
          .then(() => {
            setCsvSuccess('Usuários importados com sucesso!');
            setCsvError(null);
            message.success('Usuários importados com sucesso!');
            fetchData();
          })
          .catch(() => {
            setCsvError('Erro ao importar usuários.');
            setCsvSuccess(null);
            message.error('Erro ao importar usuários.');
          })
          .finally(() => setCsvUploading(false));
      },
      error: () => {
        setCsvError('Erro ao ler o arquivo CSV.');
        setCsvSuccess(null);
        setCsvUploading(false);
        message.error('Erro ao ler o arquivo CSV.');
      }
    });
    return false; // impede upload automático
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Nome', dataIndex: 'nome', key: 'nome' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Equipe', dataIndex: 'equipe_nome', key: 'equipe_nome' },
    { title: 'Ações', key: 'actions', render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Tem certeza?" onConfirm={() => handleDelete(record.id)} okText="Sim" cancelText="Não">
            <Button type="link" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      )},
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>Usuários</Title>
        <div style={{ display: 'flex', gap: 8 }}>
          <Upload beforeUpload={handleCSVUpload} showUploadList={false} accept=".csv">
            <Button icon={<UploadOutlined />} style={{ background: '#52c41a', color: '#fff', border: 'none' }}>
              Importar usuários por CSV
            </Button>
          </Upload>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Novo Usuário
          </Button>
        </div>
      </div>
      {csvFileName && (
        <div style={{ margin: '8px 0' }}>
          <b>Arquivo selecionado:</b> {csvFileName}
          {csvUploading && <span style={{ marginLeft: 8, color: '#faad14' }}>Enviando...</span>}
          {csvSuccess && <span style={{ marginLeft: 8, color: '#52c41a' }}>{csvSuccess}</span>}
          {csvError && <span style={{ marginLeft: 8, color: '#ff4d4f' }}>{csvError}</span>}
        </div>
      )}
      <Table rowKey="id" columns={columns} dataSource={data} />
    </div>
  );
};

export default Usuarios;
