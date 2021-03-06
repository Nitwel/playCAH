import { createRouter, createWebHashHistory, NavigationGuard, RouteRecordRaw } from 'vue-router'
import Home from './views/Home.vue'
import Lobby from './views/Lobby.vue'
import Game from './views/Game.vue'
import About from './views/About.vue'
import Admin from './views/Admin.vue'
import DeckCreator from './views/DeckCreator.vue'

import {store} from './store'

const reroute: NavigationGuard = function (to, from, next) {
    if (String(to.name) === store.state.gameState) {
        next()
    } else {
        if (['Lobby', 'Game'].includes(String(to.name)) && to.params.name) {
            store.state.lobby = to.params.name as string
        }
        next('/')
    }
}
  

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/lobby/:name',
        name: 'Lobby',
        beforeEnter: reroute,
        component: Lobby,
        props: true
  
    },
    {
        path: '/game/:name',
        name: 'Game',
        beforeEnter: reroute,
        component: Game,
        props: true
    },
    {
        path: '/deckcreator',
        name: 'DeckCreator',
        component: DeckCreator
    },
    {
        path: '/about',
        name: 'About',
        component: About
    },
    {
        path: '/admin',
        name: 'Admin',
        component: Admin
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
