<template>
  <main class="play-page">
    <div class="page-shell">
      <div v-if="vod" class="play-layout">
        <section class="player-column">
          <div class="player-card">
            <div class="player-topbar"><div class="player-status"><span></span>正在播放</div><div class="player-format">HD · HLS</div></div>
            <div class="player-wrap">
              <video ref="video" controls playsinline preload="metadata" class="player" :poster="secureUrl(vod.vod_pic)"></video>
              <div v-if="playerLoading" class="player-loading"><span class="play-icon">▶</span><span>{{ playerMessage }}</span></div>
            </div>
            <div v-if="sources.length > 1" class="source-bar"><span>播放线路：</span><button v-for="(source,index) in sources" :key="`${source.url}-${index}`" :class="{active:index===sourceIndex}" type="button" @click="selectSource(index)">{{ source.name || `线路${index + 1}` }}</button></div>
          </div>
          <section class="video-info-card">
            <div class="info-header"><div><div class="eyebrow"><span></span>NOW PLAYING</div><h1>{{ vod.vod_name || '正在加载…' }}</h1></div><button class="share-btn" type="button" @click="sharePage">分享</button></div>
            <div class="video-meta"><span v-if="vod.vod_hits">{{ vod.vod_hits }} 次播放</span><span v-if="vod.type_name">{{ vod.type_name }}</span><span v-if="vod.vod_time">{{ vod.vod_time }}</span><span v-if="resumeText">{{ resumeText }}</span></div>
            <div v-if="vod.vod_content || vod.vod_blurb" class="description"><b>视频简介</b><div>{{ vod.vod_blurb || vod.vod_content }}</div></div>
          </section>
        </section>
        <aside class="side-panel"><div class="side-card"><div class="side-heading"><div><span>EXPLORE</span><h2>相关推荐</h2></div><em>{{ recommend.length }}</em></div><div v-if="recommend.length" class="side-list"><router-link v-for="item in recommend.slice(0,6)" :key="item.vod_id" :to="`/play/${item.vod_id}`" class="side-item"><div class="side-thumb"><img :src="secureUrl(item.vod_pic) || '/fallback.jpg'" :alt="item.vod_name || '视频封面'" loading="lazy"></div><div><strong>{{ item.vod_name || '未命名视频' }}</strong><small>{{ item.vod_hits || 0 }} 次播放</small></div></router-link></div><div v-else class="side-empty">暂无相关推荐</div></div></aside>
      </div>
      <section v-if="vod" class="recommend-section"><div class="section-bar"><div><small>MORE FOR YOU</small><h2>猜你喜欢</h2></div><span>{{ recommend.length }} 部</span></div><div v-if="recommend.length" class="video-grid"><VideoCard v-for="item in recommend.slice(0,20)" :key="item.vod_id" :item="item" /></div><div v-else class="recommend-empty">暂无同分类相关推荐</div></section>
      <div v-if="!vod" class="empty">{{ playerMessage || '正在加载视频…' }}</div>
    </div>
  </main>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import Hls from 'hls.js'
import { getDetail, getCategoryVideos, detailItem, playSources, secureUrl } from '../api/vod'
import VideoCard from '../components/VideoCard.vue'

const route = useRoute()
const vod = ref(null), recommend = ref([]), sources = ref([]), sourceIndex = ref(0), video = ref(null)
const playerLoading = ref(true), playerMessage = ref('正在加载视频…'), resumeText = ref('')
let hls = null, progressTimer = null, currentLoad = 0, playerLoad = 0

function readJson(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback } }
function formatTime(sec) { const m = Math.floor(sec / 60); const s = Math.floor(sec % 60).toString().padStart(2,'0'); return `${m}:${s}` }
function saveProgress() { const item=vod.value, el=video.value; if(!item?.vod_id || !el?.duration || !el.currentTime)return; const d=readJson('91xs_watch_progress',{}); d[item.vod_id]={currentTime:el.currentTime,duration:el.duration,updatedAt:Date.now()}; localStorage.setItem('91xs_watch_progress',JSON.stringify(d)) }
function applyResume() { const p=readJson('91xs_watch_progress',{})[vod.value?.vod_id], el=video.value; if(!p||!el||p.currentTime<15||p.currentTime>p.duration-5)return; const restore=()=>{if(!video.value)return;el.currentTime=p.currentTime;resumeText.value=`上次看到 ${formatTime(p.currentTime)}`}; if(el.readyState>=1)restore();else el.addEventListener('loadedmetadata',restore,{once:true}) }
function destroyPlayer() { playerLoad++;clearInterval(progressTimer);progressTimer=null;saveProgress();if(hls){try{hls.stopLoad();hls.detachMedia();hls.destroy()}catch(_){}hls=null}if(video.value){try{video.value.pause();video.value.removeAttribute('src');video.value.load()}catch(_){}} }

const BaseLoader = Hls.DefaultConfig?.loader
class HttpsLoader extends BaseLoader {
  load(context, config, callbacks) {
    if (context?.url) context.url = secureUrl(context.url)
    if (context?.frag?.url) context.frag.url = secureUrl(context.frag.url)
    if (context?.level?.url) context.level.url = secureUrl(context.level.url)
    return super.load(context, config, callbacks)
  }
}

function initPlayer(url) {
  const el=video.value, source=secureUrl(url)
  if(!el){playerLoading.value=false;playerMessage.value='播放器元素尚未就绪';return}
  if(!source){playerLoading.value=false;playerMessage.value='API 没有返回可播放地址';return}
  destroyPlayer();playerLoading.value=true;playerMessage.value='正在连接 HTTPS 播放源…';const token=++playerLoad
  const ready=()=>{if(token!==playerLoad)return;playerLoading.value=false;playerMessage.value='';applyResume()}
  const failed=()=>{if(token===playerLoad){playerLoading.value=true;playerMessage.value='播放失败，请检查播放源 HTTPS/CORS 配置或切换线路'}}
  el.addEventListener('loadedmetadata',ready,{once:true});el.addEventListener('error',failed,{once:true})
  const isHls=/\.m3u8(?:$|[?#])/i.test(source)
  if(isHls&&Hls.isSupported()&&BaseLoader){
    hls=new Hls({loader:HttpsLoader,enableWorker:true,lowLatencyMode:false,backBufferLength:90,maxBufferLength:30,manifestLoadingMaxRetry:2,levelLoadingMaxRetry:2,fragLoadingMaxRetry:2,xhrSetup:xhr=>{xhr.withCredentials=false}})
    hls.on(Hls.Events.MEDIA_ATTACHED,()=>{if(token===playerLoad)hls.loadSource(source)})
    hls.on(Hls.Events.MANIFEST_PARSED,ready)
    hls.on(Hls.Events.ERROR,(_,data)=>{if(token!==playerLoad||!data?.fatal)return;if(data.type===Hls.ErrorTypes.MEDIA_ERROR){try{hls.recoverMediaError()}catch(_){failed()}}else failed()})
    hls.attachMedia(el)
  }else{
    el.src=source
    el.load()
  }
  progressTimer=setInterval(saveProgress,10000)
}
function selectSource(index){if(!sources.value[index])return;sourceIndex.value=index;nextTick(()=>initPlayer(sources.value[index].url))}

async function loadData(){
  const token=++currentLoad
  destroyPlayer();vod.value=null;recommend.value=[];sources.value=[];sourceIndex.value=0;resumeText.value='';playerLoading.value=true;playerMessage.value='正在加载视频…'
  const id=route.params.id;if(!id)return
  try{
    const item=detailItem(await getDetail(id));if(token!==currentLoad)return
    if(!item){playerLoading.value=false;playerMessage.value='未找到该视频';return}
    vod.value=item
    sources.value=playSources(item)
    await nextTick()
    if(token!==currentLoad)return
    if(sources.value.length)initPlayer(sources.value[0].url)
    else{playerLoading.value=false;playerMessage.value='API 返回的视频没有可播放地址'}
    if(item.vod_id){const h=readJson('91xs_watch_history',[]).filter(x=>String(x.vod_id||x.id)!==String(item.vod_id));h.unshift({vod_id:item.vod_id,vod_name:item.vod_name,vod_pic:item.vod_pic,type_name:item.type_name,watched_at:Date.now()});localStorage.setItem('91xs_watch_history',JSON.stringify(h.slice(0,30)))}
    if(item.type_id){try{const rec=await getCategoryVideos(item.type_id,1,24);if(token===currentLoad)recommend.value=(Array.isArray(rec?.list)?rec.list:[]).filter(x=>String(x.vod_id)!==String(item.vod_id)).slice(0,20)}catch(e){console.warn('相关推荐请求失败',e)}}
    document.title=`${item.vod_name||'播放'} - 91XS`
  }catch(error){console.error('播放页加载失败:',error);if(token===currentLoad){playerLoading.value=false;playerMessage.value='视频详情加载失败，请刷新重试'}}
}
async function sharePage(){try{if(navigator.share)await navigator.share({title:vod.value?.vod_name||document.title,url:location.href});else{await navigator.clipboard.writeText(location.href);alert('播放页链接已复制')}}catch(_){} }
watch(()=>route.params.id,loadData,{immediate:true})
onBeforeUnmount(()=>{currentLoad++;destroyPlayer()})
</script>

<style scoped>
.play-page{padding:16px 0 36px;background:#fff}.page-shell{width:1100px;max-width:100%;margin:0 auto}.play-layout{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:16px;align-items:start}.player-column{min-width:0}.player-card,.video-info-card,.side-card{border:1px solid #e5e5e5;background:#fff}.player-card{overflow:hidden}.player-topbar{height:34px;display:flex;align-items:center;justify-content:space-between;padding:0 10px;background:#078acb;color:#fff;font-size:12px}.player-status{display:flex;gap:6px;align-items:center}.player-status span{width:6px;height:6px;border-radius:50%;background:#fff}.player-format{font-size:10px;opacity:.85}.player-wrap{position:relative;background:#050505}.player{display:block;width:100%;height:auto;min-height:180px;aspect-ratio:16/9;background:#050505}.player-loading{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#aaa;background:rgba(0,0,0,.45);pointer-events:none;font-size:12px}.play-icon{font-size:34px;color:#078acb}.source-bar{display:flex;align-items:center;gap:6px;min-height:36px;padding:5px 8px;background:#f5f5f5;color:#777;overflow-x:auto;white-space:nowrap;font-size:11px}.source-bar button{border:1px solid #ccc;background:#fff;color:#666;padding:4px 9px;cursor:pointer}.source-bar button.active{border-color:#078acb;background:#078acb;color:#fff}.video-info-card{margin-top:8px;padding:14px}.info-header{display:flex;justify-content:space-between;gap:15px}.eyebrow{font-size:9px;color:#078acb;font-weight:700;letter-spacing:.12em}.eyebrow span{display:inline-block;width:5px;height:5px;border-radius:50%;background:#078acb;margin-right:5px}.video-info-card h1{margin:4px 0 8px;color:#333;font-size:20px;line-height:1.4}.share-btn{height:30px;border:1px solid #ccc;background:#fafafa;color:#666;padding:0 12px;cursor:pointer}.video-meta{display:flex;flex-wrap:wrap;gap:6px}.video-meta span{padding:3px 7px;background:#f2f2f2;color:#888;font-size:10px}.description{margin-top:10px;padding-top:9px;border-top:1px solid #eee;color:#777;font-size:11px;line-height:1.7}.description b{display:block;color:#555;margin-bottom:4px}.side-card{padding:12px}.side-heading{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.side-heading span{font-size:9px;color:#078acb;font-weight:700;letter-spacing:.1em}.side-heading h2{margin:2px 0 0;color:#444;font-size:16px}.side-heading em{font-style:normal;color:#078acb;font-size:11px}.side-list{display:flex;flex-direction:column;gap:6px}.side-item{display:flex;gap:8px;padding:5px;text-decoration:none}.side-item:hover{background:#f5f9fc}.side-thumb{flex:0 0 105px;height:62px;overflow:hidden;background:#eee}.side-thumb img{width:100%;height:100%;object-fit:cover}.side-item strong{display:-webkit-box;overflow:hidden;color:#555;font-size:11px;line-height:1.4;-webkit-line-clamp:2;-webkit-box-orient:vertical}.side-item small{display:block;margin-top:5px;color:#999;font-size:9px}.side-empty,.recommend-empty,.empty{padding:35px;text-align:center;color:#999;font-size:12px}.recommend-section{margin-top:14px;border:1px solid #e5e5e5;background:#fff}.section-bar{height:45px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;background:#078acb;color:#fff}.section-bar h2{margin:2px 0 0;font-size:14px}.section-bar small{font-size:8px;color:#dff5ff}.section-bar span{font-size:10px}.video-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;padding:6px}@media(max-width:800px){.play-layout{display:block}.side-panel{margin-top:10px}.page-shell{width:100%}.video-info-card{margin-top:6px}.video-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>