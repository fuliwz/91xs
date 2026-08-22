export async function onRequest(context) {
  const incoming = new URL(context.request.url)
  const route = Array.isArray(context.params?.path) ? context.params.path.join('/') : String(context.params?.path || '')
  const isArticle = route === 'art' || route.startsWith('art/')
  const upstreamBase = isArticle
    ? 'https://lbapi9.com/api.php/provide/art/'
    : 'https://lbapi9.com/api.php/provide/vod/'

  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  if (context.request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const params = new URLSearchParams(incoming.searchParams)
  if (!params.has('at')) params.set('at', 'json')

  // Cache the final same-origin API response at the Cloudflare edge.
  // The cache key includes the complete query string, so different pages,
  // tids, ids and search terms do not share data accidentally.
  const cache = caches.default
  const cacheUrl = new URL(incoming)
  cacheUrl.search = params.toString()
  const cacheRequest = new Request(cacheUrl.toString(), { method: 'GET' })
  const cached = await cache.match(cacheRequest)
  if (cached) {
    return cached
  }

  async function fetchUpstream(queryParams) {
    const url = new URL(upstreamBase)
    for (const [key, value] of queryParams) url.searchParams.set(key, value)
    if (!url.searchParams.has('at')) url.searchParams.set('at', 'json')
    return fetch(url.toString(), {
      headers: {
        'User-Agent': '91XS-Vue-API-Proxy',
        'Accept': 'application/json,text/plain,*/*',
      },
      // Let Cloudflare reuse the upstream response while the Pages
      // Functions cache is being populated.
      cf: {
        cacheEverything: true,
        cacheTtl: 300,
      },
    })
  }

  let response = await fetchUpstream(params)

  if (!isArticle && params.get('ac') === 'detail' && !params.has('ids') && response.ok) {
    try {
      const probe = await response.clone().json()
      const list = Array.isArray(probe?.list)
        ? probe.list
        : Array.isArray(probe?.data?.list)
          ? probe.data.list
          : Array.isArray(probe?.data)
            ? probe.data
            : []
      if (!list.length) {
        const fallback = new URLSearchParams(params)
        fallback.set('ac', 'list')
        response = await fetchUpstream(fallback)
      }
    } catch {
      // Preserve the original upstream response if it is not JSON.
    }
  }

  // Article image URLs are supplied by the upstream API. Rewrite them after
  // the upstream JSON is loaded, before the browser receives the response.
  if (isArticle && response.ok) {
    try {
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json') || contentType.includes('text/json')) {
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

        const rewritten = rewrite(payload)
        const headers = new Headers(response.headers)
        headers.set('Content-Type', 'application/json; charset=utf-8')
        headers.set('Access-Control-Allow-Origin', '*')
        headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS')
        headers.set('Access-Control-Allow-Headers', 'Content-Type')
        headers.set('Cache-Control', 'public, max-age=60, s-maxage=300')
        headers.set('Vary', 'Origin')
        const finalResponse = new Response(JSON.stringify(rewritten), {
          status: response.status,
          headers,
        })
        await cache.put(cacheRequest, finalResponse.clone())
        return finalResponse
      }
    } catch {
      // Fall through and return the upstream response unchanged if rewriting
      // cannot be performed.
    }
  }

  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')
  headers.set('Cache-Control', 'public, max-age=60, s-maxage=300')
  headers.set('Vary', 'Origin')
  const finalResponse = new Response(response.body, { status: response.status, headers })

  if (response.ok) {
    await cache.put(cacheRequest, finalResponse.clone())
  }

  return finalResponse
}
