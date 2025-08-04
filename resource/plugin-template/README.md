# Plugin Template

## Environment
- Node.js: 16, 18, 20, 22
- Vue: 3.0.0+
- Vite: 4.2.0+
- Yarn or Npm
## Setup
```sh
yarn 
yarn build
```

## Build config template `vite.config.ts`

You can continue development as usual without any special setup. However, when it's time to build the plugin, you'll need to add some specific configurations in vite.config.ts to ensure everything compiles correctly.

What you need to notice is:
- `replaceNamedImportsFromGlobals`: This tells the plugin which named functions should be replaced with the ones provided by the main app.

- `build.lib.name`: This is the global variable name that will be exposed to the main app when using the UMD build.

- `rollupOptions.external`: Specifies which dependencies should not be bundled and are expected to be provided by the main app.

- `rollpOptions.output.globals`: Defines the global variable names that the main app uses to expose these external packages.

```ts
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
```