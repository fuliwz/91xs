export async function onRequest(context) {
  const incoming = new URL(context.request.url)
  const route = Array.isArray(context.params?.path) ? context.params.path.join('/') : String(context.params?.path || '')
  const isArticle = route === 'art' || route.startsWith('art/')
  const isVod = route === 'vod' || route.startsWith('vod/')

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (context.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders })
  if (context.request.method !== 'GET') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
  if (!isArticle && !isVod) return new Response('Not Found', { status: 404, headers: corsHeaders })

  const params = new URLSearchParams(incoming.searchParams)
  if (!params.has('at')) params.set('at', 'json')

  // Keep public proxy requests bounded so arbitrary callers cannot turn the
  // Pages Function into an unbounded upstream API relay.
  const page = Number(params.get('pg') || 1)
  const limit = Number(params.get('limit') || 24)
  if (!Number.isInteger(page) || page < 1 || page > 1000) return new Response('Invalid page', { status: 400, headers: corsHeaders })
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) return new Response('Invalid limit', { status: 400, headers: corsHeaders })
  params.set('pg', String(page))
  params.set('limit', String(limit))

  const wd = params.get('wd')
  if (wd !== null && wd.length > 100) return new Response('Invalid keyword', { status: 400, headers: corsHeaders })

  for (const key of ['t', 'ids']) {
    const value = params.get(key)
    if (value !== null && value.length > 200) return new Response(`Invalid ${key}`, { status: 400, headers: corsHeaders })
  }

  if (params.has('t') && !/^\d+$/.test(params.get('t'))) return new Response('Invalid category', { status: 400, headers: corsHeaders })
  if (params.has('ids') && !/^[\w,-]+$/.test(params.get('ids'))) return new Response('Invalid ids', { status: 400, headers: corsHeaders })

  const upstreamBase = isArticle
    ? 'https://lbapi9.com/api.php/provide/art/'
    : 'https://lbapi9.com/api.php/provide/vod/'

  // Normalize the cache key so parameter order does not create duplicate cache entries.
  const sorted = [...params.entries()].sort(([a], [b]) => a.localeCompare(b))
  const normalized = new URLSearchParams(sorted).toString()
  const cache = caches.default
  const cacheUrl = new URL(incoming.origin + incoming.pathname)
  cacheUrl.search = normalized
  const cacheRequest = new Request(cacheUrl.toString(), { method: 'GET' })

  const cached = await cache.match(cacheRequest)
  if (cached) {
    const hit = new Response(cached.body, cached)
    hit.headers.set('X-API-Cache', 'HIT')
    return hit
  }

  const fetchUpstream = async queryParams => {
    const url = new URL(upstreamBase)
    for (const [key, value] of queryParams) url.searchParams.set(key, value)
    return fetch(url.toString(), {
      headers: {
        'User-Agent': '91XS-Vue-API-Proxy',
        'Accept': 'application/json,text/plain,*/*',
      },
      cf: { cacheEverything: true, cacheTtl: 300 },
    })
  }

  let response = await fetchUpstream(params)

  if (!isArticle && params.get('ac') === 'detail' && !params.has('ids') && response.ok) {
    try {
      const probe = await response.clone().json()
      const list = Array.isArray(probe?.list) ? probe.list
        : Array.isArray(probe?.data?.list) ? probe.data.list
        : Array.isArray(probe?.data) ? probe.data : []
      if (!list.length) {
        const fallback = new URLSearchParams(params)
        fallback.set('ac', 'list')
        response = await fetchUpstream(fallback)
      }
    } catch {}
  }

  if (!response.ok) {
    const headers = new Headers(corsHeaders)
    headers.set('Cache-Control', 'no-store')
    headers.set('X-API-Cache', 'MISS')
    return new Response(response.body, { status: response.status, headers })
  }

  let finalResponse
  if (isArticle) {
    try {
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('json')) {
        const payload = await response.json()
        const oldHost = /https?:\/\/tu\.fhpicpic\.com/gi
        const newHost = 'https://mei.lbpictupian.com'
        const rewrite = value => {
          if (typeof value === 'string') return value.replace(oldHost, newHost)
          if (Array.isArray(value)) return value.map(rewrite)
          if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, rewrite(val)]))
          return value
        }
        finalResponse = new Response(JSON.stringify(rewrite(payload)), { status: response.status })
      }
    } catch {}
  }

  if (!finalResponse) finalResponse = new Response(response.body, { status: response.status })

  const headers = new Headers(finalResponse.headers)
  Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value))
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json; charset=utf-8')
  headers.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
  headers.set('X-API-Cache', 'MISS')
  headers.set('Vary', 'Origin')
  finalResponse = new Response(finalResponse.body, { status: finalResponse.status, headers })
  await cache.put(cacheRequest, finalResponse.clone())
  return finalResponse
}
