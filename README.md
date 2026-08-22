# 91XS Portal Vue

Vue 3 + Vite portal-style frontend rebuilt around the supplied reference layout.

## Data sources

- Video API: `https://155api.com/api.php/provide/vod/`
- Article API: `https://155api.com/api.php/provide/art/`
- Cloudflare Pages Functions proxy: `/api/vod/*` and `/api/art/*`

## Pages

- `/` portal home with blue header, multi-row category menu and four-column video grid
- `/category/:id` video category
- `/search` video search
- `/detail/:id` video detail
- `/play/:id` HLS playback
- `/image` article/image gallery
- `/image/:id` article/image detail
- `/novel` article-backed novel list
- `/novel/:id` novel detail
- `/history` local viewing history

## Development

```bash
npm install
npm run dev
npm run build
```
