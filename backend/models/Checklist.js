// Modelo de Checklist
class Checklist {
  constructor({ id, titulo, descricao, tipo, equipes }) {
    this.id = id;
    this.titulo = titulo;
    this.descricao = descricao;
    this.tipo = tipo; // 'pré-encontro', 'durante o encontro', 'pós-encontro'
    this.equipes = equipes; // array de ids de equipes (relacionamento N:N)
  }
}

module.exports = Checklist;
