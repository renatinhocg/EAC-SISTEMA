const axios = require('axios');

async function debugAgenda() {
  try {
    console.log('=== DEBUG AGENDA ===\n');
    
    const agendaRes = await axios.get('http://localhost:3000/api/agenda');
    console.log('Status:', agendaRes.status);
    console.log('Headers:', agendaRes.headers);
    console.log('Data type:', typeof agendaRes.data);
    console.log('Is Array:', Array.isArray(agendaRes.data));
    console.log('Data length:', agendaRes.data.length);
    console.log('Raw data (first 500 chars):', JSON.stringify(agendaRes.data).substring(0, 500));
    
    // Verificar primeiro elemento
    if (agendaRes.data.length > 0) {
      console.log('\nPrimeiro elemento:');
      console.log('Type:', typeof agendaRes.data[0]);
      console.log('Keys:', Object.keys(agendaRes.data[0] || {}));
      console.log('Values:', agendaRes.data[0]);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

debugAgenda();
