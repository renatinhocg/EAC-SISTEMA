// Modelo de Agenda (Calendário)
class Agenda {
  constructor({ id, titulo, descricao, data, hora_inicio, hora_fim, local }) {
    this.id = id;
    this.titulo = titulo;
    this.descricao = descricao;
    this.data = data;
    this.hora_inicio = hora_inicio;
    this.hora_fim = hora_fim;
    this.local = local;
  }
}

module.exports = Agenda;
