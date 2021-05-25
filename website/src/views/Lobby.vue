<template>
    <div class="lobby">
        <div class="title">
            Lobby
        </div>
        <div class="users">
            <div
                v-for="user in users"
                :key="user.name"
                class="user"
            >
                <User :name="user.name" />
                <span
                    v-if="endLobby && user.trophy"
                    class="tropy material-icons"
                    :class="user.trophy"
                >emoji_events</span>
                <span
                    v-if="endLobby"
                    class="points"
                >{{ user.points }} Points</span>
            </div>
            <User
                v-if="!endLobby"
                name="invite"
                class="invite"
                invite
                @click="copyLink"
            />
            <textarea id="lobby-link" />
        </div>
        <div class="settings">
            <div>
                <label>Card decks</label>
                <!-- TODO: Multiselect -->
            </div>
            <div>
                <label>Language</label>
                <multiselect
                    v-if="host"
                    v-model="language"
                    :options="languages"
                    :searchable="false"
                    :allow-empty="false"
                />
                <multiselect
                    v-else
                    :value="language"
                    :options="languages"
                    disabled
                />
            </div>
            <div>
                <label>Points to win</label>
                <Input
                    v-if="host"
                    v-model="pointsToWin"
                    type="number"
                />
                <Input
                    v-else
                    type="text"
                    :value="$store.state.pointsToWin"
                    disabled
                />
            </div>
            <div>
                <label>Hand size</label>
                <Input
                    v-if="host"
                    v-model="handSize"
                    type="number"
                />
                <Input
                    v-else
                    type="text"
                    :value="$store.state.handSize"
                    disabled
                />
            </div>
        </div>
        <div
            v-if="host"
            class="actions"
        >
            <Button @click="saveSettings">
                Save Settings
            </Button>
            <Button @click="onClick">
                {{ endLobby? "Next Round" : "Start" }}
            </Button>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, ref } from 'vue'
import {cardDecks} from '../cardDecks'
import { useStore } from '../store'
import { emitter } from '../setup'

export default {
    name: 'Lobby',
    components: {
    
    },
    props: {
        name: {
            type: String
        }
    },
    setup(props) {
        const pointsToWin = ref(5)
        const handSize = ref(7)
        const languages = ref(['en', 'de'])
        const store = useStore()

        const selected = computed({
            get () {
                return cardDecks.filter((deck) => store.state.cardDecks.includes(deck.value))
            },
            set (val: {name: string, value: string}[]) {
                store.commit('setCardDecks', val.map(deck => deck.value))
            }
        })

        const language = computed({
            get () {
                return store.state.language
            },
            set (val: string) {
                store.commit('setLanguage', val)
            }
        })

        const link = computed(() => window.location.href)

        const readonlyDecks = computed(() => cardDecks.filter(deck => store.state.cardDecks.includes(deck.value)).map(deck => deck.name))

        const host = computed(() => store.state.host === store.state.name)

        const endLobby = computed(() => store.state.endLobby )

        const users = computed(() => {
            const users = store.state.users
            if (endLobby.value) {
                const sorted = [...users]
                const ranks = ['gold', 'silver', 'bronze']

                sorted.sort((a, b) => b.points - a.points)

                users.forEach(user => {
                    for (let i = 0; i < 3 && i < sorted.length; i++) {
                        if (user.name === sorted[i].name) user.trophy = ranks[i]
                    }
                })
            }
            return users
        })

        return {pointsToWin, handSize, languages, selected, language, readonlyDecks, host, endLobby, users, saveSettings, onClick, copyLink}

        function saveSettings () {
            store.dispatch('change_settings', {
                points_to_win: pointsToWin.value,
                card_decks: selected.value.map(deck => deck.value),
                hand_size: handSize.value,
                language: language.value
            })
        }
        function onClick () {
            store.dispatch('start_game')
        }

        function copyLink () {
            const element = document.getElementById('lobby-link')
            if(element === null) return

            if(element instanceof HTMLTextAreaElement) {
                element.value = link.value
                element.select()
                document.execCommand('copy')
                emitter.emit('info', 'The link has been copied.')
            }

        }
    }
}
</script>

<style scoped lang="scss">
.lobby {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  .title {
    font-size: 90px;

    @media (max-width: 1000px) {
      font-size: 70px;
    }

    @media (max-width: 800px) {
      font-size: 50px;
    }
  }

  .users {
    display: flex;
    max-width: 90%;
    flex-wrap: wrap;
    margin: 50px 0;

    @media (max-width: 1000px) {
      margin: 10px 0;
    }

    #lobby-link {
      width: 0px;
      height: 0px;
      padding: 0px;
      border-width: 0px;
      opacity: 0;
    }

    .user {
      display: flex;
      align-items: center;
      flex-direction: column;

      .tropy {
        margin-top: 15px;
        font-size: 50px;
      }

      .gold { color: var(--gold); }
      .silver { color: var(--silver); }
      .bronze { color: var(--bronze); }
    }
  }

  .settings {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
    font-size: 25px;

    @media (max-width: 1000px) {
      font-size: 25px;
    }

    @media (max-width: 800px) {
      font-size: 20px;
    }

    > div {
      display: flex;
      flex-direction: column;
    }

    :deep(.multiselect)  {
      margin: 2px 0;
      max-width: 90vw;
      min-width: 200px;

      .multiselect__select {
        height: 100%;
        transform-origin: 50% calc(50% + 1px);

      }

      &.multiselect--disabled {
        opacity: 1;

        .multiselect__select {
          display: none;
        }

        .multiselect__tags {
          padding-right: 0px;
        }
      }

      .multiselect__tags {
        color: var(--dark-grey);
        border: 4px solid var(--grey);
        border-radius: 10px;
        font-size: 20px;
        font-weight: 500;

        @media (max-width: 1000px) {
          font-size: 20px;
        }

        @media (max-width: 800px) {
          padding: 4px 30px 0px 4px;
          font-size: 15px;
          border: 3px solid var(--grey);

          .multiselect__tags-wrap .multiselect__tag {
            margin-bottom: 0px;
          }
        }

        .multiselect__tags-wrap {

          .multiselect__tag {
            // margin: 0px 5px 0px 0px;
          }
        }
      }
    }
  }

  .actions {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;

    .button {
      margin: 5px 10px;
    }
  }

}
</style>
