CREATE TABLE crianca (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  equipe_id INT NOT NULL,
  telefone VARCHAR(50),
  nome VARCHAR(100) NOT NULL,
  idade VARCHAR(20),
  alergiaAlimentar BOOLEAN,
  alergiaAlimentarDesc VARCHAR(255),
  alergiaMedic BOOLEAN,
  alergiaMedicDesc VARCHAR(255),
  alergiaContato BOOLEAN,
  alergiaContatoDesc VARCHAR(255),
  restricaoAlimentar VARCHAR(255),
  assinatura VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
