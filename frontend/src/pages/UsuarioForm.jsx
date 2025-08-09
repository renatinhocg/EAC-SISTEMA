import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Card, Upload, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { getApiUrl } from '../config/api';
import { API_BASE_URL } from '../config/api';

const UsuarioForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [fileList, setFileList] = useState([]);
  const [tipoCirculos, setTipoCirculos] = useState([]);
  const [teams, setTeams] = useState([]);
  const isEdit = Boolean(id);

  const handleUploadChange = ({ fileList: newFileList }) => setFileList(newFileList);

  // Carregar dados iniciais
  useEffect(() => {
    async function loadData() {
      try {
        const [teamsRes, tipoRes] = await Promise.all([
          axios.get(getApiUrl('equipes')),
          axios.get(getApiUrl('tipo_circulo')),
        ]);
        setTeams(teamsRes.data);
        setTipoCirculos(tipoRes.data);
        if (isEdit) {
          const userRes = await axios.get(getApiUrl(`usuarios/${id}`));
          console.log('Dados de usuário recebidos para edição:', userRes.data);
          // Aguarda o carregamento das equipes antes de setar o valor
          setTimeout(() => {
            form.setFieldsValue({
              ...userRes.data,
              equipe_id: userRes.data.equipe_id ? Number(userRes.data.equipe_id) : null,
            });
          }, 100);
          if (userRes.data.foto) {
            // Corrige: monta URL sem /api para arquivos estáticos
            const staticUrl = `${API_BASE_URL.replace('/api', '')}/uploads/usuarios/${userRes.data.foto}`;
            setFileList([{
              uid: '-1',
              name: userRes.data.foto.split('/').pop(),
              status: 'done',
              url: staticUrl
            }]);
          }
        }
      } catch {
        message.error('Erro ao carregar dados iniciais');
      }
    }
    loadData();
  }, [id, isEdit, form]);

  const onFinish = async (values) => {
    const payload = { ...values };
    if (payload.equipe_id) {
      payload.equipe_id = Number(payload.equipe_id);
    }
    if (payload.tipo_circulo_id) {
      payload.tipo_circulo_id = Number(payload.tipo_circulo_id);
    }
    console.log('Dados para salvar usuário:', payload);
    try {
      if (isEdit) {
        // Modo edição: usar rota antiga
        const res = await axios.put(getApiUrl(`usuarios/${id}`), payload);
        const savedId = id;
        
        // Upload de foto se existir
        if (fileList.length > 0 && fileList[0].originFileObj) {
          const formData = new FormData();
          formData.append('foto', fileList[0].originFileObj);
          const fotoRes = await axios.post(
            getApiUrl(`usuarios/${savedId}/foto`),
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
          // Atualiza localStorage para mostrar nova foto
          const storedUser = JSON.parse(localStorage.getItem('user')) || {};
          const updatedUser = { ...storedUser, foto: fotoRes.data.caminho };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } else {
        // Modo criação: criar usuário primeiro, depois fazer upload da foto
        console.log('📝 Criando usuário SEM foto via rota normal');
        const res = await axios.post(getApiUrl('usuarios'), values);
        console.log('✅ Usuário criado:', res.data);
        
        const savedId = res.data.id;
        
        // Se tem foto, fazer upload separado (com tratamento de erro)
        if (fileList.length > 0 && fileList[0].originFileObj) {
          try {
            const formData = new FormData();
            formData.append('foto', fileList[0].originFileObj);
            
            console.log('📷 Fazendo upload da foto para usuário ID:', savedId);
            const fotoRes = await axios.post(
              getApiUrl(`usuarios/${savedId}/foto`),
              formData,
              { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            console.log('✅ Foto uploaded:', fotoRes.data);
          } catch (fotoError) {
            console.error('❌ Erro no upload da foto:', fotoError);
            message.warning('Usuário criado, mas houve erro no upload da foto. Você pode editar o usuário para adicionar a foto depois.');
          }
        }
      }
      
      message.success(`Usuário ${isEdit ? 'atualizado' : 'criado'} com sucesso`);
      navigate('/usuarios');
    } catch {
      message.error('Erro ao salvar usuário');
    }
  };

  return (
    <Card title={isEdit ? 'Editar Usuário' : 'Novo Usuário'} style={{ maxWidth: 600, margin: '0 auto' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item name="nome" label="Nome" rules={[{ required: true, message: 'Informe o nome' }]}>        
          <Input />
        </Form.Item>
        <Form.Item
          name="telefone"
          label="Telefone"
          rules={[{ required: true, message: 'Informe o telefone' }]}
          getValueFromEvent={({ target: { value } }) => {
            const num = value.replace(/\D/g, '').slice(0, 11);
            let formatted = num;
            if (num.length > 2) {
              formatted = `(${num.slice(0,2)}) ${num.slice(2)}`;
            }
            if (num.length > 7) {
              formatted = `(${num.slice(0,2)}) ${num.slice(2,7)}-${num.slice(7)}`;
            }
            return formatted;
          }}
        >
          <Input maxLength={15} />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Informe email válido' }]}>        
          <Input />
        </Form.Item>
        <Form.Item name="instagram" label="Instagram">
          <Input />
        </Form.Item>
        <Form.Item name="tipo_circulo_id" label="Tipo de Círculo" rules={[{ required: true, message: 'Selecione o tipo de círculo' }]}>        
          <Select placeholder="Selecione um tipo">
            {tipoCirculos.map(tc => (
              <Select.Option key={tc.id} value={tc.id}>{tc.nome}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="tipo_usuario" label="Tipo de usuário" rules={[{ required: true, message: 'Selecione o tipo' }]}>        
          <Select>
            <Select.Option value="admin">Admin</Select.Option>
            <Select.Option value="coordenador">Coordenador</Select.Option>
            <Select.Option value="integrante">Integrante</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="equipe_id" label="Equipe">
          <Select placeholder="Selecione uma equipe" loading={!teams.length}>
            {teams.map(team => (
              <Select.Option key={team.id} value={team.id}>{team.nome}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="eac_que_fez" label="EAC que Fez">
          <Input />
        </Form.Item>
        <Form.Item label="Foto">
          <Upload
            accept="image/*"
            listType="picture-card"
            beforeUpload={() => false}
            fileList={fileList}
            onChange={handleUploadChange}
            onPreview={(file) => {
              const src = file.url || URL.createObjectURL(file.originFileObj);
              const imgWindow = window.open(src);
              imgWindow.document.write(`<img src="${src}" style="max-width:100%"/>`);
            }}
          >
            {fileList.length < 1 && (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Selecionar</div>
              </div>
            )}
          </Upload>
        </Form.Item>
        <Form.Item name="senha" label="Senha" rules={[{ required: true, message: 'Informe a senha' }]}>        
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {isEdit ? 'Atualizar' : 'Criar'}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/usuarios')}>
            Cancelar
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default UsuarioForm;
