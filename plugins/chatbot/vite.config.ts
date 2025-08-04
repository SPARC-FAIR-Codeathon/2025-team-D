import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import cssInjected from 'vite-plugin-css-injected-by-js'

export default defineConfig({
  plugins: [vue(), vueJsx(), cssInjected()],
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'Chatbot',
      formats: ['umd'],
      fileName: (format)=>`my-app.${format}.js`
    },
    rollupOptions: {
      external: ['vue', 'vuetify', 'pinia'],
      output: {
        globals: {
          vue: 'Vue',
          vuetify: 'Vuetify',
          pinia: 'Pinia'
        },
      },
    },
  },
});

