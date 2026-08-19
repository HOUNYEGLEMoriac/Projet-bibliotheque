<template>
  <div class="interdit">
    <h1>403</h1>
    <p>Vous n'avez pas la permission d'accéder à cette page.</p>
    <RouterLink to="/">Retour à l'accueil</RouterLink>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.interdit {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 1rem;
  text-align: center;
}

h1 {
  font-size: 5rem;
  color: #e67e22;
}
</style>
