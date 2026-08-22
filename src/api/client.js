import axios from 'axios'

// All API groups use same-origin endpoints. The browser never talks directly
// to an upstream API host, which keeps CORS out of the frontend completely.
export const API_BASE = import.meta.env.VITE_API_BASE || '/api/vod'
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
  const { data } = await getClient(baseURL).get('', {
    params: { at: 'json', ...params },
  })
  if (!data) throw new Error('API empty response')
  return data
}
