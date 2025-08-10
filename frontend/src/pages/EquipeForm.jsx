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
  const [descricao, setDescricao] = useState('');
  const [sobre, setSobre] = useState('');
  const [fileList, setFileList] = useState([]);
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
          
          // Se há imagem, adicionar à lista de arquivos
          if (res.data.imagem) {
            setFileList([{
              uid: '-1',
              name: res.data.imagem,
              status: 'done',
              url: getApiUrl(`uploads/equipes/${res.data.imagem}`)
            }]);
          }
        })
        .catch(() => message.error('Erro ao carregar equipe'));
    }
  }, [id, isEdit, form]);

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      formData.append('nome', values.nome);
      formData.append('funcao', values.funcao);
      formData.append('descricao', descricao);
      formData.append('sobre', sobre);
      
      // Adicionar imagem se foi selecionada
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('imagem', fileList[0].originFileObj);
      }
      
      if (isEdit) {
        await axios.put(getApiUrl(`equipes/${id}`), formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        message.success('Equipe atualizada com sucesso');
      } else {
        await axios.post(getApiUrl('equipes'), formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        message.success('Equipe criada com sucesso');
      }
      navigate('/equipes');
    } catch {
      message.error('Erro ao salvar equipe');
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

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
        
        <Form.Item label="Ícone da Equipe">
          <Upload
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={beforeUpload}
            maxCount={1}
            listType="picture"
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>
              Selecionar Ícone
            </Button>
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
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/equipes')}>
            Cancelar
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EquipeForm;
