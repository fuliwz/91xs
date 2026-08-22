<template>
  <div class="player-shell">
    <video ref="el" class="player-video" controls playsinline preload="metadata" crossorigin="anonymous"></video>
    <div v-if="loading" class="player-state">{{ message }}</div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import Hls from 'hls.js'

const props = defineProps({ src: { type: String, default: '' } })
const el = ref(null)
const loading = ref(false)
const message = ref('')
let hls = null
let mediaErrorHandler = null

function destroy() {
  if (hls) {
    hls.destroy()
    hls = null
  }
  if (el.value && mediaErrorHandler) {
    el.value.removeEventListener('error', mediaErrorHandler)
    mediaErrorHandler = null
  }
  if (el.value) {
    el.value.pause()
    el.value.removeAttribute('src')
    el.value.load()
  }
}

function normalizeUrl(value) {
  if (!value) return ''
  const url = String(value).trim().replace(/^['"]|['"]$/g, '')
  if (url.startsWith('//')) return `https:${url}`
  return url
}

function mount(url) {
  destroy()
  const source = normalizeUrl(url)
  if (!el.value || !source) {
    loading.value = false
    message.value = '暂无可播放源'
    return
  }

  loading.value = true
  message.value = '正在连接播放源…'
  mediaErrorHandler = () => {
    loading.value = true
    message.value = '视频播放失败，请刷新或更换视频'
  }
  el.value.addEventListener('error', mediaErrorHandler)

  const isHls = /\.m3u8(?:$|\?)/i.test(source)
  if (isHls && el.value.canPlayType('application/vnd.apple.mpegurl')) {
    el.value.src = source
    el.value.addEventListener('loadedmetadata', () => { loading.value = false }, { once: true })
    return
  }

  if (isHls && Hls.isSupported()) {
    hls = new Hls({ enableWorker: true, lowLatencyMode: false, backBufferLength: 90 })
    hls.on(Hls.Events.MANIFEST_PARSED, () => { loading.value = false })
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data?.fatal) {
        loading.value = true
        message.value = '播放源加载失败，请刷新重试'
      }
    })
    hls.loadSource(source)
    hls.attachMedia(el.value)
    return
  }

  el.value.src = source
  el.value.addEventListener('loadedmetadata', () => { loading.value = false }, { once: true })
}

watch(() => props.src, value => mount(value), { immediate: true })
onBeforeUnmount(destroy)
</script>

<style scoped>
.player-shell{position:relative;width:100%;aspect-ratio:16/9;background:#111;overflow:hidden}.player-video{display:block;width:100%;height:100%;background:#111}.player-state{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#aaa;background:rgba(0,0,0,.35);font-size:13px;pointer-events:none}
</style>
