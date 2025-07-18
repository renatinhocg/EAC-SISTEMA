// Modelo de Presença
class Presenca {
  constructor({ id, equipe_id, usuario_id, data, presente }) {
    this.id = id;
    this.equipe_id = equipe_id;
    this.usuario_id = usuario_id;
    this.data = data;
    this.presente = presente;
  }
}

module.exports = Presenca;
