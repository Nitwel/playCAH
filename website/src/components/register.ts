import { App } from 'vue'
import Button from './Button.vue'
import Input from './Input.vue'

export const register = function (app: App) {
    app.component('v-button', Button)
    app.component('v-input', Input)
}