<template>
  <section>
    <div class="title"><h1>小说专区</h1><span>{{ items.length }} 条</span></div>
    <div class="novel-list">
      <router-link v-for="item in items" :key="item.id" class="novel-row" :to="`/novel/${item.id}`">
        <span>{{ item.title }}</span><time>{{ item.date }}</time>
      </router-link>
    </div>
    <div v-if="loading" class="empty">正在加载...</div>
    <div v-else-if="!items.length" class="empty">暂无小说</div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getArticles, normalizeArticles, articleTitle } from '../api/article'

const items = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getArticles({ pg: 1, limit: 60 })
    items.value = normalizeArticles(res).map((item, index) => ({
      id: item.art_id || item.id || index,
      title: articleTitle(item),
      date: item.art_time || item.time || item.create_time || '',
    }))
  } finally { loading.value = false }
})
</script>
