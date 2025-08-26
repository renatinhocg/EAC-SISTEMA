import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Card, Select } from 'antd';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { getApiUrl } from '../config/api';

const ChecklistForm = () => {
  // Captura erros globais de promise não tratada
  useEffect(() => {
    const handler = (event) => {
      console.error('[ChecklistForm] UnhandledRejection:', event.reason);
    };
    window.addEventListener('unhandledrejection', handler);
    return () => window.removeEventListener('unhandledrejection', handler);
  }, []);
  const [form] = Form.useForm();
  const [equipes, setEquipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    // Carregar equipes para seleção múltipla
    axios.get(getApiUrl('equipes'))
      .then(res => setEquipes(res.data))
      .catch(() => {});
    if (isEdit) {
      axios.get(getApiUrl(`checklists/${id}`))
        .then(res => {
          const { titulo, descricao, tipo } = res.data;
          form.setFieldsValue({ titulo, descricao, tipo, equipe_ids: res.data.equipe_ids });
        })
        .catch(() => message.error('Erro ao carregar checklist'));
    }
  }, [id, isEdit, form]);

  const onFinish = async values => {
    console.log('[ChecklistForm] onFinish chamado', values);
    setLoading(true);
    // Timeout de segurança para loading travado
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
      message.error('Tempo limite atingido. Verifique sua conexão ou o backend.');
    }, 10000);
    try {
      const payload = {
        titulo: values.titulo,
        descricao: values.descricao,
        tipo: values.tipo,
        equipe_ids: values.equipe_ids || []
      };
      console.log('[ChecklistForm] Enviando payload:', payload);
      if (isEdit) {
        console.log('[ChecklistForm] Antes do await axios.put');
        const resp = await axios.put(getApiUrl(`checklists/${id}`), payload);
        console.log('[ChecklistForm] Depois do await axios.put', resp);
        message.success('Checklist atualizada com sucesso');
      } else {
        console.log('[ChecklistForm] Antes do await axios.post');
        const resp = await axios.post(getApiUrl('checklists'), payload);
        console.log('[ChecklistForm] Depois do await axios.post', resp);
        message.success('Checklist criada com sucesso');
      }
      clearTimeout(loadingTimeout);
  navigate('/admin/checklists');
    } catch (err) {
      clearTimeout(loadingTimeout);
      console.error('[ChecklistForm] Erro ao salvar checklist:', err);
      if (err && err.response) {
        console.error('[ChecklistForm] Erro response data:', err.response.data);
      }
      message.error('Erro ao salvar checklist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={isEdit ? 'Editar Checklist' : 'Nova Checklist'} style={{ maxWidth: 600, margin: '0 auto' }}>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ titulo: '', descricao: '', tipo: 'pré-encontro', equipe_ids: [] }}>
        <Form.Item name="titulo" label="Título" rules={[{ required: true, message: 'Informe o título' }]}>        
          <Input />
        </Form.Item>
        <Form.Item name="tipo" label="Tipo" rules={[{ required: true, message: 'Selecione o tipo' }]}>        
          <Select>
            <Select.Option value="Pré">Pré</Select.Option>
            <Select.Option value="Durante">Durante</Select.Option>
            <Select.Option value="Pós">Pós</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="equipe_ids" label="Equipes">
          <Select mode="multiple" placeholder="Selecione equipes" allowClear>
            {equipes.map(e => <Select.Option key={e.id} value={e.id}>{e.nome}</Select.Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="descricao" label="Descrição">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
            {isEdit ? 'Atualizar' : 'Criar'}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/admin/checklists')} disabled={loading}>
            Cancelar
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ChecklistForm;
