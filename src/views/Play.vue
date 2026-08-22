<template>
  <main class="play-page">
    <div class="page-shell">
      <div v-if="vod" class="play-layout">
        <section class="player-column">
          <div class="player-card">
            <div class="player-topbar">
              <div class="player-status"><span></span>正在播放</div>
              <div class="player-format">HD · HLS · 10秒快进</div>
            </div>
            <div class="player-wrap">
              <video ref="video" controls class="player" playsinline preload="metadata" :poster="vod.vod_pic || ''"></video>
              <div v-if="playerLoading" class="player-loading"><span class="play-icon">▶</span><span>{{ playerMessage }}</span></div>
            </div>
            <div v-if="sources.length > 1" class="source-bar">
              <span>播放线路：</span>
              <button v-for="(source,index) in sources" :key="`${source.url}-${index}`" :class="{active:index===sourceIndex}" type="button" @click="selectSource(index)">
                {{ source.name || `线路${index + 1}` }}
              </button>
            </div>
          </div>

          <section class="video-info-card">
            <div class="info-header">
              <div class="title-area">
                <div class="eyebrow"><span></span>NOW PLAYING</div>
                <h1>{{ vod.vod_name || '正在加载…' }}</h1>
              </div>
              <button type="button" class="share-btn" @click="sharePage">分享</button>
            </div>
            <div class="video-meta">
              <span v-if="vod.vod_hits">{{ vod.vod_hits }} 次播放</span>
              <span v-if="vod.type_name">{{ vod.type_name }}</span>
              <span v-if="vod.vod_time">{{ vod.vod_time }}</span>
              <span v-if="resumeText">{{ resumeText }}</span>
            </div>
            <div v-if="vod.vod_content || vod.vod_blurb" class="description">
              <div class="description-title">视频简介</div>
              <div class="description-text">{{ vod.vod_blurb || vod.vod_content }}</div>
            </div>
          </section>
        </section>

        <aside class="side-panel">
          <div class="side-card">
            <div class="side-heading"><div><span class="side-kicker">EXPLORE</span><h2>相关推荐</h2></div><span class="recommend-count">{{ recommend.length }}</span></div>
            <div v-if="recommend.length" class="side-list">
              <router-link v-for="item in recommend.slice(0, 6)" :key="item.vod_id" :to="`/play/${item.vod_id}`" class="side-item">
                <div class="side-thumb"><img :src="item.vod_pic || '/fallback.jpg'" :alt="item.vod_name || '视频封面'" loading="lazy"></div>
                <div class="side-item-info"><strong>{{ item.vod_name || '未命名视频' }}</strong><span>{{ item.vod_hits || 0 }} 次播放</span></div>
              </router-link>
            </div>
            <div v-else class="side-empty">暂无相关推荐</div>
          </div>
        </aside>
      </div>

      <section v-if="vod" class="recommend-section">
        <div class="section-bar"><div><div class="section-kicker">MORE FOR YOU</div><h2>猜你喜欢</h2><div class="section-subtitle">更多同类精彩内容</div></div><span class="section-count">{{ recommend.length }} 部</span></div>
        <div v-if="recommend.length" class="video-grid"><VideoCard v-for="item in recommend.slice(0, 20)" :key="item.vod_id" :item="item" /></div>
        <div v-else class="recommend-empty">暂无同分类相关推荐</div>
      </section>

      <div v-if="!vod" class="empty">{{ playerMessage || '正在加载视频…' }}</div>
    </div>
  </main>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import Hls from 'hls.js'
import { getDetail, getCategoryVideos, detailItem, playSources } from '../api/vod'
import VideoCard from '../components/VideoCard.vue'

const route = useRoute()
const vod = ref(null)
const recommend = ref([])
const sources = ref([])
const sourceIndex = ref(0)
const video = ref(null)
const playerLoading = ref(true)
const playerMessage = ref('正在加载视频…')
const resumeText = ref('')

let hls = null
let progressTimer = null
let currentLoad = 0

function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}

function saveProgress() {
  const item = vod.value
  const el = video.value
  if (!item?.vod_id || !el?.duration || !el.currentTime) return
  const data = readJson('91xs_watch_progress', {})
  data[item.vod_id] = { currentTime: el.currentTime, duration: el.duration, updatedAt: Date.now() }
  localStorage.setItem('91xs_watch_progress', JSON.stringify(data))
}

function applyResume() {
  const item = vod.value
  const el = video.value
  if (!item?.vod_id || !el) return
  const p = readJson('91xs_watch_progress', {})[item.vod_id]
  if (!p || p.currentTime < 15 || p.currentTime > p.duration - 5) return
  const restore = () => {
    if (video.value && Number.isFinite(p.currentTime)) video.value.currentTime = p.currentTime
    resumeText.value = `上次看到 ${formatTime(p.currentTime)}`
    el.removeEventListener('loadedmetadata', restore)
  }
  if (el.readyState >= 1) restore()
  else el.addEventListener('loadedmetadata', restore, { once: true })
}

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function destroyPlayer() {
  clearInterval(progressTimer)
  progressTimer = null
  saveProgress()
  if (hls) {
    hls.stopLoad()
    hls.detachMedia()
    hls.destroy()
    hls = null
  }
  if (video.value) {
    video.value.pause()
    video.value.removeAttribute('src')
    video.value.load()
  }
}

function initPlayer(url) {
  const el = video.value
  const source = String(url || '').trim().replace(/^['"]|['"]$/g, '')
  if (!el || !source) {
    playerLoading.value = false
    playerMessage.value = 'API 没有返回可播放地址'
    return
  }

  destroyPlayer()
  playerLoading.value = true
  playerMessage.value = '正在连接播放源…'
  const token = ++currentLoad
  const isHls = /\.m3u8(?:$|[?#])/i.test(source)

  const ready = () => {
    if (token !== currentLoad) return
    playerLoading.value = false
    playerMessage.value = ''
    applyResume()
  }
  const failed = () => {
    if (token !== currentLoad) return
    playerLoading.value = true
    playerMessage.value = '播放失败，请切换播放线路或重新加载'
  }

  el.addEventListener('loadedmetadata', ready, { once: true })
  el.addEventListener('error', failed, { once: true })

  if (isHls && Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90,
      maxBufferLength: 30,
      manifestLoadingMaxRetry: 2,
      levelLoadingMaxRetry: 2,
      fragLoadingMaxRetry: 2,
      xhrSetup: xhr => { xhr.withCredentials = false }
    })
    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      if (token === currentLoad) hls.loadSource(source)
    })
    hls.on(Hls.Events.MANIFEST_PARSED, ready)
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (token !== currentLoad || !data?.fatal) return
      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError()
      } else {
        failed()
      }
    })
    hls.attachMedia(el)
  } else {
    // Safari/iOS can play HLS natively. Other browsers use the normal video source.
    el.src = source
    el.load()
  }

  progressTimer = setInterval(saveProgress, 10000)
}

function selectSource(index) {
  if (!sources.value[index]) return
  sourceIndex.value = index
  initPlayer(sources.value[index].url)
}

async function loadData() {
  const token = ++currentLoad
  destroyPlayer()
  vod.value = null
  recommend.value = []
  sources.value = []
  sourceIndex.value = 0
  resumeText.value = ''
  playerLoading.value = true
  playerMessage.value = '正在加载视频…'

  const id = route.params.id
  if (!id) return

  try {
    const response = await getDetail(id)
    if (token !== currentLoad) return
    const item = detailItem(response)
    if (!item) {
      playerLoading.value = false
      playerMessage.value = '未找到该视频'
      return
    }

    vod.value = item
    sources.value = playSources(item)
    if (sources.value.length) {
      initPlayer(sources.value[0].url)
    } else {
      playerLoading.value = false
      playerMessage.value = 'API 返回的视频没有 vod_play_url'
    }

    if (item.vod_id) {
      const history = readJson('91xs_watch_history', []).filter(x => String(x.vod_id || x.id) !== String(item.vod_id))
      history.unshift({ vod_id: item.vod_id, vod_name: item.vod_name, vod_pic: item.vod_pic, type_name: item.type_name, watched_at: Date.now() })
      localStorage.setItem('91xs_watch_history', JSON.stringify(history.slice(0, 30)))
    }

    if (item.type_id) {
      try {
        const rec = await getCategoryVideos(item.type_id, 1, 24)
        if (token === currentLoad) {
          recommend.value = (Array.isArray(rec?.list) ? rec.list : [])
            .filter(x => String(x.vod_id) !== String(item.vod_id))
            .slice(0, 20)
        }
      } catch (error) {
        console.warn('相关推荐请求失败', error)
      }
    }

    document.title = `${item.vod_name || '播放'} - 91XS`
  } catch (error) {
    console.error('播放页加载失败:', error)
    if (token === currentLoad) {
      playerLoading.value = false
      playerMessage.value = '视频详情加载失败，请刷新重试'
    }
  }
}

async function sharePage() {
  try {
    if (navigator.share) await navigator.share({ title: vod.value?.vod_name || document.title, url: location.href })
    else { await navigator.clipboard.writeText(location.href); alert('播放页链接已复制') }
  } catch (_) {}
}

watch(() => route.params.id, loadData, { immediate: true })
onBeforeUnmount(() => { currentLoad++; destroyPlayer() })
</script>

<style scoped>
.play-page{padding:16px 0 36px;background:#fff}.page-shell{width:1100px;max-width:100%;margin:0 auto}.play-layout{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:16px;align-items:start}.player-column{min-width:0}.player-card,.video-info-card,.side-card{border:1px solid #e5e5e5;background:#fff}.player-card{overflow:hidden}.player-topbar{height:34px;display:flex;align-items:center;justify-content:space-between;padding:0 10px;background:#078acb;color:#fff;font-size:12px}.player-status{display:flex;align-items:center;gap:6px}.player-status span{width:6px;height:6px;border-radius:50%;background:#fff}.player-format{font-size:10px;opacity:.85}.player-wrap{position:relative;background:#050505}.player{display:block;width:100%;aspect-ratio:16/9;background:#050505}.player-loading{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#aaa;background:rgba(0,0,0,.45);pointer-events:none;font-size:12px}.play-icon{font-size:34px;color:#078acb}.source-bar{display:flex;align-items:center;gap:6px;min-height:36px;padding:5px 8px;background:#f5f5f5;color:#777;overflow-x:auto;white-space:nowrap;font-size:11px}.source-bar button{border:1px solid #ccc;background:#fff;color:#666;padding:4px 9px;cursor:pointer}.source-bar button.active{border-color:#078acb;background:#078acb;color:#fff}.video-info-card{margin-top:8px;padding:14px}.info-header{display:flex;justify-content:space-between;gap:15px}.eyebrow{font-size:9px;color:#078acb;font-weight:700;letter-spacing:.12em}.eyebrow span{display:inline-block;width:5px;height:5px;border-radius:50%;background:#078acb;margin-right:5px}.video-info-card h1{margin:4px 0 8px;color:#333;font-size:20px;line-height:1.4}.share-btn{height:30px;border:1px solid #ccc;background:#fafafa;color:#666;padding:0 12px;cursor:pointer}.video-meta{display:flex;flex-wrap:wrap;gap:6px}.video-meta span{padding:3px 7px;background:#f2f2f2;color:#888;font-size:10px}.description{margin-top:10px;padding-top:9px;border-top:1px solid #eee}.description-title{color:#555;font-weight:700;font-size:11px}.description-text{margin-top:4px;color:#777;font-size:11px;line-height:1.7}.side-card{padding:12px}.side-heading{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.side-kicker,.section-kicker{font-size:9px;color:#078acb;font-weight:700;letter-spacing:.1em}.side-heading h2{margin:2px 0 0;color:#444;font-size:16px}.recommend-count{color:#078acb;font-size:11px}.side-list{display:flex;flex-direction:column;gap:6px}.side-item{display:flex;gap:8px;padding:5px;text-decoration:none}.side-item:hover{background:#f5f9fc}.side-thumb{flex:0 0 105px;height:62px;overflow:hidden;background:#eee}.side-thumb img{width:100%;height:100%;object-fit:cover}.side-item-info{min-width:0;display:flex;flex-direction:column;justify-content:center;gap:5px}.side-item-info strong{display:-webkit-box;overflow:hidden;color:#555;font-size:11px;line-height:1.4;-webkit-line-clamp:2;-webkit-box-orient:vertical}.side-item-info span{color:#999;font-size:9px}.side-empty,.recommend-empty,.empty{padding:35px;text-align:center;color:#999;font-size:12px}.recommend-section{margin-top:14px;border:1px solid #e5e5e5;background:#fff}.section-bar{height:45px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;background:#078acb;color:#fff}.section-bar h2{margin:2px 0 0;font-size:14px}.section-kicker{color:#dff5ff;font-size:8px}.section-subtitle{display:none}.section-count{font-size:10px;opacity:.9}.video-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;padding:6px}@media(max-width:820px){.play-layout{display:block}.side-panel{display:none}}@media(max-width:640px){.play-page{padding:8px 0 25px}.page-shell{width:100%}.player-card{border-left:0;border-right:0}.player-topbar{height:32px}.player-format{display:none}.video-info-card{margin-top:6px;border-left:0;border-right:0}.video-info-card h1{font-size:17px}.video-meta{gap:4px}.video-grid{grid-template-columns:repeat(2,minmax(0,1fr));padding:5px;gap:4px}.recommend-section{border-left:0;border-right:0}}
</style>
