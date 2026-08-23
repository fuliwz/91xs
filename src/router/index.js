import site from '../config/site'

const Home = () => import('../views/Home.vue')
const Category = () => import('../views/Category.vue')
const Search = () => import('../views/Search.vue')
const Detail = () => import('../views/Detail.vue')
const Play = () => import('../views/Play.vue')
const History = () => import('../views/History.vue')
const Image = () => import('../views/Image.vue')
const ImageDetail = () => import('../views/ImageDetail.vue')
const Novel = () => import('../views/Novel.vue')
const NovelDetail = () => import('../views/NovelDetail.vue')

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
