import React, { useEffect, useState } from 'react';
import axios from 'axios';


const API_URL = '/usuarios/com-foto';



export default function FotosUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função para montar a URL correta da foto (S3)
  const getFotoUrl = foto => {
    if (!foto) return '';
    // Só exibe se for URL completa (S3)
    if (foto.startsWith('http://') || foto.startsWith('https://')) return foto;
    // Se não for URL, retorna vazio (não exibe)
    return '';
  };

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
      <h1 className="text-2xl font-bold mb-6">Fotos dos Usuários</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {usuarios.map(user => (
          <div key={user.id} className="bg-white rounded shadow p-4 flex flex-col items-center">
            <img
              src={getFotoUrl(user.foto)}
              alt={user.nome}
              className="w-full h-auto max-h-96 object-contain mb-4 border"
              style={{ maxWidth: '100%' }}
            />
            <div className="font-semibold text-lg mb-2">{user.nome}</div>
            <div className="text-sm text-gray-600 mb-2">{user.email}</div>
            <a
              href={getFotoUrl(user.foto)}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Baixar Foto
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
