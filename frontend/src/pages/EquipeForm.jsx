import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { getApiUrl } from '../config/api';

// Configuração do React Quill
const quillModules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, false] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['blockquote'],
      ['link'],
      ['clean']
    ]
  }
};

const quillFormats = [
  'header', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'align',
  'list', 'bullet', 'indent',
  'blockquote',
  'link'
];

const EquipeForm = () => {
  const [descricao, setDescricao] = useState('');
  const [sobre, setSobre] = useState('');
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      axios.get(getApiUrl(`equipes/${id}`))
        .then(res => {
          form.setFieldsValue({ nome: res.data.nome, funcao: res.data.funcao });
          setDescricao(res.data.descricao || '');
          setSobre(res.data.sobre || '');
        })
        .catch(() => message.error('Erro ao carregar equipe'));
    }
  }, [id, isEdit, form]);

  const onFinish = async (values) => {
    try {
      const payload = {
        ...values,
        descricao: descricao,
        sobre: sobre
      };
      if (isEdit) {
        await axios.put(getApiUrl(`equipes/${id}`), payload);
        message.success('Equipe atualizada com sucesso');
      } else {
        await axios.post(getApiUrl('equipes'), payload);
        message.success('Equipe criada com sucesso');
      }
      navigate('/equipes');
    } catch {
      message.error('Erro ao salvar equipe');
    }
  };

  return (
    <Card title={isEdit ? 'Editar Equipe' : 'Nova Equipe'} style={{ maxWidth: 900, margin: '0 auto' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ nome: '', funcao: '' }}
      >
        <Form.Item name="nome" label="Nome" rules={[{ required: true, message: 'Informe o nome' }]}>        
          <Input />
        </Form.Item>
        <Form.Item label="Descrição">
          <ReactQuill
            theme="snow"
            value={descricao}
            onChange={setDescricao}
            modules={quillModules}
            formats={quillFormats}
            placeholder="Digite a descrição da equipe..."
            style={{ minHeight: '200px' }}
          />
        </Form.Item>
        <Form.Item label="Sobre">
          <ReactQuill
            theme="snow"
            value={sobre}
            onChange={setSobre}
            modules={quillModules}
            formats={quillFormats}
            placeholder="Digite informações sobre a equipe..."
            style={{ minHeight: '200px' }}
          />
        </Form.Item>
        <Form.Item name="funcao" label="Função">
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {isEdit ? 'Atualizar' : 'Criar'}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/equipes')}>
            Cancelar
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EquipeForm;
