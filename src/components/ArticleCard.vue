<template>
  <router-link class="article-card" :to="to">
    <div class="article-thumb">
      <img v-if="pic && !imageError" :src="pic" :alt="title" loading="lazy" decoding="async" @error="imageError = true" />
      <span v-else>图片加载失败</span>
    </div>
    <div class="article-card-title">{{ title }}</div>
  </router-link>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  title: { type: String, default: '未命名文章' },
  pic: { type: String, default: '' },
  to: { type: String, default: '/image' },
})

const imageError = ref(false)
watch(() => props.pic, () => { imageError.value = false })
</script>
