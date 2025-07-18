// Modelo de relação N:N entre Checklist e Equipe
class ChecklistEquipe {
  constructor({ id, checklist_id, equipe_id }) {
    this.id = id;
    this.checklist_id = checklist_id;
    this.equipe_id = equipe_id;
  }
}

module.exports = ChecklistEquipe;
