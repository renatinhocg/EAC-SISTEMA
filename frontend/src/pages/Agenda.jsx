import React, { useEffect, useState } from 'react';
import { Table, Typography, Button, Space, Popconfirm, message, Input, Modal, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const { Title } = Typography;

const Agenda = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [tableData, setTableData] = useState([]);

  const fetchData = () => {
    setLoading(true);
    axios.get('http://localhost:3001/agendas')
      .then(res => { setData(res.data); setFilteredData(res.data); })
      .catch(() => message.error('Erro ao carregar eventos'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    setTableData(filteredData);
  }, [filteredData]);

  const filterData = (search) => {
    let list = [...data];
    if (search) list = list.filter(item => item.titulo.toLowerCase().includes(search.toLowerCase()));
    setFilteredData(list);
  };

  const handleSearch = value => { filterData(value); };
  const handleView = record => { setSelectedEvent(record); setModalVisible(true); };
  const handleModalClose = () => { setModalVisible(false); setSelectedEvent(null); };

  const handleCreate = () => navigate('/agendas/novo');
  const handleEdit = record => navigate(`/agendas/${record.id}/editar`);
  const handleDelete = id => {
    axios.delete(`http://localhost:3001/agendas/${id}`)
      .then(() => { message.success('Evento deletado'); fetchData(); })
      .catch(() => message.error('Erro ao deletar evento'));
  };

  const onDragEnd = result => {
    if (!result.destination) return;
    const items = Array.from(tableData);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setTableData(items);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #f0f1f2', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <Title level={2}>Agenda</Title>
        <Space>
          <Input.Search placeholder="Buscar título" onSearch={handleSearch} style={{ width: 200 }} allowClear />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>Atualizar</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>Novo Evento</Button>
        </Space>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="agenda-table">
          {provided => (
            <table className="ant-table" style={{ width: '100%' }}>
              <thead className="ant-table-thead">
                <tr>
                  <th style={{ width: 30 }}></th>
                  <th>Título</th>
                  <th>Data</th>
                  <th>Início</th>
                  <th>Fim</th>
                  <th>Local</th>
                  <th>Descrição</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody ref={provided.innerRef} {...provided.droppableProps} className="ant-table-tbody">
                {tableData.map((item, idx) => (
                  <Draggable key={item.id} draggableId={String(item.id)} index={idx}>
                    {(provided, snapshot) => (
                      <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{ ...provided.draggableProps.style, background: snapshot.isDragging ? '#fafafa' : undefined }}
                      >
                        <td {...provided.dragHandleProps} style={{ cursor: 'grab', width: 30 }}>⋮</td>
                        <td>{item.titulo}</td>
                        <td>{item.data ? new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : ''}</td>
                        <td>{item.hora_inicio ? item.hora_inicio.slice(0,5) : ''}</td>
                        <td>{item.hora_fim ? item.hora_fim.slice(0,5) : ''}</td>
                        <td>{item.local}</td>
                        <td>{item.descricao}</td>
                        <td>
                          <Space>
                            <Button icon={<EyeOutlined />} onClick={() => handleView(item)} />
                            <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(item)} />
                            <Button type="default" onClick={() => navigate(`/agendas/${item.id}/presenca`)}>
                              Presença
                            </Button>
                            <Popconfirm title="Tem certeza?" onConfirm={() => handleDelete(item.id)} okText="Sim" cancelText="Não">
                              <Button type="link" icon={<DeleteOutlined />} danger />
                            </Popconfirm>
                          </Space>
                        </td>
                      </tr>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </tbody>
            </table>
          )}
        </Droppable>
      </DragDropContext>
      <Modal visible={modalVisible} title={selectedEvent?.titulo} onCancel={handleModalClose} footer={<Button onClick={handleModalClose}>Fechar</Button>}>
        <p><strong>Descrição:</strong> {selectedEvent?.descricao}</p>
        <p><strong>Local:</strong> {selectedEvent?.local}</p>
      </Modal>
    </div>
  );
};

export default Agenda;
