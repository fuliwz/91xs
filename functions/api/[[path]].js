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

  async function fetchUpstream(params) {
    const url = new URL(upstreamBase)
    for (const [key, value] of params) url.searchParams.set(key, value)
    if (!url.searchParams.has('at')) url.searchParams.set('at', 'json')
    return fetch(url.toString(), {
      headers: {
        'User-Agent': '91XS-Vue-API-Proxy',
        'Accept': 'application/json,text/plain,*/*',
      },
    })
  }

  const params = new URLSearchParams(incoming.searchParams)
  if (!params.has('at')) params.set('at', 'json')

  let response = await fetchUpstream(params)

  // The frontend intentionally asks for ac=detail because video cards need
  // full fields such as vod_pic. Some CMS mirrors do not implement detail as
  // a paginated list; in that case keep the same browser URL but transparently
  // fall back to the list endpoint server-side.
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

  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')
  headers.set('Cache-Control', 'public, max-age=60')
  headers.set('Vary', 'Origin')
  return new Response(response.body, { status: response.status, headers })
}
