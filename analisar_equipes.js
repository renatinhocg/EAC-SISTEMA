const fs = require('fs');

async function analisarEquipes() {
  try {
    console.log('🔍 Analisando equipes nos dados exportados...');
    
    const dadosCompletos = fs.readFileSync('dados_completos_local.sql', 'utf8');
    const linhas = dadosCompletos.split('\n');
    
    // Encontrar INSERTs da tabela equipe
    const insertsEquipe = linhas.filter(linha => 
      linha.trim().startsWith('INSERT INTO equipe')
    );
    
    console.log('\n📋 INSERTs de equipe encontrados:');
    insertsEquipe.forEach(insert => {
      console.log(insert);
    });
    
    // Buscar por todas as referências de equipe_id
    const equipesUsadas = new Set();
    
    // Padrões para encontrar equipe_id
    const padroes = [
      /equipe_id['"]*\s*(?:,\s*|\(\s*)['"]*(\d+)['"]*\)/g,
      /INSERT INTO.*equipe.*VALUES.*?\((\d+)/g,
      /'equipe_id'\s*:\s*(\d+)/g
    ];
    
    padroes.forEach((regex, index) => {
      let match;
      while ((match = regex.exec(dadosCompletos)) !== null) {
        equipesUsadas.add(parseInt(match[1]));
      }
    });
    
    console.log('\n📋 IDs de equipes referenciados nos dados:');
    const idsOrdenados = [...equipesUsadas].sort((a, b) => a - b);
    console.log(idsOrdenados);
    
    // Equipes que inserimos no Railway
    const equipesRailway = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    
    console.log('\n🔍 IDs de equipes que estão nos dados mas não inserimos no Railway:');
    const idsFaltando = idsOrdenados.filter(id => !equipesRailway.includes(id));
    console.log(idsFaltando);
    
    // Vamos ver exemplos de foreign key errors
    console.log('\n🔍 Buscando exemplos de INSERTs com equipe_id que podem estar falhando...');
    const problematicoIds = idsFaltando.slice(0, 3); // Primeiros 3
    
    problematicoIds.forEach(id => {
      const regexBusca = new RegExp(`equipe_id['"]*\\s*(?:,\\s*|\\(\\s*)['"]*${id}['"]*`, 'g');
      let match;
      let count = 0;
      while ((match = regexBusca.exec(dadosCompletos)) !== null && count < 2) {
        const inicio = Math.max(0, match.index - 50);
        const fim = Math.min(dadosCompletos.length, match.index + 150);
        const contexto = dadosCompletos.substring(inicio, fim);
        console.log(`\nEquipe ID ${id}:`);
        console.log(contexto);
        count++;
      }
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

analisarEquipes();
