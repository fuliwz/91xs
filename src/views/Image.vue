<template>
  <section>
    <div class="title">
      <h1>{{ categoryName || '图片专区' }}</h1>
      <span>共有 {{ total }} 个</span>
    </div>
    <div class="article-grid">
      <ArticleCard v-for="item in items" :key="item.id" :title="item.title" :pic="item.pic" :to="`/image/${item.id}`" />
    </div>
    <Pagination :page="page" :pages="pages" @change="changePage" />
    <div v-if="loading" class="empty">正在加载...</div>
    <div v-else-if="!items.length" class="empty">暂无图片文章</div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getArticles, getArticlesByCategory, normalizeArticles, articleTitle, articlePic } from '../api/article'
import ArticleCard from '../components/ArticleCard.vue'
import Pagination from '../components/Pagination.vue'
import menu from '../config/menu.json'

const route = useRoute()
const router = useRouter()
const items = ref([])
const loading = ref(true)
const page = ref(Number(route.query.page || 1))
const pages = ref(1)
const total = ref(0)
const imageRows = menu.rows.filter(row => row.type === 'image')
const categoryName = computed(() => {
  const tid = Number(route.query.tid || 0)
  return imageRows.flatMap(row => row.items).find(item => Number(item.id) === tid)?.name || ''
})

async function load() {
  loading.value = true
  page.value = Number(route.query.page || 1)
  const tid = Number(route.query.tid || 0)
  try {
    const res = tid ? await getArticlesByCategory(tid, page.value, 40) : await getArticles({ pg: page.value, limit: 40 })
    items.value = normalizeArticles(res).map((item, index) => ({ id: item.art_id || item.id || index, title: articleTitle(item), pic: articlePic(item) }))
    pages.value = Number(res.pagecount || res.page_count || 1)
    total.value = Number(res.total || res.totalnum || res.recordcount || res.count || res.data?.total || res.data?.totalnum || res.data?.recordcount || items.value.length || 0)
  } finally { loading.value = false }
}
function changePage(n) { router.push({ query: { ...route.query, page: n } }) }
onMounted(load)
watch(() => [route.query.tid, route.query.page], load)
</script>
