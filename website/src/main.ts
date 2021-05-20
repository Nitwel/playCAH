import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import VueSocketIOExt from 'vue-socket.io-extended';
import io from 'socket.io-client'
import App from './App.vue'
import mitt from 'mitt'
import {store} from './store'
import router from './router'
import { createI18n } from 'vue-i18n'
import deDEBase from './lang/de-DE.json'

export const socket = io("http://localhost:3001")
export const emitter = mitt()
const vuetify = createVuetify()

export const i18n = createI18n({
    locale: 'de-DE',
    messages: {
        'de-DE': deDEBase
    }
})

const app = createApp(App)

app.use(vuetify)
app.use(vuetify)
app.use(i18n)
app.use(store)
app.use(router)
app.use(VueSocketIOExt, socket, {store})
app.mount('#app')
