<template>
  <div class="erreur">
    <h1>404</h1>
    <p>La page que vous recherchez n'existe pas.</p>
    <RouterLink to="/">Retour à l'accueil</RouterLink>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.erreur {
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
  color: #e74c3c;
}
</style>
