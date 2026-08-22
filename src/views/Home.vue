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
      <div class="section-blue">福利图片</div>
      <div class="article-grid" v-if="images.length">
        <ArticleCard
          v-for="item in images"
          :key="item.id"
          :title="item.title"
          :pic="item.pic"
          :to="`/image/${item.id}`"
        />
      </div>
      <div v-else-if="!articleLoading" class="empty">暂无图片数据</div>
      <div class="article-actions">
        <router-link :to="imageTid ? `/image?tid=${imageTid}` : '/image'">查看更多图片</router-link>
      </div>
    </section>

    <section class="portal-section article-preview novel-preview">
      <div class="section-blue">精彩小说</div>
      <div class="novel-list" v-if="novels.length">
        <router-link
          v-for="item in novels"
          :key="item.id"
          class="novel-row"
          :to="`/novel/${item.id}`"
        >
          <span>{{ item.title }}</span>
          <time>{{ item.date }}</time>
        </router-link>
      </div>
      <div v-else-if="!articleLoading" class="empty">暂无小说数据</div>
      <div class="article-actions">
        <router-link :to="novelTid ? `/novel?tid=${novelTid}` : '/novel'">进入小说专区</router-link>
      </div>
    </section>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getVideos, normalizeList } from '../api/vod'
import { getArticlesByCategory, normalizeArticles, articleTitle, articlePic } from '../api/article'
import ArticleCard from '../components/ArticleCard.vue'

const router = useRouter()
const keyword = ref('')
const latest = ref([])
const hot = ref([])
const images = ref([])
const novels = ref([])
const imageTid = ref(0)
const novelTid = ref(0)
const loading = ref(true)
const articleLoading = ref(true)

const IMAGE_TIDS = [25, 26, 27, 28, 29, 30, 31, 32]
const NOVEL_TIDS = [17, 18, 19, 20, 21, 22, 23, 24]

const randomTid = list => list[Math.floor(Math.random() * list.length)]

function search() {
  if (keyword.value.trim()) router.push({ path: '/search', query: { wd: keyword.value.trim() } })
}

function normalizeItems(res, type) {
  return normalizeArticles(res).map((item, index) => ({
    id: item.art_id || item.id || `${type}-${index}`,
    title: articleTitle(item),
    pic: articlePic(item),
    date: item.art_time || item.time || item.create_time || item.art_time_text || '',
  }))
}

async function loadArticles() {
  articleLoading.value = true
  imageTid.value = randomTid(IMAGE_TIDS)
  novelTid.value = randomTid(NOVEL_TIDS)

  const [imageRes, novelRes] = await Promise.allSettled([
    getArticlesByCategory(imageTid.value, 1, 8),
    getArticlesByCategory(novelTid.value, 1, 10),
  ])

  if (imageRes.status === 'fulfilled') images.value = normalizeItems(imageRes.value, 'image')
  if (novelRes.status === 'fulfilled') novels.value = normalizeItems(novelRes.value, 'novel')
  articleLoading.value = false
}

onMounted(async () => {
  try {
    const [latestRes, hotRes] = await Promise.allSettled([
      getVideos({ pg: 1, limit: 24 }),
      getVideos({ pg: 2, limit: 12 }),
    ])
    if (latestRes.status === 'fulfilled') latest.value = normalizeList(latestRes.value)
    if (hotRes.status === 'fulfilled') hot.value = normalizeList(hotRes.value)
    await loadArticles()
  } finally {
    loading.value = false
  }
})
</script>
