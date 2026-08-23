import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import routes from './router'
import site from './config/site'
import './assets/style.css'

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

function trackHistatsPageView(to) {
  if (typeof window === 'undefined') return

  const hasync = window._Hasync
  if (!Array.isArray(hasync)) return

  // Histats is initialized in index.html. For Vue SPA navigation we push a
  // fresh page URL/title after each client-side route change.
  const url = `${window.location.origin}${to.fullPath}`
  const title = document.title || site.title

  hasync.push(['Histats.track_pageview', url, title])
}

router.afterEach((to) => {
  const page = to.meta?.titleKey || 'home'
  const suffix = typeof to.meta?.title === 'string' ? to.meta.title : ''
  document.title = site.getTitle(page, suffix)

  // Give Vue the next tick so the updated document title is available to the tracker.
  queueMicrotask(() => trackHistatsPageView(to))
})

document.title = site.title
createApp(App).use(router).mount('#app')
