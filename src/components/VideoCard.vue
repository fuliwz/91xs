<template>
  <router-link v-if="v?.vod_id" :to="`/play/${v.vod_id}`" class="portal-video-card">
    <div class="thumb">
      <span class="date-badge">{{ dateText }}</span>
      <img v-if="coverUrl && !broken" :src="coverUrl" :alt="v.vod_name || '视频封面'" loading="lazy" decoding="async" referrerpolicy="no-referrer" @error="broken = true" />
      <div v-else class="thumb-placeholder">暂无图片</div>
    </div>
    <div class="video-title">{{ v.vod_name || '未命名视频' }}</div>
  </router-link>
</template>
<script setup>
import { computed, ref } from 'vue'
const props = defineProps({ v: { type: Object, default: null }, item: { type: Object, default: null } })
const v = computed(() => props.v || props.item || null)
const broken = ref(false)

function httpsUrl(value) {
  const source = String(value || '').trim()
  if (!source) return ''
  if (source.startsWith('//')) return `https:${source}`
  if (/^http:\/\//i.test(source)) return source.replace(/^http:\/\//i, 'https://')
  return source
}

const coverUrl = computed(() => httpsUrl(v.value?.vod_pic))
const dateText = computed(() => String(v.value?.vod_time || v.value?.vod_pubdate || v.value?.vod_year || '').slice(0, 10) || '最新')
</script>
