<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-section">
        <h3>📚 BiblioCommune</h3>
        <p>Votre bibliothèque communautaire en ligne.</p>
      </div>

      <div class="footer-section">
        <h4>Navigation</h4>
        <ul>
          <li><RouterLink to="/">Accueil</RouterLink></li>
          <li><RouterLink to="/catalogue">Catalogue</RouterLink></li>
          <li><RouterLink to="/recherche">Recherche</RouterLink></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>Mon compte</h4>
        <ul>
          <li><RouterLink to="/connexion">Connexion</RouterLink></li>
          <li><RouterLink to="/inscription">Inscription</RouterLink></li>
        </ul>
      </div>
    </div>

    <div class="footer-bas">
      <p>© {{ annee }} BiblioCommune - Groupe A | Moriac, Khalid, Silvio</p>
    </div>
  </footer>
</template>

<script setup>
const annee = new Date().getFullYear()
</script>

<style scoped>
.footer {
  background-color: #1a237e;
  color: rgba(255, 255, 255, 0.85);
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 2rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.footer-section h3 {
  font-size: 1.2rem;
  color: white;
  margin-bottom: 0.8rem;
}

.footer-section h4 {
  font-size: 1rem;
  color: white;
  margin-bottom: 0.8rem;
}

.footer-section p {
  font-size: 0.9rem;
  line-height: 1.6;
}

.footer-section ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.footer-section ul a {
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.footer-section ul a:hover {
  color: white;
}

.footer-bas {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  text-align: center;
  padding: 1rem;
  font-size: 0.85rem;
}
</style>
