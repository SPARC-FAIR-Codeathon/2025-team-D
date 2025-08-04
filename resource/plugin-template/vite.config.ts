import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import cssInjected from 'vite-plugin-css-injected-by-js';
import { replaceNamedImportsFromGlobals } from './vite-plugin-replace-imports';

export default defineConfig({
  plugins: [vue(), vueJsx(), cssInjected(),
    replaceNamedImportsFromGlobals({
      pinia: ['defineStore'],
      vuetify: ['useTheme']
    })
  ],
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'MyApp',
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

