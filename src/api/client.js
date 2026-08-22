import axios from 'axios'
import site from '../config/site'

// Browser requests must always stay same-origin. Do not allow a production
// environment variable to turn this into a direct cross-origin API request.
export const API_BASE = site.api.vod
export const ART_API_BASE = site.api.article

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
