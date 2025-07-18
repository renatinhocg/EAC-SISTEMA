import React, { useEffect, useState } from 'react';
import { Select, Spin } from 'antd';
import axios from 'axios';

// Componente de seleção de equipe(s) reutilizável
// Props:
//   value: id(s) selecionado(s)
//   onChange: função chamada ao selecionar
//   multiple: boolean (default: false)
//   placeholder: string
//
// Exemplo de uso:
// <EquipeSelect value={equipeId} onChange={setEquipeId} />
// <EquipeSelect multiple value={equipesIds} onChange={setEquipesIds} />

const EquipeSelect = ({ value, onChange, multiple = false, placeholder = 'Selecione a equipe' }) => {
  const [equipes, setEquipes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:3001/equipes')
      .then(res => {
        const lista = Array.isArray(res.data) ? res.data : [];
        setEquipes(lista.sort((a, b) => (a.nome || '').localeCompare(b.nome || '')));
      })
      .catch(() => setEquipes([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Select
      showSearch
      allowClear
      loading={loading}
      mode={multiple ? 'multiple' : undefined}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ width: '100%' }}
      optionFilterProp="children"
      filterOption={(input, option) =>
        (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
      }
    >
      {equipes.map(eq => (
        <Select.Option key={eq.id} value={eq.id}>
          {eq.nome}
        </Select.Option>
      ))}
    </Select>
  );
};

export default EquipeSelect;
