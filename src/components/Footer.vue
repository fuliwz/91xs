<template>
  <footer>
    <div class="footer-contact">{{ site.footer.email }}</div>
    <div class="foot footer-links">{{ site.footer.linksTitle }}</div>
    <div class="disclaimer">{{ site.footer.disclaimer }}</div>
  </footer>
</template>

<script setup>
import site from '../config/site'
</script>
