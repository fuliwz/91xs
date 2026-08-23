<template>
  <header class="site-header">
    <div class="top-menu">
      <div class="brand-row">
        <div class="brand-inner">
          <router-link :to="site.routes.home" class="brand">{{ site.name }}</router-link>
        </div>
      </div>

      <nav
        v-for="row in menu.rows"
        :key="row.title"
        class="menu-row"
        :class="`menu-${row.type}`"
        :aria-label="row.title"
      >
        <router-link class="group-title" :to="row.to">{{ row.title }}</router-link>
        <router-link
          v-for="item in row.items"
          :key="item.id"
          class="menu-item"
          :to="itemLink(row, item)"
        >{{ item.name }}</router-link>
      </nav>
    </div>
  </header>

  <section v-if="links.length" class="header-links" aria-label="友情链接">
    <div class="header-links-inner">
      <span class="links-title">友情链接</span>
      <a
        v-for="item in links"
        :key="item.url"
        :href="item.url"
        target="_blank"
        rel="noopener noreferrer"
      >{{ item.name }}</a>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import menu from '../config/menu.json'
import site from '../config/site'

const links = ref([])

function itemLink(row, item) {
  if (row.type === 'image') return `${site.routes.image}?tid=${item.id}`
  if (row.type === 'novel') return `${site.routes.novel}?tid=${item.id}`
  return site.routes.category.replace(':id', item.id)
}

function normalizeHost(hostname) {
  return String(hostname || '').trim().toLowerCase().replace(/\.$/, '').split(':')[0]
}

function findLinks(config, hostname) {
  const host = normalizeHost(hostname)
  if (!host) return []
  if (Array.isArray(config[host])) return config[host]
  const withoutWww = host.replace(/^www\./, '')
  if (Array.isArray(config[withoutWww])) return config[withoutWww]
  const parts = withoutWww.split('.')
  for (let i = 1; i < parts.length - 1; i++) {
    const parentDomain = parts.slice(i).join('.')
    if (Array.isArray(config[parentDomain])) return config[parentDomain]
  }
  return []
}

function loadLinks() {
  try {
    links.value = findLinks(__FRIEND_LINKS__, window.location.hostname)
  } catch (error) {
    console.error('[Header] 友情链接加载失败:', error)
    links.value = []
  }
}

onMounted(loadLinks)
</script>

<style scoped>
.site-header{position:sticky;top:0;z-index:1000}
.header-links{border-bottom:1px solid rgba(255,255,255,.06);background:rgba(17,17,23,.94)}
.header-links-inner{max-width:1200px;margin:0 auto;min-height:42px;padding:0 16px;display:flex;align-items:center;gap:8px 18px;overflow-x:auto;white-space:nowrap}
.links-title{color:#888;font-size:12px;font-weight:700;flex:0 0 auto}
.header-links a{color:#aaa;text-decoration:none;font-size:12px;transition:color .2s}
.header-links a:hover{color:#ff4d73}
</style>
