// Modelo de Equipe
class Equipe {
  constructor({ id, nome, descricao, sobre, funcao }) {
    this.id = id;
    this.nome = nome;
    this.descricao = descricao;
    this.sobre = sobre;
    this.funcao = funcao;
  }
}

module.exports = Equipe;
