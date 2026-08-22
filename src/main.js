import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import routes from './router'
import site from './config/site'
import './assets/style.css'

const router=createRouter({history:createWebHistory(),routes,scrollBehavior:()=>({top:0})})

router.afterEach((to) => {
  const page = to.meta?.titleKey || 'home'
  const suffix = typeof to.meta?.title === 'string' ? to.meta.title : ''
  document.title = site.getTitle(page, suffix)
})

document.title = site.title
createApp(App).use(router).mount('#app')
