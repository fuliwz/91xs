import { request, API_BASE } from './client'

const cache = new Map()
async function cached(key, fn) {
  if (cache.has(key)) return cache.get(key)
  const p = fn().catch(error => { cache.delete(key); throw error })
  cache.set(key, p)
  return p
}

// Video API uses the detail endpoint for video cards so fields such as
// vod_pic, vod_remarks and vod_play_url are available to the frontend.
export const getCategories = () => cached('vod-cats', () => request({ ac: 'list', pg: 1, limit: 100 }, API_BASE))
export const getVideos = (params = {}) => request({ ac: 'detail', pg: 1, limit: 24, ...params }, API_BASE)
export const getCategoryVideos = (tid, page = 1, limit = 24) => request({ ac: 'detail', t: tid, pg: Math.max(1, Number(page) || 1), limit }, API_BASE)
export const searchVideos = (wd, page = 1, limit = 24) => request({ ac: 'detail', wd: String(wd || '').trim(), pg: Math.max(1, Number(page) || 1), limit }, API_BASE)
export const getDetail = id => request({ ac: 'detail', ids: id }, API_BASE)

export function normalizeList(res) {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.list)) return res.list
  if (Array.isArray(res?.data?.list)) return res.data.list
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.result?.list)) return res.result.list
  if (Array.isArray(res?.result)) return res.result
  return []
}

export function normalizeCats(res) {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.class)) return res.class
  if (Array.isArray(res?.data?.class)) return res.data.class
  if (Array.isArray(res?.data)) return res.data
  return []
}

export function detailItem(res) { return normalizeList(res)[0] || null }

export function secureUrl(value) {
  const source = String(value || '').trim()
  if (!source) return ''
  const cleaned = source.replace(/^['"]+|['"]+$/g, '').replace(/\\u0026/gi, '&').replace(/&amp;/gi, '&')
  if (cleaned.startsWith('//')) return `https:${cleaned}`
  if (/^http:\/\//i.test(cleaned)) return cleaned.replace(/^http:\/\//i, 'https://')
  return cleaned
}

export function playSources(v) {
  const raw = String(v?.vod_play_url || '').trim()
  if (!raw) return []
  return raw.split('$$$').flatMap(source => source.split(/[#\r\n]+/)).map(part => secureUrl(part)).filter(Boolean).map(part => {
    const idx = part.indexOf('$')
    const url = idx >= 0 ? part.slice(idx + 1) : part
    const name = idx >= 0 ? part.slice(0, idx) : '播放源'
    return { name: name || '播放源', url: secureUrl(url) }
  }).filter(item => /^https:\/\//i.test(item.url))
}

export function playUrl(v) { return playSources(v)[0]?.url || '' }

export async function getCategoryLatest(id, limit = 12) {
  const res = await getCategoryVideos(id, 1, limit)
  return { ...res, list: normalizeList(res).slice(0, limit) }
}
