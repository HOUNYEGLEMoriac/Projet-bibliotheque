<template>
  <div id="app">
    <Navbar v-if="afficherNavbar" />
    <main class="contenu-principal">
      <RouterView />
    </main>
    <Footer v-if="afficherFooter" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '@/components/common/Navbar.vue'
import Footer from '@/components/common/Footer.vue'

const route = useRoute()


const afficherNavbar = computed(() => !route.path.startsWith('/admin'))
const afficherFooter = computed(() => !route.path.startsWith('/admin'))
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.contenu-principal {
  flex: 1;
}
</style>
