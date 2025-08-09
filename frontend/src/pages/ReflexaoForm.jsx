import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Card, Select, Upload } from 'antd';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { UploadOutlined } from '@ant-design/icons';
import EquipeSelect from '../components/EquipeSelect';
import { getApiUrl } from '../config/api';

const ReflexaoForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [agendas, setAgendas] = useState([]);
  const [fileList, setFileList] = useState([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    axios.get(getApiUrl('agendas'))
      .then(res => setAgendas(res.data))
      .catch(() => {});

    if (isEdit) {
      axios.get(getApiUrl(`reflexoes/${id}`))
        .then(res => {
          form.setFieldsValue({
            texto: res.data.texto,
            agenda_id: res.data.agenda_id,
            equipe_id: res.data.equipe_id || [],
          });
          // Preenche o anexo se existir
          if (res.data.anexo) {
            setFileList([
              {
                uid: '-1',
                name: res.data.anexo.split('/').pop(),
                status: 'done',
                url: getApiUrl('${res.data.anexo}'),
                // Necessário para download/preview
                thumbUrl: getApiUrl('${res.data.anexo}'),
              }
            ]);
          } else {
            setFileList([]);
          }
        })
        .catch(() => message.error('Erro ao carregar reflexão'));
    }
  }, [id, isEdit, form]);

  const onFinish = async values => {
    try {
      let dataToSend;
      // Se houver anexo, usa FormData
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const formData = new FormData();
        formData.append('texto', values.texto);
        formData.append('usuario_id', user.id);
        formData.append('agenda_id', values.agenda_id);
        // Envia todos os IDs de equipe selecionados (array) ou vazio
        if (Array.isArray(values.equipe_id)) {
          values.equipe_id.forEach(id => formData.append('equipe_id[]', id));
        } else if (values.equipe_id) {
          formData.append('equipe_id[]', values.equipe_id);
        }
        formData.append('anexo', fileList[0].originFileObj);
        dataToSend = formData;
      } else {
        dataToSend = {
          texto: values.texto,
          usuario_id: user.id,
          agenda_id: values.agenda_id,
          equipe_id: values.equipe_id || [], // array ou vazio
        };
      }
      if (isEdit) {
        await axios.put(
          getApiUrl(`reflexoes/${id}`),
          dataToSend,
          fileList.length > 0 ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
        );
        message.success('Reflexão atualizada com sucesso');
      } else {
        await axios.post(
          getApiUrl('reflexoes'),
          dataToSend,
          fileList.length > 0 ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
        );
        message.success('Reflexão criada com sucesso');
      }
      navigate('/reflexoes');
    } catch {
      message.error('Erro ao salvar reflexão');
    }
  };

  return (
    <Card title={isEdit ? 'Editar Reflexão' : 'Nova Reflexão'} style={{ maxWidth: 600, margin: '0 auto' }}>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ texto: '', agenda_id: null, equipe_id: null }}>
        <Form.Item name="texto" label="Texto" rules={[{ required: true, message: 'Informe o texto da reflexão' }]}>        
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item name="agenda_id" label="Evento" rules={[{ required: true, message: 'Selecione o evento' }]}>        
          <Select placeholder="Selecione um evento">
            {agendas.map(a => <Select.Option key={a.id} value={a.id}>{a.titulo}</Select.Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="equipe_id" label="Equipe">
          <EquipeSelect
            value={Array.isArray(form.getFieldValue('equipe_id')) ? form.getFieldValue('equipe_id') : (form.getFieldValue('equipe_id') ? [form.getFieldValue('equipe_id')] : [])}
            onChange={val => form.setFieldsValue({ equipe_id: val })}
            placeholder="Selecione uma ou mais equipes"
            allowClear
            multiple={true}
          />
        </Form.Item>
        <Form.Item label="Anexo">
          <Upload
            beforeUpload={() => false}
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            defaultFileList={[]}
            // Permite download/preview do anexo já salvo
            onPreview={file => {
              if (file.url) window.open(file.url, '_blank');
            }}
          >
            <Button icon={<UploadOutlined />}>Anexar</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {isEdit ? 'Atualizar' : 'Criar'}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/reflexoes')}>
            Cancelar
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ReflexaoForm;
