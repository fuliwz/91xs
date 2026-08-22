<template>
  <router-link :to="`/play/${v.vod_id}`" class="portal-video-card">
    <div class="thumb">
      <span class="date-badge">{{ dateText }}</span>
      <img v-if="coverUrl && !broken" :src="coverUrl" :alt="v.vod_name || '视频封面'" loading="lazy" decoding="async" @error="broken = true" />
      <div v-else class="thumb-placeholder">暂无图片</div>
    </div>
    <div class="video-title">{{ v.vod_name || '未命名视频' }}</div>
  </router-link>
</template>
<script setup>
import { computed, ref } from 'vue'
const props = defineProps({ v: { type: Object, required: true } })
const broken = ref(false)
const coverUrl = computed(() => {
  const pic = props.v?.vod_pic
  if (!pic) return ''
  return pic.startsWith('//') ? `https:${pic}` : pic
})
const dateText = computed(() => String(props.v?.vod_time || props.v?.vod_pubdate || props.v?.vod_year || '').slice(0, 10) || '最新')
</script>
