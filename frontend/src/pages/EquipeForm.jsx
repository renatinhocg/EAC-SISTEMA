import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
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
  // Função para atualizar lista de arquivos do upload
  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Função para validar upload de imagem
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Você só pode fazer upload de imagens!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('A imagem deve ter menos de 2MB!');
    }
    return false; // Impede upload automático
  };
  // Função para submit do formulário
  const onFinish = async (values) => {
    // Exemplo: apenas exibe os valores no console
    console.log('Valores do formulário:', values);
    // Aqui você pode adicionar a lógica de envio para o backend
  };
  const [descricao, setDescricao] = useState('');
  const [sobre, setSobre] = useState('');
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);



  return (
    <Card title={isEdit ? 'Editar Equipe' : 'Nova Equipe'} style={{ maxWidth: 900, margin: '0 auto' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ marginTop: 24 }}
      >
        <Form.Item name="nome" label="Nome da Equipe" rules={[{ required: true, message: 'Digite o nome da equipe' }]}> 
          <Input />
        </Form.Item>
        <Form.Item label="Ícone da Equipe">
          <Upload
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={beforeUpload}
            maxCount={1}
            listType="picture"
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Selecionar Ícone</Button>
          </Upload>
          <div style={{ marginTop: '8px', color: '#666', fontSize: '12px' }}>
            Formatos aceitos: JPG, PNG, SVG. Tamanho máximo: 2MB
          </div>
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
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/admin/equipes')}>
            Cancelar
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

// ...existing code...

export default EquipeForm;
