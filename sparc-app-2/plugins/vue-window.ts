import vuetify from "../utils/vuetify";
import {useTheme} from "vuetify";
import { createPinia, defineStore, storeToRefs} from 'pinia'


export default defineNuxtPlugin((app) => {
  
  if(process.client) {

  //@ts-ignore
    import('https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js')
    // get full Vue instance rather than nuxt vue instance
    import('vue').then((vue) => {
        (window as any).Vue = vue;
      });
    (window as any).Vuetify = vuetify;
    (window as any).useTheme = useTheme;
    (window as any).defineStore = defineStore;
    (window as any).storeToRefs = storeToRefs;
  }
   app.vueApp.use(vuetify);
})
