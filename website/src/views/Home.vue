<template>
    <div id="home">
        <div class="title">
            play CAH
            <div class="tag">Unofficial</div>
        </div>
        <User :name="name" large hide-name />
        <div class="start">
            <el-input class="name" v-model="name" placeholder="Your name..." maxlength="12" />
            <el-input
                class="lobby"
                v-if="showLobbyInput"
                v-model="lobby"
                placeholder="Enter lobby name..."
                maxlength="20"
            />
            <div class="btns">
                <router-link to="/deckcreator">
                    <el-button>Deck Creator</el-button>
                </router-link>
                <el-button v-if="!showLobbyInput" @click="resetLobby">Change Lobby</el-button>
                <el-button
                    class="join-lobby"
                    type="primary"
                    :disabled="!connected"
                    @click="onClick"
                >Join</el-button>
            </div>
        </div>
        <div class="footer">
            <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScPaRQoTIMgzjF6Bmgbi6TESD2KnfzohOG0opd9qN4BJ21YTg/viewform?usp=sf_link"
                target="_blank"
            >Give feedback</a>
            <a href="https://github.com/sponsors/Nitwel" target="_blank">Sponsor me!</a>
            <a href="disclaimer.html">Disclamer</a>
            <a href="https://github.com/Nitwel/CAH">Source Code</a>
        </div>
        <span class="version">{{ version }}</span>
    </div>
</template>

<script lang="ts">
import { computed, onMounted, ref } from 'vue'
import packageJson from '../../package.json'
import { useStore } from '../store'
import { notify, socket } from '../setup'

export default {
    name: 'Home',
    setup() {
        const store = useStore()
        const showLobbyInput = ref(true)

        const version = computed(() => 'v' + packageJson.version || '1.0.0')
        const name = computed({
            get(): string {
                return store.state.name
            },
            set(name: string) {
                store.state.name = name
            }
        })

        const lobby = computed({
            get(): string {
                return store.state.lobby
            },
            set(name: string) {
                store.state.lobby = name
            }
        })

        const connected = computed(() => store.state.connected)

        onMounted(() => {
            if (lobby.value !== '') showLobbyInput.value = false
        })

        return { showLobbyInput, version, name, lobby, connected, onClick, resetLobby }

        function onClick() {
            if (!connected.value) {
                notify("Error", "Not connected to the server.", "error")
                return
            }

            if (!name.value) {
                notify("Error", "You must provide a user name.", "error")
                return
            }

            if (!lobby.value) {
                notify("Error", "You must provide a lobby name.", "error")
                return
            }
            store.dispatch('join_lobby')
        }

        function resetLobby() {
            showLobbyInput.value = true
        }
    },
}
</script>
<style scoped lang="scss">
#home {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .title {
        font-size: 90px;
        position: relative;
        text-align: center;

        @media (max-width: 1000px) {
            font-size: 70px;
        }

        @media (max-width: 800px) {
            font-size: 50px;
        }

        .tag {
            position: absolute;
            font-size: 20px;
            top: 70%;
            right: -20px;
            background-color: var(--red);
            color: var(--white);
            padding: 2px 15px;
            border-radius: 5px;
        }

        @media (max-width: 600px) {
            .tag {
                left: 50%;
                right: unset;
                top: 100%;
                transform: translate(-50%, 0%);
            }
        }
    }

    .user {
        margin: 50px 0;

        @media (max-width: 1000px) {
            --user-width: 160px;
            margin: 50px 0 30px 0;
        }

        @media (max-width: 800px) {
            --user-width: 120px;
            margin: 50px 0 20px 0;
        }
    }

    .start {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        .btns {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 10px;

            .button {
                margin: 5px 10px;
            }
        }

        .name {
            margin-bottom: 10px;
        }

        input {
            margin-bottom: 10px;
            max-width: 90vw;
        }
    }

    .footer {
        position: absolute;
        bottom: 5px;
        font-size: 20px;

        a {
            color: var(--dark-grey);
            text-decoration: none;
            margin: 0 10px;

            &:hover {
                text-decoration: underline;
            }
        }
    }

    .version {
        position: absolute;
        bottom: 2px;
        right: 5px;
        color: var(--dark-grey);
    }
}
</style>
