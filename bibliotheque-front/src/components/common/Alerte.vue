<template>
  <Transition name="alerte">
    <div v-if="visible" :class="['alerte', `alerte-${type}`]">
      <span class="alerte-icone">{{ icone }}</span>
      <span class="alerte-message">{{ message }}</span>
      <button class="alerte-fermer" @click="fermer">✕</button>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  message: { type: String, required: true },
  type: {
    type: String,
    default: 'info',
    validator: (v) => ['succes', 'erreur', 'info', 'attention'].includes(v)
  },
  duree: { type: Number, default: 4000 }
})

const emit = defineEmits(['fermer'])
const visible = ref(true)

const icone = computed(() => ({
  succes: '✅',
  erreur: '❌',
  info: 'ℹ️',
  attention: '⚠️'
}[props.type]))

function fermer() {
  visible.value = false
  emit('fermer')
}

onMounted(() => {
  if (props.duree > 0) {
    setTimeout(fermer, props.duree)
  }
})
</script>

<style scoped>
.alerte {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.9rem 1.2rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.alerte-succes  { background: #e8f5e9; color: #2e7d32; border-left: 4px solid #2e7d32; }
.alerte-erreur  { background: #ffebee; color: #c62828; border-left: 4px solid #c62828; }
.alerte-info    { background: #e3f2fd; color: #1565c0; border-left: 4px solid #1565c0; }
.alerte-attention { background: #fff8e1; color: #f57f17; border-left: 4px solid #f57f17; }

.alerte-message { flex: 1; }

.alerte-fermer {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.alerte-fermer:hover { opacity: 1; }

.alerte-enter-active,
.alerte-leave-active { transition: all 0.3s ease; }
.alerte-enter-from,
.alerte-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
