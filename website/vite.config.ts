import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '/@': pathResolve('src'),
      'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js'
    }
  }
})

function pathResolve (dir: string): any {
  return resolve(__dirname, '.', dir)
}