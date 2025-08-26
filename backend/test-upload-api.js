// Teste de upload via API Express em produção
// Salve como test-upload-api.js e rode com node test-upload-api.js

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_URL = 'https://eac-pwa-project-production.up.railway.app/api/usuarios/1/foto'; // ajuste o ID conforme necessário
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mzg2LCJlbWFpbCI6Ijc0QGVtYWlsLmNvbSIsIm5vbWUiOiJUaW9zIFJlbmF0aW5obyBlIEJydW5hIiwidGlwb191c3VhcmlvIjoiaW50ZWdyYW50ZSIsImlhdCI6MTc1NjE4MTM3NCwiZXhwIjoxNzYwMDY5Mzc0fQ.gfYQt15NwaRhmJ1WBwFARB7NqemQkLXb1laUk00aUrs'; // coloque um token válido de usuário

async function uploadFoto() {
  const filePath = './test-avatar.png';
  if (!fs.existsSync(filePath)) {
    console.error('Arquivo de teste não encontrado:', filePath);
    return;
  }
  const fileBuffer = fs.readFileSync(filePath);
  const formData = new FormData();
  formData.append('foto', fileBuffer, { filename: 'test-avatar.png', contentType: 'image/png' });

  try {
    const res = await axios.post(API_URL, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${TOKEN}`
      }
    });
    console.log('✅ Upload via API concluído:', res.data);
  } catch (err) {
    console.error('❌ Erro ao enviar via API:', err.response?.data || err.message);
  }
}

uploadFoto();