<template>
  <section>
    <div class="title"><h1>图片专区</h1><span>{{ items.length }} 条</span></div>
    <div class="article-grid">
      <ArticleCard v-for="item in items" :key="item.id" :title="item.title" :pic="item.pic" :to="`/image/${item.id}`" />
    </div>
    <div v-if="loading" class="empty">正在加载...</div>
    <div v-else-if="!items.length" class="empty">暂无图片文章</div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getArticles, normalizeArticles, articleTitle, articlePic } from '../api/article'
import ArticleCard from '../components/ArticleCard.vue'

const items = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getArticles({ pg: 1, limit: 40 })
    items.value = normalizeArticles(res).map((item, index) => ({
      id: item.art_id || item.id || index,
      title: articleTitle(item),
      pic: articlePic(item),
    }))
  } finally { loading.value = false }
})
</script>
