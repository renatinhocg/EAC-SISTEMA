import React, { useEffect, useState } from "react";
import api from '../services/api';

export default function AdminCriancaPage() {
  const [criancas, setCriancas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCriancas() {
      try {
        const res = await api.get('/crianca');
        setCriancas(res.data);
      } catch (err) {
        alert('Erro ao buscar crianças');
      } finally {
        setLoading(false);
      }
    }
    fetchCriancas();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Admin - Respostas das Crianças</h1>
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', color: '#222' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuário</th>
              <th>Equipe</th>
              <th>Telefone</th>
              <th>Nome</th>
              <th>Idade</th>
              <th>Alergia Alimentar</th>
              <th>Restrição Alimentar</th>
              <th>Assinatura</th>
              <th>Data Envio</th>
            </tr>
          </thead>
          <tbody>
            {criancas.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.usuario_id}</td>
                <td>{c.equipe_id}</td>
                <td>{c.telefone}</td>
                <td>{c.nome}</td>
                <td>{c.idade}</td>
                <td>{c.alergiaAlimentar ? 'Sim' : 'Não'}</td>
                <td>{c.restricaoAlimentar}</td>
                <td>{c.assinatura}</td>
                <td>{c.createdat ? new Date(c.createdat).toLocaleString() : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
