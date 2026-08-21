<template>
  <div class="system-page">
    <div class="system-card">
      <span class="error-code">403</span>
      <h1>Accès restreint</h1>
      <p>Vous n'avez pas les autorisations nécessaires pour accéder à cet espace.</p>
      <RouterLink to="/" class="btn btn-primary">
        Retourner à l'accueil
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.system-page {
  min-height: calc(100vh - 140px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  padding: 2rem;
}
.system-card {
  text-align: center;
  background: white;
  padding: 3rem 2.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  max-width: 480px;
}
.error-code {
  font-size: 4.5rem;
  font-weight: 900;
  color: #e53935;
  line-height: 1;
}
h1 {
  font-size: 1.5rem;
  color: #0f172a;
  margin: 1rem 0 0.5rem;
}
p {
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 2rem;
}
.btn {
  display: inline-block;
  padding: 0.7rem 1.5rem;
  background: #1a237e;
  color: white;
  text-decoration: none;
  font-weight: 600;
  border-radius: 6px;
}
</style>
