import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = '/api/usuarios/todos';

export default function TodosUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(API_URL)
      .then(res => {
        setUsuarios(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Todos os Usuários</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {usuarios.map(user => (
          <div key={user.id} className="bg-white rounded shadow p-4 flex flex-col items-center">
            <div className="font-semibold text-lg mb-2">{user.nome}</div>
            <div className="text-sm text-gray-600 mb-2">{user.email}</div>
            <div className="text-xs text-gray-400 mb-2">Foto: {user.foto || 'Sem foto'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
