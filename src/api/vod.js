import { request } from './client'

const cache = new Map()
async function cached(key, fn) {
  if (cache.has(key)) return cache.get(key)
  const p = fn().catch(error => { cache.delete(key); throw error })
  cache.set(key, p)
  return p
}

// AppleCMS provide/vod listing uses ac=list. Detail requests use ac=detail.
export const getCategories = () => cached('cats', () => request({ ac: 'list', pg: 1, limit: 100 }))
export const getVideos = (params = {}) => request({ ac: 'list', pg: 1, limit: 24, ...params })
export const getCategoryVideos = (id, page = 1, limit = 24) => request({ ac: 'list', t: id, pg: Math.max(1, Number(page) || 1), limit })
export const searchVideos = (wd, page = 1, limit = 24) => request({ ac: 'list', wd: String(wd || '').trim(), pg: Math.max(1, Number(page) || 1), limit })
export const getDetail = id => request({ ac: 'detail', ids: id })

export function normalizeList(res) { return Array.isArray(res?.list) ? res.list : [] }
export function normalizeCats(res) { return Array.isArray(res?.class) ? res.class : [] }
export function detailItem(res) { return res?.list?.[0] || null }

export function secureUrl(value) {
  const source = String(value || '').trim()
  if (!source) return ''
  const cleaned = source
    .replace(/^['"]+|['"]+$/g, '')
    .replace(/\\u0026/gi, '&')
    .replace(/&amp;/gi, '&')
  if (cleaned.startsWith('//')) return `https:${cleaned}`
  if (/^http:\/\//i.test(cleaned)) return cleaned.replace(/^http:\/\//i, 'https://')
  return cleaned
}

function cleanSource(value) { return secureUrl(value) }

export function playSources(v) {
  const raw = String(v?.vod_play_url || '').trim()
  if (!raw) return []
  return raw
    .split('$$$')
    .flatMap(source => source.split(/[#\r\n]+/))
    .map(part => cleanSource(part))
    .filter(Boolean)
    .map(part => {
      const idx = part.indexOf('$')
      const url = idx >= 0 ? part.slice(idx + 1) : part
      const name = idx >= 0 ? part.slice(0, idx) : '播放源'
      return { name: name || '播放源', url: cleanSource(url) }
    })
    .filter(item => /^https:\/\//i.test(item.url))
}

export function playUrl(v) { return playSources(v)[0]?.url || '' }

export async function getCategoryLatest(id, limit = 12) {
  const res = await getCategoryVideos(id, 1, limit)
  return { ...res, list: normalizeList(res).slice(0, limit) }
}
