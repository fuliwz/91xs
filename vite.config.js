import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({ plugins:[vue()], server:{ proxy:{ '/api':{ target:'https://155api.com', changeOrigin:true, rewrite:p=>p.replace(/^\/api/,'/api.php/provide/vod') }}}})
