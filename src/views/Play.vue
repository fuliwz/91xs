<template>
  <main class="play-page">
    <div v-if="v" class="play-shell">
      <section class="player-section">
        <div class="player-head"><span class="status-dot"></span><strong>正在播放</strong><span class="player-tip">高清在线播放 · HLS</span></div>
        <div class="player-wrap">
          <video ref="videoEl" class="player-video" controls playsinline preload="metadata" :poster="v.vod_pic || ''"></video>
          <div v-if="playerMessage" class="player-state">{{ playerMessage }}</div>
        </div>
      </section>

      <section class="video-info">
        <div class="info-main">
          <div class="kicker">NOW PLAYING</div>
          <h1>{{ v.vod_name }}</h1>
          <div class="meta"><span v-if="v.type_name">{{ v.type_name }}</span><span v-if="v.vod_time">{{ v.vod_time }}</span><span v-if="v.vod_hits">{{ v.vod_hits }} 次播放</span></div>
          <p v-if="v.vod_blurb || v.vod_content">{{ v.vod_blurb || v.vod_content }}</p>
        </div>
        <button class="share" type="button" @click="share">分享</button>
      </section>

      <section class="recommend">
        <div class="section-title"><div><small>MORE FOR YOU</small><h2>相关推荐</h2></div><span>{{ recommend.length }} 部</span></div>
        <div v-if="recommend.length" class="recommend-grid"><VideoCard v-for="item in recommend" :key="item.vod_id" :item="item" /></div>
        <div v-else class="recommend-empty">暂无同分类相关推荐</div>
      </section>
    </div>
    <div v-else class="empty">正在加载视频…</div>
  </main>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import Hls from 'hls.js'
import { getDetail, getCategoryVideos, detailItem, playSources } from '../api/vod'
import VideoCard from '../components/VideoCard.vue'

const route=useRoute(), v=ref(null), recommend=ref([]), videoEl=ref(null), playerMessage=ref('')
let hls=null, mediaError=null, stopped=false

function destroyPlayer(){
  hls?.destroy(); hls=null
  if(videoEl.value && mediaError) videoEl.value.removeEventListener('error',mediaError)
  mediaError=null
  if(videoEl.value){videoEl.value.pause();videoEl.value.removeAttribute('src');videoEl.value.load()}
}
function normalizeUrl(url){const s=String(url||'').trim();return s.startsWith('//')?`https:${s}`:s}
function mountPlayer(item){
  destroyPlayer()
  const source=normalizeUrl(playSources(item)[0]?.url)
  if(!videoEl.value||!source){playerMessage.value='暂无可播放源';return}
  playerMessage.value='正在连接播放源…'
  mediaError=()=>{playerMessage.value='视频播放失败，请检查播放源'}
  videoEl.value.addEventListener('error',mediaError)
  const isHls=/\.m3u8(?:$|[?#])/i.test(source)
  if(isHls&&Hls.isSupported()){
    hls=new Hls({enableWorker:true,lowLatencyMode:false,backBufferLength:90,maxBufferLength:30})
    hls.on(Hls.Events.MEDIA_ATTACHED,()=>hls?.loadSource(source))
    hls.on(Hls.Events.MANIFEST_PARSED,()=>{playerMessage.value=''})
    hls.on(Hls.Events.ERROR,(_,data)=>{
      if(!data?.fatal)return
      if(data.type===Hls.ErrorTypes.MEDIA_ERROR)hls?.recoverMediaError()
      else if(data.type===Hls.ErrorTypes.NETWORK_ERROR){playerMessage.value='播放源网络请求失败';setTimeout(()=>hls?.startLoad(),800)}
      else playerMessage.value='播放源加载失败，请更换视频'
    })
    hls.attachMedia(videoEl.value)
  }else{
    videoEl.value.src=source
    videoEl.value.addEventListener('loadedmetadata',()=>{playerMessage.value=''},{once:true})
    videoEl.value.load()
  }
}
async function load(){
  stopped=false;v.value=null;recommend.value=[];playerMessage.value='正在加载视频…';destroyPlayer()
  const id=route.params.id;if(!id)return
  try{
    const item=detailItem(await getDetail(id));if(stopped)return
    if(!item){playerMessage.value='未找到该视频';return}
    v.value=item
    mountPlayer(item)
    if(item.vod_id){const h=JSON.parse(localStorage.getItem('history')||'[]').filter(x=>String(x.id)!==String(item.vod_id));h.unshift({id:item.vod_id,name:item.vod_name,pic:item.vod_pic,type_name:item.type_name});localStorage.setItem('history',JSON.stringify(h.slice(0,30)))}
    if(item.type_id){
      const rr=await getCategoryVideos(item.type_id,1,24)
      if(stopped)return
      recommend.value=(rr?.list||[]).filter(x=>String(x.vod_id)!==String(item.vod_id)).slice(0,8)
    }
    document.title=`${item.vod_name||'播放'} - 91XS`
  }catch(e){console.error('播放页加载失败',e);playerMessage.value='视频加载失败，请刷新重试'}
}
async function share(){try{if(navigator.share)await navigator.share({title:v.value?.vod_name||document.title,url:location.href});else{await navigator.clipboard.writeText(location.href);alert('链接已复制')}}catch{}}
watch(()=>route.params.id,load,{immediate:true})
onBeforeUnmount(()=>{stopped=true;destroyPlayer()})
</script>

<style scoped>
.play-page{padding:16px 0 36px;background:#fff}.play-shell{width:100%}.player-section{border:1px solid #e2e2e2;background:#111}.player-head{height:34px;display:flex;align-items:center;gap:7px;padding:0 10px;background:#078acb;color:#fff;font-size:12px}.status-dot{width:6px;height:6px;border-radius:50%;background:#fff}.player-tip{margin-left:auto;font-size:10px;opacity:.8}.player-wrap{position:relative;background:#111}.player-video{display:block;width:100%;aspect-ratio:16/9;background:#111}.player-state{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#aaa;background:rgba(0,0,0,.35);font-size:13px;pointer-events:none}.video-info{display:flex;justify-content:space-between;gap:20px;margin-top:8px;padding:14px;background:#fff;border:1px solid #e5e5e5}.info-main{min-width:0}.kicker{font-size:9px;color:#078acb;letter-spacing:.15em;font-weight:700}.video-info h1{margin:4px 0 8px;color:#333;font-size:20px;line-height:1.45}.meta{display:flex;gap:6px;flex-wrap:wrap}.meta span{padding:3px 7px;background:#f2f2f2;color:#888;font-size:10px}.video-info p{margin:10px 0 0;color:#777;font-size:12px;line-height:1.7}.share{align-self:flex-start;border:1px solid #ccc;background:#fafafa;color:#666;padding:6px 13px;cursor:pointer}.recommend{margin-top:14px;border:1px solid #e1e1e1;background:#fff}.section-title{height:42px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;background:#078acb;color:#fff}.section-title small{font-size:8px;opacity:.85;letter-spacing:.12em}.section-title h2{margin:1px 0 0;font-size:14px}.section-title>span{font-size:10px;opacity:.85}.recommend-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;padding:6px}.recommend-empty{padding:36px;text-align:center;color:#999}.empty{padding:60px;text-align:center;color:#999}@media(max-width:640px){.play-page{padding:8px 0 25px}.player-head{height:32px}.player-tip{display:none}.video-info{padding:10px;gap:8px}.video-info h1{font-size:17px}.video-info p{font-size:11px}.recommend-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.section-title{height:38px}}
</style>
