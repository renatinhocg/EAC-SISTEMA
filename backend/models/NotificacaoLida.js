// Modelo de Notificação Lida (log de leitura)
class NotificacaoLida {
  constructor({ id, notificacao_id, usuario_id, data_lida }) {
    this.id = id;
    this.notificacao_id = notificacao_id;
    this.usuario_id = usuario_id;
    this.data_lida = data_lida;
  }
}

module.exports = NotificacaoLida;
