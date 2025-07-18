import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Card, Select } from 'antd';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const ChecklistForm = () => {
  const [form] = Form.useForm();
  const [equipes, setEquipes] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    // Carregar equipes para seleção múltipla
    axios.get('http://localhost:3001/equipes')
      .then(res => setEquipes(res.data))
      .catch(() => {});
    if (isEdit) {
      axios.get(`http://localhost:3001/checklists/${id}`)
        .then(res => {
          const { titulo, descricao, tipo } = res.data;
          form.setFieldsValue({ titulo, descricao, tipo, equipe_ids: res.data.equipe_ids });
        })
        .catch(() => message.error('Erro ao carregar checklist'));
    }
  }, [id, isEdit, form]);

  const onFinish = async values => {
    try {
      const payload = {
        titulo: values.titulo,
        descricao: values.descricao,
        tipo: values.tipo,
        equipe_ids: values.equipe_ids || []
      };
      if (isEdit) {
        await axios.put(`http://localhost:3001/checklists/${id}`, payload);
        message.success('Checklist atualizada com sucesso');
      } else {
        await axios.post('http://localhost:3001/checklists', payload);
        message.success('Checklist criada com sucesso');
      }
      navigate('/checklists');
    } catch (err) {
      console.error('Erro ao salvar checklist:', err);
      message.error('Erro ao salvar checklist');
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
            <Select.Option value="pré-encontro">Pré-encontro</Select.Option>
            <Select.Option value="durante o encontro">Durante o encontro</Select.Option>
            <Select.Option value="pós-encontro">Pós-encontro</Select.Option>
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
          <Button type="primary" htmlType="submit">
            {isEdit ? 'Atualizar' : 'Criar'}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/checklists')}>
            Cancelar
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ChecklistForm;
