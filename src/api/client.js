import axios from 'axios'

// The production video API was moved from 155api to lbapi9.
// Keep an environment override, but use the real upstream endpoint as the
// default so a production build does not silently fall back to the old /api/vod proxy.
export const API_BASE = import.meta.env.VITE_API_BASE || 'https://lbapi9.com/api.php/provide/vod'
export const ART_API_BASE = import.meta.env.VITE_ART_API_BASE || '/api/art'

const clients = new Map()

function getClient(baseURL) {
  if (!clients.has(baseURL)) {
    clients.set(baseURL, axios.create({
      baseURL,
      timeout: 15000,
      paramsSerializer: { indexes: null },
    }))
  }
  return clients.get(baseURL)
}

export async function request(params = {}, baseURL = API_BASE) {
  const { data } = await getClient(baseURL).get('', { params: { at: 'json', ...params } })
  if (!data) throw new Error('API empty response')
  return data
}
