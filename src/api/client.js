import axios from 'axios'

// Always call the same-origin proxy in the browser. The upstream API is kept
// server-side by Vite (development) / the deployed reverse proxy (production),
// so the browser never sends a cross-origin request to lbapi9.com.
export const API_BASE = import.meta.env.VITE_API_BASE || '/api'
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
