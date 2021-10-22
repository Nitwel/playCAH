import { createApp } from 'vue'
import VueSocketIOExt from 'vue-socket.io-extended';
import App from './App.vue'
import {socket} from './setup'
import {store, key} from './store'
import router from './router'
import { createI18n } from 'vue-i18n'
import deDEBase from './lang/de-DE.json'
import { register } from './components/register';
import 'element-plus/dist/index.css'
import {ElButton, ElInput, ElInputNumber, ElOption, ElSelect, ElDrawer, ElTag, ElForm, ElFormItem, ElCard, ElCheckbox} from 'element-plus'


export const i18n = createI18n({
    locale: 'de-DE',
    messages: {
        'de-DE': deDEBase
    }
})

const app = createApp(App)

register(app)
app.use(i18n)
app.use(VueSocketIOExt, socket, {store})
app.use(router)
app.use(store, key)

for(const el of [ElButton, ElInput, ElSelect, ElOption, ElInputNumber, ElDrawer, ElTag, ElForm, ElFormItem, ElCard, ElCheckbox]) {
    app.component(el.name, el)
}

app.mount('#app')
