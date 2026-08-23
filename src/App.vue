<template>
  <Header />
  <AdContainer />
  <main class="page"><router-view /></main>
  <Footer />
</template>

<script setup>
import Header from './components/Header.vue'
import AdContainer from './components/AdContainer.vue'
import Footer from './components/Footer.vue'
</script>
