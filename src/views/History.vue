<template>
  <section>
    <div class="title">
      <h1>观看历史</h1>
      <button v-if="items.length" type="button" @click="clearHistory">清空历史</button>
    </div>
    <VideoGrid :items="items" />
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import VideoGrid from '../components/VideoGrid.vue'

const items = ref([])
const STORAGE_KEY = '91xs_watch_history'

function readHistory() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(raw)) return []
    return raw.map(x => ({
      vod_id: x.vod_id ?? x.id,
      vod_name: x.vod_name ?? x.name,
      vod_pic: x.vod_pic ?? x.pic,
    })).filter(x => x.vod_id != null)
  } catch {
    return []
  }
}

function loadHistory() {
  items.value = readHistory()
}

function clearHistory() {
  localStorage.removeItem(STORAGE_KEY)
  // Remove the legacy key too so stale data cannot reappear in older builds.
  localStorage.removeItem('history')
  items.value = []
}

onMounted(loadHistory)
</script>
