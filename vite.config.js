import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import path from 'node:path'

function loadFriendLinks() {
  const file = path.resolve(process.cwd(), 'public/links.js')
  try {
    const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').trim()
    return JSON.parse(text)
  } catch (error) {
    console.warn('[vite] 无法读取 public/links.js:', error)
    return {}
  }
}

const friendLinks = loadFriendLinks()

export default defineConfig({
  plugins: [vue()],
  define: {
    __FRIEND_LINKS__: JSON.stringify(friendLinks),
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://lbapi9.com',
        changeOrigin: true,
        rewrite: p => p.replace(/^\/api\/?/, '/api.php/provide/vod'),
      },
    },
  },
})
