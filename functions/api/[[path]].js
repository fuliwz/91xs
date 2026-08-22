export async function onRequest(context) {
  const incoming = new URL(context.request.url)
  const route = Array.isArray(context.params?.path) ? context.params.path.join('/') : String(context.params?.path || '')
  const isArticle = route === 'art' || route.startsWith('art/')
  const upstream = new URL(isArticle ? 'https://lbapi9.com/api.php/provide/art/' : 'https://lbapi9.com/api.php/provide/vod/')

  for (const [key, value] of incoming.searchParams) upstream.searchParams.set(key, value)
  if (!upstream.searchParams.has('at')) upstream.searchParams.set('at', 'json')

  const response = await fetch(upstream.toString(), {
    headers: { 'User-Agent': '91XS-Vue-API-Proxy' },
  })
  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS')
  headers.set('Cache-Control', 'public, max-age=60')
  return new Response(response.body, { status: response.status, headers })
}
