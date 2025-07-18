// Modelo de Notificação
class Notificacao {
  constructor({ id, titulo, descricao, para_todos, equipe_id }) {
    this.id = id;
    this.titulo = titulo;
    this.descricao = descricao;
    this.para_todos = para_todos;
    this.equipe_id = equipe_id;
  }
}

module.exports = Notificacao;
