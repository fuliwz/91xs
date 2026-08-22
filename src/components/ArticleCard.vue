<template>
  <router-link class="article-card" :to="to">
    <div class="article-thumb">
      <img v-if="pic" :src="pic" :alt="title" loading="lazy" />
      <span v-else>文章</span>
    </div>
    <div class="article-card-title">{{ title }}</div>
  </router-link>
</template>

<script setup>
defineProps({
  title: { type: String, default: '未命名文章' },
  pic: { type: String, default: '' },
  to: { type: String, default: '/image' },
})
</script>
