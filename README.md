# 155 Vue Video Template

Vue 3 + Vite + Vue Router + Axios + HLS.js.

## API
Default API: `https://155api.com/api.php/provide/vod/`.
The local Vite `/api` proxy and Cloudflare Pages Function both forward to 155API.

## Run
npm install
npm run dev

## Build
npm run build

For direct API usage set `VITE_API_BASE=https://155api.com/api.php/provide/vod/` if the deployment permits CORS. Otherwise keep `/api` and deploy the included Cloudflare Function.

The UI is an original implementation inspired by the dark, compact video-site layout requested by the user; it does not copy the source site's code or proprietary assets.
