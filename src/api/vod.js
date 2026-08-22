import { request } from './client'

const cache = new Map()
async function cached(key, fn) {
  if (cache.has(key)) return cache.get(key)
  const p = fn().catch(error => { cache.delete(key); throw error })
  cache.set(key, p)
  return p
}

// 155 API uses the AppleCMS legacy provide/vod contract.
export const getCategories = () => cached('cats', () => request({ ac: 'list', pg: 1, limit: 100 }))
export const getVideos = (params = {}) => request({ ac: 'detail', pg: 1, limit: 24, ...params })
export const getCategoryVideos = (id, page = 1, limit = 24) => request({ ac: 'detail', t: id, pg: Math.max(1, Number(page) || 1), limit })
export const searchVideos = (wd, page = 1, limit = 24) => request({ ac: 'detail', wd: String(wd || '').trim(), pg: Math.max(1, Number(page) || 1), limit })
export const getDetail = id => request({ ac: 'detail', ids: id })

export function normalizeList(res) {
  return Array.isArray(res?.list) ? res.list : []
}
export function normalizeCats(res) {
  return Array.isArray(res?.class) ? res.class : []
}
export function detailItem(res) {
  return res?.list?.[0] || null
}

function cleanSource(value) {
  return String(value || '').trim().replace(/^['"]|['"]$/g, '')
}

// Parse AppleCMS vod_play_url safely. A source can be:
//   高清$https://...m3u8
//   高清$https://...m3u8#备用$https://...m3u8
//   https://...m3u8
export function playSources(v) {
  const raw = String(v?.vod_play_url || '').trim()
  if (!raw) return []
  return raw
    .split(/\r?\n/)
    .flatMap(line => line.split('#'))
    .map(part => cleanSource(part))
    .filter(Boolean)
    .map(part => {
      const idx = part.indexOf('$')
      const url = idx >= 0 ? part.slice(idx + 1) : part
      const name = idx >= 0 ? part.slice(0, idx) : '播放源'
      return { name: name || '播放源', url: cleanSource(url) }
    })
    .filter(item => /^https?:\/\//i.test(item.url) || item.url.startsWith('//'))
}

export function playUrl(v) {
  return playSources(v)[0]?.url || ''
}

export async function getCategoryLatest(id, limit = 12) {
  const res = await getCategoryVideos(id, 1, limit)
  return { ...res, list: normalizeList(res).slice(0, limit) }
}
