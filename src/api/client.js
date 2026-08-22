import axios from 'axios'
export const API_BASE = import.meta.env.VITE_API_BASE || '/api'
const http=axios.create({baseURL:API_BASE,timeout:15000,paramsSerializer:{indexes:null}})
export async function request(params={}){const {data}=await http.get('',{params:{at:'json',...params}}); if(!data) throw new Error('API empty response'); return data}
