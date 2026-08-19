<template>
  <div class="chargement-wrapper">
    <div class="spinner"></div>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'Chargement...'
  }
})
</script>

<style scoped>
.chargement-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.spinner {
  width: 45px;
  height: 45px;
  border: 4px solid #e0e0e0;
  border-top: 4px solid #1a237e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

p {
  color: #666;
  font-size: 0.95rem;
}
</style>
