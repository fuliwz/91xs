<template>
  <header class="site-header">
    <div class="top-menu">
      <div class="brand-row">
        <router-link to="/" class="brand">91XS</router-link>
        <span class="brand-sub">视频 · 图片 · 小说</span>
        <form class="search" @submit.prevent="go">
          <input v-model="q" placeholder="请输入影片名称" aria-label="搜索影片" />
          <button type="submit">搜索影片</button>
        </form>
      </div>

      <div v-for="(group, index) in menuGroups" :key="group.title" class="menu-row">
        <router-link class="group-title" :to="group.to">{{ group.title }}</router-link>
        <router-link v-for="item in group.items" :key="item.type_id" :to="`/category/${item.type_id}`">{{ item.type_name }}</router-link>
      </div>

      <div class="menu-row utility-row">
        <router-link class="group-title" to="/image">图片</router-link>
        <router-link to="/novel">小说</router-link>
        <router-link to="/history">观看历史</router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getCategories, normalizeCats } from '../api/vod'

const router = useRouter()
const q = ref('')
const cats = ref([])

const fallback = [
  { type_id: '1', type_name: '国产' },
  { type_id: '2', type_name: '日韩' },
  { type_id: '3', type_name: '欧美' },
  { type_id: '4', type_name: '自拍' },
  { type_id: '5', type_name: '高清' },
]

const menuGroups = computed(() => {
  const source = cats.value.length ? cats.value : fallback
  const size = Math.ceil(source.length / 3)
  return [
    { title: '视频一区', to: '/search', items: source.slice(0, size) },
    { title: '视频二区', to: '/search', items: source.slice(size, size * 2) },
    { title: '视频三区', to: '/search', items: source.slice(size * 2) },
  ].filter(group => group.items.length)
})

onMounted(async () => {
  try { cats.value = normalizeCats(await getCategories()) } catch { cats.value = [] }
})

function go() {
  const keyword = q.value.trim()
  if (keyword) router.push({ path: '/search', query: { wd: keyword } })
}
</script>
