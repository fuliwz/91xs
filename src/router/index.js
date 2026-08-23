import Home from '../views/Home.vue'
import Category from '../views/Category.vue'
import Search from '../views/Search.vue'
import Detail from '../views/Detail.vue'
import Play from '../views/Play.vue'
import History from '../views/History.vue'
import Image from '../views/Image.vue'
import ImageDetail from '../views/ImageDetail.vue'
import Novel from '../views/Novel.vue'
import NovelDetail from '../views/NovelDetail.vue'
import site from '../config/site'

export default [
  { path: site.routes.home, component: Home, meta: { titleKey: 'home' } },
  { path: site.routes.category, component: Category, meta: { titleKey: 'category' } },
  { path: site.routes.search, component: Search, meta: { titleKey: 'search' } },
  { path: site.routes.detail, component: Detail, meta: { titleKey: 'detail' } },
  { path: site.routes.play, component: Play, meta: { titleKey: 'play' } },
  { path: site.routes.history, component: History, meta: { titleKey: 'history' } },
  { path: site.routes.imageList, component: Image, meta: { titleKey: 'image' } },
  { path: site.routes.image, component: Image, meta: { titleKey: 'image' } },
  { path: site.routes.imageDetail, component: ImageDetail, meta: { titleKey: 'imageDetail' } },
  { path: site.routes.novelList, component: Novel, meta: { titleKey: 'novel' } },
  { path: site.routes.novel, component: Novel, meta: { titleKey: 'novel' } },
  { path: site.routes.novelDetail, component: NovelDetail, meta: { titleKey: 'novelDetail' } },
]
