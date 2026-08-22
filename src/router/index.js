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

export default [
  { path: '/', component: Home },
  { path: '/category/:id', component: Category },
  { path: '/search', component: Search },
  { path: '/detail/:id', component: Detail },
  { path: '/play/:id', component: Play },
  { path: '/history', component: History },
  { path: '/image', component: Image },
  { path: '/image/:id', component: ImageDetail },
  { path: '/novel', component: Novel },
  { path: '/novel/:id', component: NovelDetail },
]
