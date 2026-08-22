<template>
  <section class="portal-home">
    <div class="search-strip">
      <strong>搜索影片：</strong>
      <form @submit.prevent="search">
        <input v-model="keyword" placeholder="请输入想输入影片的名称" />
        <button>搜索影片</button>
      </form>
    </div>

    <section class="portal-section">
      <div class="section-blue"><span>⟳</span> 最近更新</div>
      <VideoGrid :items="latest" />
      <div v-if="loading" class="loading">正在加载最新内容...</div>
      <div v-else-if="!latest.length" class="empty">暂无视频数据</div>
    </section>

    <section class="portal-section compact-section">
      <div class="section-blue">热门推荐</div>
      <VideoGrid :items="hot" />
    </section>

    <section class="portal-section article-preview">
      <div class="section-blue">图片与小说</div>
      <div class="article-columns">
        <router-link v-for="item in articles" :key="item.id" class="article-link" :to="`/image/${item.id}`">
          <span>{{ item.title }}</span><time>{{ item.date }}</time>
        </router-link>
      </div>
      <div class="article-actions"><router-link to="/image">查看更多图片</router-link><router-link to="/novel">小说专区</router-link></div>
    </section>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getVideos, normalizeList } from '../api/vod'
import { getArticles, normalizeArticles, articleTitle } from '../api/article'
import VideoGrid from '../components/VideoGrid.vue'

const router = useRouter()
const keyword = ref('')
const latest = ref([])
const hot = ref([])
const articles = ref([])
const loading = ref(true)

function search() {
  if (keyword.value.trim()) router.push({ path: '/search', query: { wd: keyword.value.trim() } })
}

onMounted(async () => {
  try {
    const [latestRes, hotRes, articleRes] = await Promise.allSettled([
      getVideos({ pg: 1, limit: 24 }),
      getVideos({ pg: 2, limit: 12 }),
      getArticles({ pg: 1, limit: 8 }),
    ])
    if (latestRes.status === 'fulfilled') latest.value = normalizeList(latestRes.value)
    if (hotRes.status === 'fulfilled') hot.value = normalizeList(hotRes.value)
    if (articleRes.status === 'fulfilled') {
      articles.value = normalizeArticles(articleRes.value).map((item, index) => ({
        id: item.art_id || item.id || item.type_id || index,
        title: articleTitle(item),
        date: item.art_time || item.time || item.create_time || '',
      }))
    }
  } finally {
    loading.value = false
  }
})
</script>
