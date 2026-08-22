export async function onRequest(context) {
  const incoming = new URL(context.request.url)
  const route = Array.isArray(context.params?.path) ? context.params.path.join('/') : String(context.params?.path || '')
  const isArticle = route === 'art' || route.startsWith('art/')
  const upstreamBase = isArticle
    ? 'https://lbapi9.com/api.php/provide/art/'
    : 'https://lbapi9.com/api.php/provide/vod/'

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (context.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders })
  if (context.request.method !== 'GET') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })

  const params = new URLSearchParams(incoming.searchParams)
  if (!params.has('at')) params.set('at', 'json')

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

  // Some VOD endpoints return an empty detail list when no ids are supplied.
  // Fall back to list only in that specific case.
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

  // Rewrite article image hosts before caching. This ensures every subsequent
  // visitor receives the already-correct image domain without another rewrite.
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
          if (value && typeof value === 'object') {
            return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, rewrite(val)]))
          }
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

  // Store only successful responses. stale-while-revalidate lets browsers and
  // intermediate caches continue using a recent response while it refreshes.
  await cache.put(cacheRequest, finalResponse.clone())
  return finalResponse
}
