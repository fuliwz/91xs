<template>
  <section>
    <div class="title">
      <h1>{{ categoryName ? `${categoryName} - 小说` : '小说专区' }}</h1>
      <span>{{ items.length }} 条</span>
    </div>
    <div class="novel-list">
      <router-link v-for="item in items" :key="item.id" class="novel-row" :to="`/novel/${item.id}`">
        <span>{{ item.title }}</span><time>{{ item.date }}</time>
      </router-link>
    </div>
    <Pagination :page="page" :pages="pages" @change="changePage" />
    <div v-if="loading" class="empty">正在加载...</div>
    <div v-else-if="!items.length" class="empty">暂无小说</div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getArticles, getArticlesByCategory, normalizeArticles, articleTitle } from '../api/article'
import Pagination from '../components/Pagination.vue'
import menu from '../config/menu.json'

const route = useRoute()
const router = useRouter()
const items = ref([])
const loading = ref(true)
const page = ref(Number(route.query.page || 1))
const pages = ref(1)

const novelRows = menu.rows.filter(row => row.type === 'novel')
const categoryName = computed(() => {
  const tid = Number(route.query.tid || 0)
  return novelRows.flatMap(row => row.items).find(item => Number(item.id) === tid)?.name || ''
})

async function load() {
  loading.value = true
  page.value = Number(route.query.page || 1)
  const tid = Number(route.query.tid || 0)
  try {
    const res = tid ? await getArticlesByCategory(tid, page.value, 60) : await getArticles({ pg: page.value, limit: 60 })
    items.value = normalizeArticles(res).map((item, index) => ({
      id: item.art_id || item.id || index,
      title: articleTitle(item),
      date: item.art_time || item.time || item.create_time || '',
    }))
    pages.value = Number(res.pagecount || res.page_count || 1)
  } finally { loading.value = false }
}

function changePage(n) {
  router.push({ query: { ...route.query, page: n } })
}

onMounted(load)
watch(() => [route.query.tid, route.query.page], load)
</script>
