import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Card, Select, Checkbox } from 'antd';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { getApiUrl } from '../config/api';

const AgendaForm = () => {
  const [form] = Form.useForm();
  const [equipes, setEquipes] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      axios.get(getApiUrl(`agendas/${id}`))
        .then(res => {
          const { titulo, descricao, local, equipe_ids, presenca_ativa, data, hora_inicio, hora_fim } = res.data;
          form.setFieldsValue({
            titulo,
            descricao,
            local,
            equipe_ids: equipe_ids || [],
            presenca_ativa: presenca_ativa === 1 || presenca_ativa === true || presenca_ativa === '1',
            data: data ? data.slice(0, 10) : null,
            hora_inicio,
            hora_fim,
          });
        })
        .catch(() => message.error('Erro ao carregar evento'));
    }
    // Carregar equipes para seleção
    axios.get(getApiUrl('equipes'))
      .then(res => setEquipes(res.data))
      .catch(() => {});
  }, [id, isEdit, form]);

  const onFinish = async values => {
    try {
      const payload = {
        titulo: values.titulo,
        descricao: values.descricao,
        local: values.local,
        equipe_ids: values.equipe_ids || [],
        presenca_ativa: !!values.presenca_ativa,
        data: values.data,
        hora_inicio: values.hora_inicio,
        hora_fim: values.hora_fim,
      };
      console.log('Enviando payload agenda:', payload);
      if (isEdit) {
        await axios.put(
getApiUrl(`agendas/${id}`),
          payload
        );
        message.success('Evento atualizado com sucesso');
      } else {
        await axios.post(
          getApiUrl('agendas'),
          payload
        );
        message.success('Evento criado com sucesso');
      }
      navigate('/agendas');
    } catch (err) {
      console.error('Erro ao salvar evento:', err);
      message.error('Erro ao salvar evento');
    }
  };

  return (
    <Card title={isEdit ? 'Editar Evento' : 'Novo Evento'} style={{ maxWidth: 600, margin: '0 auto' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ titulo: '', descricao: '', local: '', equipe_ids: [] }}
      >
        <Form.Item name="titulo" label="Título" rules={[{ required: true, message: 'Informe o título' }]}>        
          <Input />
        </Form.Item>
        <Form.Item name="descricao" label="Descrição">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item name="data" label="Data" rules={[{ required: true, message: 'Informe a data' }]}>        
          <Input type="date" />
        </Form.Item>
        <Form.Item name="hora_inicio" label="Horário de início" rules={[{ required: true, message: 'Informe o horário de início' }]}>        
          <Input type="time" />
        </Form.Item>
        <Form.Item name="hora_fim" label="Horário de fim" rules={[{ required: true, message: 'Informe o horário de fim' }]}>        
          <Input type="time" />
        </Form.Item>
        <Form.Item name="local" label="Local">
          <Input />
        </Form.Item>
        <Form.Item name="equipe_ids" label="Equipes">
          <Select mode="multiple" placeholder="Selecione equipes" allowClear>
            {equipes.map(e => <Select.Option key={e.id} value={e.id}>{e.nome}</Select.Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="presenca_ativa" valuePropName="checked" initialValue={false}>
          <Checkbox>Presença</Checkbox>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {isEdit ? 'Atualizar' : 'Criar'}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/agendas')}>
            Cancelar
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AgendaForm;
