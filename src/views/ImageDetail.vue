<template>
  <section>
    <div class="title"><h1>{{ title }}</h1></div>
    <article class="article-content" v-if="item" v-html="content"></article>
    <div v-else class="empty">正在加载...</div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getArticleDetail, articleItem, articleTitle, articleContent } from '../api/article'

const route = useRoute()
const item = ref(null)
const title = computed(() => item.value ? articleTitle(item.value) : '图片详情')
const content = computed(() => articleContent(item.value))

onMounted(async () => {
  try { item.value = articleItem(await getArticleDetail(route.params.id)) } catch { item.value = null }
})
</script>
