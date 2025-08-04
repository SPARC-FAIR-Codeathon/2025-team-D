// import { createApp } from 'vue'

// // Vuetify
// import 'vuetify/styles'
// import { createVuetify } from 'vuetify'
// import * as components from 'vuetify/components'
// import * as directives from 'vuetify/directives'

// // Components
// import App from './App.vue'

// const vuetify = createVuetify({
//   components,
//   directives,
// })

// createApp(App).use(vuetify).mount('#app')
import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'

const app = createApp(App)
app.use(createPinia())
app.use(createVuetify({ components, directives }))
app.mount('#app')
