import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lista de arquivos para atualizar
const filesToUpdate = [
  'src/pages/TipoCirculoForm.jsx',
  'src/pages/Notificacoes.jsx',
  'src/pages/NotificacaoForm.jsx',
  'src/pages/Reflexoes.jsx',
  'src/pages/ReflexaoForm.jsx',
  'src/pages/Agenda.jsx',
  'src/pages/AgendaForm.jsx',
  'src/pages/AgendaPresencaEquipes.jsx',
  'src/pages/UsuarioForm.jsx',
  'src/components/EquipeSelect.jsx',
  'src/AdminLayout.jsx'
];

function addImportIfNotExists(content) {
  if (!content.includes("import { getApiUrl }") && !content.includes("import { API_BASE_URL, getApiUrl }")) {
    // Encontrar a última linha de import
    const lines = content.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        lastImportIndex = i;
      }
    }
    
    if (lastImportIndex !== -1) {
      lines.splice(lastImportIndex + 1, 0, "import { getApiUrl } from '../config/api';");
      return lines.join('\n');
    }
  }
  return content;
}

function replaceLocalhostUrls(content) {
  // Substituir todas as ocorrências de localhost:3001
  content = content.replace(/axios\.get\(['"`]http:\/\/localhost:3001\/([^'"`]+)['"`]\)/g, "axios.get(getApiUrl('$1'))");
  content = content.replace(/axios\.post\(['"`]http:\/\/localhost:3001\/([^'"`]+)['"`]/g, "axios.post(getApiUrl('$1')");
  content = content.replace(/axios\.put\(['"`]http:\/\/localhost:3001\/([^'"`]+)['"`]/g, "axios.put(getApiUrl('$1')");
  content = content.replace(/axios\.delete\(['"`]http:\/\/localhost:3001\/([^'"`]+)['"`]\)/g, "axios.delete(getApiUrl('$1'))");
  
  // Substituir URLs em template literals
  content = content.replace(/axios\.get\(`http:\/\/localhost:3001\/([^`]+)`\)/g, "axios.get(getApiUrl(`$1`))");
  content = content.replace(/axios\.post\(`http:\/\/localhost:3001\/([^`]+)`/g, "axios.post(getApiUrl(`$1`)");
  content = content.replace(/axios\.put\(`http:\/\/localhost:3001\/([^`]+)`/g, "axios.put(getApiUrl(`$1`)");
  content = content.replace(/axios\.delete\(`http:\/\/localhost:3001\/([^`]+)`\)/g, "axios.delete(getApiUrl(`$1`))");
  
  // Substituir URLs para imagens e outros recursos
  content = content.replace(/['"`]http:\/\/localhost:3001\/([^'"`]+)['"`]/g, "getApiUrl('$1')");
  content = content.replace(/`http:\/\/localhost:3001\/([^`]+)`/g, "getApiUrl(`$1`)");
  
  return content;
}

function processFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Arquivo não encontrado: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Verificar se o arquivo contém localhost:3001
  if (!content.includes('localhost:3001')) {
    console.log(`Arquivo ${filePath} não contém localhost:3001, pulando...`);
    return;
  }
  
  console.log(`Processando: ${filePath}`);
  
  // Adicionar import se necessário
  content = addImportIfNotExists(content);
  
  // Substituir URLs
  content = replaceLocalhostUrls(content);
  
  // Salvar arquivo
  fs.writeFileSync(fullPath, content);
  console.log(`✅ ${filePath} atualizado`);
}

// Processar todos os arquivos
console.log('Iniciando atualização dos arquivos...\n');

filesToUpdate.forEach(processFile);

console.log('\n✅ Atualização concluída!');
