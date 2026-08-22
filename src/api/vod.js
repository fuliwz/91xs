import {request } from './client'
const cache=new Map()
async function cached(key,fn){if(cache.has(key))return cache.get(key);const p=fn().catch(e=>{cache.delete(key);throw e});cache.set(key,p);return p}
export const getCategories=()=>cached('cats',()=>request({ac:'list'}))
export const getVideos=(p={})=>request({ac:'videolist',pg:1,limit:24,...p})
export const getCategoryVideos=(id,page=1)=>request({ac:'videolist',t:id,pg:page,limit:24})
export const searchVideos=(wd,page=1)=>request({ac:'videolist',wd,pg:page,limit:24})
export const getDetail=(id)=>request({ac:'detail',ids:id})
export function normalizeList(res){return Array.isArray(res?.list)?res.list:[]}
export function normalizeCats(res){return Array.isArray(res?.class)?res.class:[]}
export function detailItem(res){return res?.list?.[0]||null}
export function playUrl(v){const raw=v?.vod_play_url||''; const first=raw.split('#')[0]||''; const idx=first.indexOf('$'); return idx>=0?first.slice(idx+1):first}
