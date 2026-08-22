<template>
  <header class="site-header">
    <div class="top-menu">
      <div class="brand-row"><div class="brand-inner">
        <router-link to="/" class="brand">91XS</router-link>
        <span class="brand-sub">视频 · 图片 · 小说</span>
        <form class="header-search" @submit.prevent="go">
          <input v-model="q" placeholder="请输入影片名称" aria-label="搜索影片" />
          <button type="submit">搜索</button>
        </form>
      </div></div>
      <nav v-for="row in menu.rows" :key="row.title" class="menu-row" :class="`menu-${row.type}`" :aria-label="row.title">
        <router-link class="group-title" :to="row.to">{{ row.title }}</router-link>
        <router-link v-for="item in row.items" :key="item.id" class="menu-item" :to="itemLink(row, item)">{{ item.name }}</router-link>
      </nav>
      <div class="menu-row utility-row">
        <router-link class="group-title" to="/">首页</router-link>
        <router-link class="menu-item" to="/history">观看历史</router-link>
        <router-link class="menu-item" to="/image">图片</router-link>
        <router-link class="menu-item" to="/novel">小说</router-link>
      </div>
    </div>
  </header>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import menu from '../config/menu.json'
const router = useRouter()
const q = ref('')
function itemLink(row, item) {
  if (row.type === 'image') return `/image?tid=${item.id}`
  if (row.type === 'novel') return `/novel?tid=${item.id}`
  return `/category/${item.id}`
}
function go() {
  const keyword = q.value.trim()
  if (keyword) router.push({ path: '/search', query: { wd: keyword } })
}
</script>
