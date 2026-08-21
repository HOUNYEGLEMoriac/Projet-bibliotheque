<template>
  <div class="admin-page">
    <AdminNavbar />

    <main class="admin-content">
      <div class="container">

        <div class="page-header">
          <div>
            <h1>Configuration des Relances Automatiques</h1>
            <p>Paramétrez les délais et messages des notifications envoyées aux adhérents.</p>
          </div>
          <RouterLink to="/admin/notifications/history" class="btn btn-secondary">
            Consulter l'historique des envois →
          </RouterLink>
        </div>

        <Alerte
          v-if="actionAlert.message"
          :message="actionAlert.message"
          :type="actionAlert.type"
          :duree="4000"
          @fermer="actionAlert.message = ''"
        />

        <div class="config-grid">

          <!-- Formulaire de configuration des règles CRON -->
          <div class="panel-card">
            <h2>Règles de déclenchement (Tâches planifiées)</h2>
            <p class="panel-sub">Le système exécute une vérification quotidienne à minuit.</p>

            <form @submit.prevent="saveConfig" class="config-form">

              <!-- Règle 1 -->
              <div class="rule-block">
                <div class="rule-header">
                  <span class="rule-tag tag-info">Relance 1</span>
                  <h3>Rappel préventif avant échéance</h3>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Délai avant date limite (jours)</label>
                    <input v-model.number="config.reminder_before_days" type="number" min="1" max="10" required />
                  </div>
                </div>
                <div class="form-group">
                  <label>Modèle de message</label>
                  <textarea v-model="config.reminder_before_msg" rows="2" required></textarea>
                </div>
              </div>

              <!-- Règle 2 -->
              <div class="rule-block">
                <div class="rule-header">
                  <span class="rule-tag tag-warning">Relance 2</span>
                  <h3>Notification au Jour J</h3>
                </div>
                <div class="form-group">
                  <label>Modèle de message</label>
                  <textarea v-model="config.reminder_due_msg" rows="2" required></textarea>
                </div>
              </div>

              <!-- Règle 3 -->
              <div class="rule-block">
                <div class="rule-header">
                  <span class="rule-tag tag-danger">Relance 3</span>
                  <h3>Alerte de retard constaté</h3>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Délai après échéance (jours)</label>
                    <input v-model.number="config.overdue_days" type="number" min="1" max="30" required />
                  </div>
                </div>
                <div class="form-group">
                  <label>Modèle de message</label>
                  <textarea v-model="config.overdue_msg" rows="2" required></textarea>
                </div>
              </div>

              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="!saving">Enregistrer les paramètres de relance</span>
                <span v-else>Sauvegarde...</span>
              </button>
            </form>
          </div>

          <!-- Panneau d'exécution manuelle / Test -->
          <div class="panel-card side-panel">
            <h2>Déclenchement Manuel</h2>
            <p class="panel-sub">Forcer l'exécution immédiate du script de relances pour tester les envois.</p>

            <div class="cron-box">
              <div class="cron-status">
                <span class="status-indicator active"></span>
                <span>CRON Job actif (fréquence : quotidienne à 00:00)</span>
              </div>
              <button
                class="btn btn-test w-full"
                @click="triggerManualCron"
                :disabled="triggering"
              >
                <span v-if="!triggering">⚡ Exécuter la vérification maintenant</span>
                <span v-else>Traitement du lot en cours...</span>
              </button>
            </div>

            <div class="cron-info">
              <h3>Variables dynamiques disponibles</h3>
              <ul>
                <li><code>{nom_adherent}</code> : Prénom et nom du lecteur</li>
                <li><code>{titre_livre}</code> : Titre de l'ouvrage concerné</li>
                <li><code>{date_echeance}</code> : Date limite de retour</li>
                <li><code>{jours_retard}</code> : Nombre de jours de dépassement</li>
              </ul>
            </div>
          </div>

        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import AdminNavbar from '@/components/admin/AdminNavbar.vue'
import Alerte from '@/components/common/Alerte.vue'
import api from '@/services/api'

const saving = ref(false)
const triggering = ref(false)

const actionAlert = reactive({
  message: '',
  type: 'info'
})

const config = reactive({
  reminder_before_days: 3,
  reminder_before_msg: 'Bonjour {nom_adherent}, votre emprunt du livre "{titre_livre}" arrive à échéance dans {jours} jours.',
  reminder_due_msg: 'Bonjour {nom_adherent}, le livre "{titre_livre}" est à rendre aujourd\'hui à la bibliothèque.',
  overdue_days: 3,
  overdue_msg: 'Alerte retard : Le livre "{titre_livre}" est en retard de {jours_retard} jours. Merci de le restituer rapidement.'
})

async function fetchConfig() {
  try {
    const res = await api.get('/admin/notifications/config')
    if (res.data) Object.assign(config, res.data)
  } catch (err) {
    console.warn('Utilisation des valeurs par défaut pour les relances.')
  }
}

async function saveConfig() {
  saving.value = true
  actionAlert.message = ''
  try {
    await api.put('/admin/notifications/config', config)
    actionAlert.type = 'succes'
    actionAlert.message = 'Configuration des relances enregistrée avec succès.'
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || 'Erreur lors de la sauvegarde.'
  } finally {
    saving.value = false
  }
}

async function triggerManualCron() {
  triggering.value = true
  actionAlert.message = ''
  try {
    const res = await api.post('/admin/notifications/trigger-cron')
    actionAlert.type = 'succes'
    actionAlert.message = res.message || 'Le traitement des relances a été exécuté avec succès.'
  } catch (err) {
    actionAlert.type = 'erreur'
    actionAlert.message = err.message || "Erreur lors de l'exécution du CRON."
  } finally {
    triggering.value = false
  }
}

onMounted(() => {
  fetchConfig()
})
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: #f1f5f9;
  display: flex;
  flex-direction: column;
}

.admin-content {
  flex: 1;
  padding: 2.5rem 0;
}

.container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.8rem;
  color: #0f172a;
  font-weight: 800;
  margin-bottom: 0.2rem;
}

.page-header p {
  color: #64748b;
  font-size: 0.95rem;
}

.config-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 2rem;
  align-items: start;
}

.panel-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.panel-card h2 {
  font-size: 1.2rem;
  color: #0f172a;
  font-weight: 700;
}

.panel-sub {
  color: #64748b;
  font-size: 0.88rem;
  margin-bottom: 1.8rem;
}

.rule-block {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.2rem;
  margin-bottom: 1.5rem;
}

.rule-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.rule-header h3 {
  font-size: 0.95rem;
  color: #1e293b;
  font-weight: 700;
}

.rule-tag {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.tag-info { background: #dbeafe; color: #1e40af; }
.tag-warning { background: #fef3c7; color: #b45309; }
.tag-danger { background: #fee2e2; color: #b91c1c; }

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  font-weight: 600;
  font-size: 0.85rem;
  color: #334155;
}

input, textarea {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.65rem 0.85rem;
  font-size: 0.9rem;
  outline: none;
  font-family: inherit;
}

input:focus, textarea:focus {
  border-color: #2563eb;
}

.cron-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.2rem;
  margin-bottom: 1.5rem;
}

.cron-status {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  color: #334155;
  margin-bottom: 1rem;
  font-weight: 600;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-indicator.active {
  background: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.2);
}

.cron-info {
  border-top: 1px solid #f1f5f9;
  padding-top: 1.2rem;
}

.cron-info h3 {
  font-size: 0.9rem;
  color: #0f172a;
  font-weight: 700;
  margin-bottom: 0.6rem;
}

.cron-info ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: #475569;
}

.cron-info code {
  background: #e2e8f0;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  color: #0f172a;
  font-weight: 600;
}

.btn {
  height: 42px;
  padding: 0 1.4rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: #2563eb;
  color: white;
  width: 100%;
}
.btn-primary:hover:not(:disabled) { background: #1d4ed8; }

.btn-secondary {
  background: white;
  border: 1px solid #cbd5e1;
  color: #334155;
}
.btn-secondary:hover { background: #f8fafc; }

.btn-test {
  background: #0f172a;
  color: white;
}
.btn-test:hover:not(:disabled) { background: #1e293b; }

.w-full { width: 100%; }

:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
