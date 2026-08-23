<template>
  <header class="site-header">
    <div class="top-menu">
      <div class="brand-row"><div class="brand-inner"><router-link :to="site.routes.home" class="brand">{{ site.name }}</router-link></div></div>
      <div class="header-search"><form @submit.prevent="search"><input v-model="keyword" type="search" placeholder="请输入想输入影片的名称" aria-label="搜索影片" /><button type="submit">搜索影片</button></form></div>
      <nav v-for="row in menu.rows" :key="row.title" class="menu-row" :class="`menu-${row.type}`" :aria-label="row.title">
        <router-link class="group-title" :to="row.to">{{ row.title }}</router-link>
        <router-link v-for="item in row.items" :key="item.id" class="menu-item" :to="itemLink(row, item)">{{ item.name }}</router-link>
      </nav>
      <section v-if="links.length" class="header-links" aria-label="友情链接"><div class="header-links-inner"><div class="links-title"><span class="links-dot"></span><span>友情链接</span></div><div class="links-list"><a v-for="item in links" :key="item.url" :href="item.url" target="_blank" rel="noopener noreferrer" class="friend-link">{{ item.name }}</a></div></div></section>
    </div>
  </header>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import menu from '../config/menu.json'
import site from '../config/site'
const router=useRouter(),keyword=ref(''),links=ref([])
function search(){const wd=keyword.value.trim();if(wd)router.push({path:site.routes.search,query:{wd}})}
function itemLink(row,item){if(row.type==='image')return site.routes.imageList.replace(':id',item.id);if(row.type==='novel')return site.routes.novelList.replace(':id',item.id);return site.routes.category.replace(':id',item.id)}
function normalizeHost(hostname){return String(hostname||'').trim().toLowerCase().replace(/\.$/,'').split(':')[0]}
function findLinks(config,hostname){const host=normalizeHost(hostname);if(!host)return[];if(Array.isArray(config[host]))return config[host];const withoutWww=host.replace(/^www\./,'');if(Array.isArray(config[withoutWww]))return config[withoutWww];const parts=withoutWww.split('.');for(let i=1;i<parts.length-1;i++){const parentDomain=parts.slice(i).join('.');if(Array.isArray(config[parentDomain]))return config[parentDomain]}return[]}
function loadLinks(){try{links.value=findLinks(__FRIEND_LINKS__,window.location.hostname)}catch(error){console.error('[Header] 友情链接加载失败:',error);links.value=[]}}
onMounted(loadLinks)
</script>
<style scoped>
.menu-row{font-size:18px;font-weight:700}
.menu-row .group-title,.menu-row .menu-item{font-size:18px;font-weight:700}
.header-search{width:100%;padding:10px 0;background:#fff;border-bottom:1px solid #d8d8d8}.header-search form{display:flex;max-width:680px;margin:0 auto;padding:0 12px}.header-search input{flex:1;min-width:0;height:38px;padding:0 12px;border:1px solid #ccc;border-right:0;border-radius:3px 0 0 3px;outline:none;font-size:15px;background:#fff}.header-search input:focus{border-color:#078acb}.header-search button{height:38px;padding:0 22px;border:1px solid #078acb;border-radius:0 3px 3px 0;background:#078acb;color:#fff;font-size:15px;cursor:pointer}.header-search button:hover{background:#067caf}
.header-links{width:100%;background:#fff;border-top:1px solid #d8d8d8;border-bottom:1px solid #d8d8d8}.header-links-inner{width:100%;min-height:42px;display:flex;align-items:stretch;background:#f5f5f5}.links-title{width:86px;min-width:86px;display:flex;align-items:center;justify-content:center;gap:5px;padding:0 5px;background:#078acb;color:#fff;font-size:16px;font-weight:700;border-right:1px solid #d8d8d8}.links-dot{width:6px;height:6px;border-radius:50%;background:#fff}.links-list{flex:1;min-width:0;display:flex;align-items:stretch;flex-wrap:wrap}.friend-link{min-height:42px;display:flex;align-items:center;justify-content:center;padding:0 12px;color:#666;background:#f5f5f5;border-right:1px solid #ddd;font-size:16px;white-space:nowrap;transition:background .15s,color .15s}.friend-link:hover{background:#e8f5fb;color:#078acb}@media(max-width:760px){.header-search{padding:8px 0}.header-search form{padding:0 8px}.header-search input,.header-search button{height:36px}.header-search button{padding:0 14px}.header-links-inner{min-height:0;display:block}.links-title{width:100%;min-width:0;height:38px;justify-content:flex-start;padding:0 12px;font-size:16px}.links-list{display:grid;grid-template-columns:repeat(4,minmax(0,1fr))}.friend-link{min-width:0;min-height:36px;padding:0 4px;overflow:hidden;text-overflow:ellipsis;font-size:15px;border-bottom:1px solid #ddd}}
</style>
