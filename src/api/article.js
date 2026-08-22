import { request, ART_API_BASE } from './client'

const OLD_IMAGE_HOST = /https?:\/\/tu\.fhpicpic\.com/gi
const NEW_IMAGE_HOST = 'https://mei.lbpictupian.com'

export const getArticleCategories = () => request({ ac: 'list' }, ART_API_BASE)
export const getArticles = (params = {}) => request({ ac: 'list', pg: 1, limit: 20, ...params }, ART_API_BASE)
export const getArticlesByCategory = (tid, page = 1, limit = 20) => request({ ac: 'list', t: tid, pg: page, limit }, ART_API_BASE)
export const getArticleDetail = id => request({ ac: 'detail', ids: id }, ART_API_BASE)
export const searchArticles = (wd, page = 1) => request({ ac: 'list', wd, pg: page, limit: 20 }, ART_API_BASE)

export function replaceArticleImageHost(value) {
  if (!value) return ''
  return String(value).replace(OLD_IMAGE_HOST, NEW_IMAGE_HOST)
}

export function normalizeArticles(res) {
  const list = Array.isArray(res?.list) ? res.list : Array.isArray(res?.data) ? res.data : []
  return list.map(item => ({
    ...item,
    art_pic: replaceArticleImageHost(item?.art_pic),
    art_content: replaceArticleImageHost(item?.art_content),
  }))
}

export function articleItem(res) {
  return normalizeArticles(res)[0] || null
}

export function articleTitle(item) {
  return item?.art_name || item?.title || item?.name || '未命名文章'
}

export function articlePic(item) {
  return replaceArticleImageHost(item?.art_pic || item?.art_pic_thumb || item?.pic || item?.image || '')
}

export function articleContent(item) {
  return replaceArticleImageHost(item?.art_content || item?.content || item?.art_blurb || item?.description || '')
}

export function articleCategoryId(item) {
  return Number(item?.type_id || item?.art_type_id || item?.category_id || 0)
}
