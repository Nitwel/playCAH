<template>
    <div class="game">
        <Shortcuts
            leave
            :del="!deleted && !winnerSelected"
            @click="onShortcut"
        />
        <div class="title">
            {{ title }}
        </div>
        <div class="points">
            <span
                v-for="user in points"
                :key="user.name"
                :class="{disconnected: !user.connected}"
            >{{ $store.state.name == user.name? '(you)': '' }}{{ zar == user.name? '(czar)': '' }} {{ user.name }} has {{ user.points }} points.</span>
        </div>
        <div class="table">
            <div class="slots">
                <div
                    v-for="(user, pos) in users"
                    :key="user.name"
                    class="user-slot"
                >
                    <Card
                        v-for="(p, i) in blackCard.pick"
                        :key="pos + '-' + i"
                        :event-id="pos"
                        :indeterminate="!user.placed"
                        :small="blackCard.pick > 1"
                        :x-small="blackCard.pick > 2"
                        :class="{placed: user.placed, clickable: isZar && allPlaced && !allRevealed, winner: winnerSelected && posNames[pos] === $store.state.winner}"
                        @click="selected(pos)"
                    >
                        <User
                            v-if="!allPlaced"
                            :name="user.name"
                            :small="!user.placed"
                            :x-small="user.placed"
                            class="abs"
                        />
                        <User
                            v-if="winnerSelected"
                            :name="posNames[pos]"
                            x-small
                            class="abs"
                        />
                        <span
                            v-if="user.placed && !isRevealed(pos)"
                            class="questionmark abs"
                        >?</span>
                        <span
                            v-if="isRevealed(pos)"
                            class="revealed"
                            v-html="revealed[pos][i]"
                        />
                        <transition name="scaleSelect">
                            <Button
                                v-if="isZar && allRevealed && i == blackCard.pick - 1 && !winnerSelected"
                                class="winner abs"
                                icon="done"
                                rounded
                                @click="onSelectWinner(pos)"
                            />
                        </transition>
                    </Card>
                </div>
                <div
                    v-if="!isZar && !allPlaced && !playerPlaced"
                    class="user-slot"
                >
                    <Effect
                        v-for="p in blackCard.pick"
                        :key="p"
                        :trigger="'slot'+p"
                        :time="500"
                        effect="pop"
                    >
                        <Card
                            :id="p"
                            class="user-card-fields"
                            indeterminate
                            :small="blackCard.pick > 1"
                            :x-small="blackCard.pick > 2"
                        >
                            <img
                                class="add"
                                src="../assets/add-full.svg"
                                alt="add"
                            >
                        </Card>
                    </Effect>
                </div>
            </div>
            <Card
                class="black"
                black
            >
                <span v-html="blackCard.text" />
            </Card>
        </div>
        <Hands
            :disabled="isZar"
            :all-placed="allPlaced"
            :deleting="deleting && !deleted"
            @deleted="deleted = true"
        />
    </div>
</template>

<script lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useStore } from '../store'
import {useUtil} from '../util'
import { emitter } from '../setup'
export default {
    name: 'Game',
    props: {
        name: String
    },
    setup(props) {
        const {isAllPlaced, isAllRevealed, getConnectedUsers} = useUtil()
        const deleted = ref(false)
        const deleting = ref(false)
        const store = useStore()

        const isZar = computed(() => store.state.zar === store.state.name)
        const playerPlaced = computed(() => store.state.users.find(user => user.name === store.state.name)?.placed)
        const allPlaced = computed(() => isAllPlaced())
        const allRevealed = computed(() => isAllRevealed())
        const winnerSelected = computed(() => store.state.posNames && Object.values(store.state.posNames).length > 0)

        const users = computed(() => {
            let users = getConnectedUsers()
            const currentUser = users.find((user) => user.name === store.state.name)
            users = users.filter((user) => user !== currentUser)
            if(currentUser !== undefined)
                users.push(currentUser)

            if (Object.keys(revealed.value).length !== 0) {
                users = users.filter(user => user.placed)
            }

            if (isZar.value === false && (allPlaced.value || playerPlaced.value)) {
                return users.filter(u => u.name !== store.state.zar)
            } else {
                return users.filter(u => u.name !== store.state.name && u.name !== store.state.zar)
            }
        })

        const points = computed(() => store.state.users)
        const blackCard = computed(() => store.state.blackCard)
        const revealed = computed(() => store.state.revealed)
        const posNames = computed(() => store.state.posNames)
        const zar = computed(() => store.state.zar)

        const title = computed(() => {
            if (winnerSelected.value) {
                return `${store.state.winner} won. Next round starts in ${store.state.timer}s.`
            }

            if (isZar.value) {
                if (allPlaced.value && allRevealed.value === false) {
                    return 'Its your turn to reveal the cards!'
                } else if (allRevealed.value) {
                    return 'Now select your favorite!'
                } else {
                    return 'Wait until all players have placed their cards!'
                }
            } else {
                if (allPlaced.value && allRevealed.value === false) {
                    return `${zar.value} is revealing the cards!`
                } else if (allRevealed.value) {
                    return `${zar.value} is selecting is favorite!`
                } else {
                    return `Place your cards! ${zar.value} is the czar.`
                }
            }
        })

        onMounted(() => {
            emitter.on('next_round', () => {
                deleted.value = false
                deleting.value = false
                var audio = new Audio('/sounds/win.mp3')
                audio.play()
            })
        })

        return {deleted, deleting, isZar, playerPlaced, allPlaced, allRevealed, winnerSelected, users, points, blackCard, revealed, posNames, zar, title, onShortcut, isRevealed, selected, onSelectWinner}

        function onShortcut (type: 'delete' | 'leave') {
            if (type === 'delete') {
                deleting.value = !deleting.value
            } else if (type === 'leave') {
                store.dispatch('leave_game')
            }
        }

        function isRevealed (pos: number) {
            return revealed.value[pos] && revealed.value[pos].length > 0
        }

        function selected (pos: number) {
            if (isZar.value === false || allPlaced.value === false || revealed.value[pos]) return

            store.dispatch('reveal_cards', pos)
        }

        function onSelectWinner (pos: number) {
            var audio = new Audio('/sounds/plopplop.mp3')
            audio.play()

            store.dispatch('winner', pos)
        }
    }
}
</script>
<style scoped lang="scss">
.game {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-bottom: 100px;

  @media (max-width: 1000px) {
    padding-bottom: 50px;
  }

  @media (max-width: 800px) {
    padding-bottom: 20px;
  }

  .title {
    position: absolute;
    top: 30px;
    font-size: 40px;

    @media (max-width: 1000px) {
      font-size: 30px;
    }
    @media (max-width: 800px) {
      font-size: 20px;
    }
  }

  .points {
    position: absolute;
    top: 40px;
    left: 10px;
    display: flex;
    flex-direction: column;
    @media (max-width: 1000px) {
      top: 60px;
    }

    .disconnected {
      opacity: 0.5;
    }
  }

  .table {
    display: flex;
    justify-content: center;
    align-items: center;
    max-width: 100%;

    @media (max-width: 800px) {
      flex-direction: column-reverse;
    }

    .slots {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;

      .user-slot {
        perspective: 800px;

        .card {
          margin: 15px;
          transform-style: preserve-3d;

          @media (max-width: 800px) {
            margin: 5px;
          }

          &.placed {
            --card-top: 10px;
            --card-left: 20px;

            @media (max-width: 800px) {
              --card-top: 0px;
              --card-left: 0px;
            }
          }

          &.clickable {
            cursor: pointer;
          }

          &.winner::after {
            content: '';
            position: absolute;
            bottom: -16px;
            width: 100%;
            height: 6px;
            background-color: var(--green);
            border-radius: 3px;
          }

          .user {
            transition-property: top, left;
            transition: 300ms ease-in-out;
          }

          .questionmark {
            --card-top: 50%;
            --card-left: 50%;

            font-size: 100px;
          }

          .winner {
            --card-top: 100%;
            --card-left: 100%;
            --button-color: var(--grey);
            --button-font-color: var(--green);

            &.scaleSelect-enter, &.scaleSelect-leave-to {
              transform: translate(-50%, -50%) scale(0.1);
            }
            &.scaleSelect-enter-to, &.scaleSelect-leave {
              transform: translate(-50%, -50%) scale(1);
            }
            &.scaleSelect-enter-active {
              transition: 150ms ease-out;
            }
            &.scaleSelect-leave-active {
              transition: 150ms ease-in;
            }

            &:active {
              transform: translate(-50%, -50%) scale(0.90);
            }
          }
        }
      }

      .user-card-fields {

        .add {
          margin-top: 8px;
          width: 100px;

          @media (max-width: 1000px) {
            margin-top: 0px;
            width: 70px;
          }
        }
      }
    }

    .black {
      @media (min-width: 801px) {
        margin-left: 50px;
      }
    }
  }
}
</style>
