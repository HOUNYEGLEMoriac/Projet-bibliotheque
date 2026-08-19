export function formaterDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

export function joursRestants(dateRetour) {
  const aujourd = new Date()
  const retour = new Date(dateRetour)
  const diff = Math.ceil((retour - aujourd) / (1000 * 60 * 60 * 24))
  return diff
}

export function estEnRetard(dateRetour) {
  return joursRestants(dateRetour) < 0
}

export function labelRetard(dateRetour) {
  const jours = joursRestants(dateRetour)
  if (jours > 0) return `Dans ${jours} jour(s)`
  if (jours === 0) return "Aujourd'hui"
  return `En retard de ${Math.abs(jours)} jour(s)`
}
