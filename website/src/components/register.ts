import { App } from 'vue'
import Input from './Input.vue'
import Button from './Button.vue'
import User from './User.vue'
import Card from './Card.vue'
import Hands from './Hands.vue'
import Effect from './Effect.vue'
import Shortcuts from './Shortcuts.vue'

export const register = function (app: App) {
    app.component('Button', Button)
    app.component('Input', Input)
    app.component('User', User)
    app.component('Card', Card)
    app.component('Hands', Hands)
    app.component('Effect', Effect)
    app.component('Shortcuts', Shortcuts)
}