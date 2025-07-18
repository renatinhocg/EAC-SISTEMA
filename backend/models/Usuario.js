// Modelo de Usuário
class Usuario {
  constructor({ id, nome, telefone, email, instagram, tipo_usuario, tipo_circulo, eac_que_fez, foto, senha }) {
    this.id = id;
    this.nome = nome;
    this.telefone = telefone;
    this.email = email;
    this.instagram = instagram;
    this.tipo_usuario = tipo_usuario; // novo campo
    this.tipo_circulo = tipo_circulo;
    this.eac_que_fez = eac_que_fez;
    this.foto = foto; // caminho/URL do arquivo
    this.senha = senha;
  }
}

module.exports = Usuario;
