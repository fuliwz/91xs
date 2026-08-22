<template>
  <router-link class="portal-video-card" :to="`/detail/${v.vod_id}`">
    <div class="thumb">
      <span class="date-badge">{{ dateText }}</span>
      <img v-if="v.vod_pic" :src="v.vod_pic" :alt="v.vod_name || '视频'" loading="lazy" @error="broken = true" v-show="!broken" />
      <div v-if="broken || !v.vod_pic" class="thumb-placeholder">暂无图片</div>
    </div>
    <div class="video-title">{{ v.vod_name || '未命名视频' }}</div>
  </router-link>
</template>

<script setup>
import { computed, ref } from 'vue'
const props = defineProps({ v: { type: Object, required: true } })
const broken = ref(false)
const dateText = computed(() => String(props.v.vod_time || props.v.vod_pubdate || props.v.vod_year || '').slice(0, 10) || '最新')
</script>
