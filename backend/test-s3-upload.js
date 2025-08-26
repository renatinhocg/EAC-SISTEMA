// Teste mínimo de upload para S3
// Salve como test-s3-upload.js e rode com node test-s3-upload.js

const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const fs = require('fs');
require('dotenv').config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  endpoint: 'https://s3.us-east-2.amazonaws.com',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function uploadTest() {
  const filePath = './test-avatar.png'; // coloque um arquivo pequeno aqui
  if (!fs.existsSync(filePath)) {
    console.error('Arquivo de teste não encontrado:', filePath);
    return;
  }
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = 'usuarios/teste-' + Date.now() + '.png';

  console.log('--- LOG DIAGNÓSTICO S3 ---');
  console.log('process.env.AWS_REGION:', process.env.AWS_REGION);
  console.log('process.env.AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET);
  console.log('process.env.AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID);
  console.log('process.env.AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '***' : undefined);
  console.log('s3Client.config.region:', s3Client.config.region);
  console.log('s3Client.config.endpoint:', s3Client.config.endpoint);
  console.log('s3Client.config.credentials:', s3Client.config.credentials);
  console.log('Key:', fileName);
  console.log('--------------------------');

  try {
    const uploader = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Body: fileBuffer,
        ContentType: 'image/png',
        region: 'us-east-2'
      }
    });
    await uploader.done();
    const s3Url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    console.log('✅ Upload concluído! URL:', s3Url);
  } catch (err) {
    console.error('❌ Erro ao enviar para S3:', err);
  }
}

uploadTest();
