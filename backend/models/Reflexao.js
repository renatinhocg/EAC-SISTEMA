// Modelo de Reflexão
class Reflexao {
  constructor({ id, texto, usuario_id, agenda_id, equipe_id, data }) {
    this.id = id;
    this.texto = texto;
    this.usuario_id = usuario_id;
    this.agenda_id = agenda_id;
    this.equipe_id = equipe_id;
    this.data = data;
  }
}

module.exports = Reflexao;
