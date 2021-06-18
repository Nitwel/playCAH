<template>
    <div
        v-if="render"
        ref="hand"
        class="hands"
        :style="{'paddingRight': `${-cardMargin + 10}px`}"
    >
        <teleport v-for="(card, index) in hands" :key="index" :to="to[index]" :disabled="index in to === false || to[index] === ''">
            <Card
                :id="index"
                :ref="registerCardRef"
                :selectable="!placed && !disabled"
                :style="{'--slotted-time': `${plotAnimation}ms`, 'marginRight': `${cardMargin}px`}"
            >
                <span v-html="card" />
                <template #container>
                    <Button
                        v-if="deleting && !isInSlot(index)"
                        class="delete abs"
                        icon="delete"
                        rounded
                        @click="deleteCard(card)"
                    />
                    <transition name="scaleSelect">
                        <Button
                            v-if="placeable && blackCard.pick in inSlot && index == inSlot[blackCard.pick].id"
                            class="accept abs"
                            icon="done"
                            rounded
                            @click="onSelect"
                        />
                    </transition>
                </template>
            </Card>
        </teleport>
    </div>
</template>

<script lang="ts">
import { Component, computed, onBeforeUpdate, onMounted, onUnmounted, ref, watch, ComponentPublicInstance } from 'vue'
import { useStore } from '../store'
import { emitter } from '../setup'
import { register } from './register'

export default {
    name: 'Hands',
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        allPlaced: {
            type: Boolean,
            default: false
        },
        deleting: {
            type: Boolean,
            default: false
        }
    },
    setup(props, {emit}) {
        const store = useStore()
        const cards = ref<HTMLElement[]>([])
        const hand = ref<HTMLElement>()
        
        const dragging = ref<HTMLElement | undefined>(undefined)
        const startPos = ref<{top: number, left: number, clientHeight?: number, clientWidth?: number}>({
            top: 0,
            left: 0,
            clientHeight: 0,
            clientWidth: 0
        })
        const to = ref<Record<number, string>>({})
        const nearSlot = ref<string | null>(null)
        const inSlot = ref<Record<string, HTMLElement>>({})
        const slotted = ref<number | undefined>(undefined)
        const placed = ref(false)
        const plotAnimation = 300
        const slotPositions = ref<Record<string, {top: number, left: number}>>({})
        const render = ref(true)
        const windowWidth = ref(window.innerWidth)

        const cardMargin = computed(() => {
            let cardWidth = 200
            if (windowWidth.value <= 1000) cardWidth = 150
            if (windowWidth.value <= 800) cardWidth = 100

            let margin = ((windowWidth.value - 20) - cardWidth * hands.value.length) / hands.value.length
            if (margin > 10) margin = 10
            return margin
        })

        const hands = computed(() => store.state.hands)
        const blackCard = computed(() => store.state.blackCard)
        const placeable = computed(() => Object.values(inSlot.value).length === blackCard.value?.pick && placed.value === false)

        watch(hands, () => {
            render.value = false
            setTimeout(() => {
                render.value = true
            }, 10)
        })

        onBeforeUpdate(() => {
            cards.value = []
        })

        onMounted(() => {
            document.addEventListener('touchmove', drag)
            document.addEventListener('touchstart', dragstart)
            document.addEventListener('touchend', dragend)
            document.addEventListener('mousemove', drag)
            document.addEventListener('mousedown', dragstart)
            document.addEventListener('mouseup', dragend)

            document.body.onresize = ($event) => {
                windowWidth.value = window.innerWidth
            }
            emitter.on('next_round', () => {
                to.value = {}
                placed.value = false
                inSlot.value = {}
            })

            emitter.on('game_end', () => {
                to.value = {}
                placed.value = false
                inSlot.value = {}
            })
        })

        return { registerCardRef, hand, render, cardMargin, hands, placeable, placed, deleteCard, onSelect, isInSlot, inSlot, plotAnimation, blackCard, nearSlot, to }

        function registerCardRef(element: ComponentPublicInstance<HTMLElement>) {
            if(element && element.$el) cards.value.push(element.$el)
        }

        function isInSlot(index: number) {
            const match = Object.values(inSlot.value).findIndex(card => parseInt(card.id) === index)
            return match !== -1
        }

        function deleteCard (card: string) {
            emit('deleted')
            store.dispatch('delete_card', card)
        }

        function calcSlotPositions () {
            const rects = document.getElementsByClassName('user-card-fields')
            const fields: Record<string, {top: number, left: number}> = {}

            Array.from(rects).forEach((rect) => {
                const bounds = rect.getBoundingClientRect()
                fields[rect.id] = { top: bounds.top, left: bounds.left }
            })
            slotPositions.value = fields
        }

        function distance (x1: number, y1: number, x2: number, y2: number) {
            return Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2))
        }

        function dragstart ($event: TouchEvent | MouseEvent) {
            if (placed.value === true || props.disabled === true || props.deleting === true) return

            const card = cards.value.find(card => card === $event.target || card.contains($event.target as Node))

            if (card === undefined || card.classList.contains('slotted') || card.classList.contains('placed')) return

            dragging.value = card
            const pos = card.getBoundingClientRect()

            if (!Object.values(inSlot.value).includes(card)) { to.value[Number(card.id)] = '#app' }
            card.classList.add('global')
            if (blackCard.value && blackCard.value.pick > 2) card.classList.add('xSmall')
            else if (blackCard.value && blackCard.value.pick > 1) card.classList.add('small')

            card.style.top = pos.top + 'px'
            card.style.left = pos.left + 'px'

            let left, top

            if($event instanceof MouseEvent) {
                top = $event.clientY - pos.top
                left = $event.clientX - pos.left
            } else {
                top = $event.changedTouches[0].clientY - pos.top
                left = $event.changedTouches[0].clientX - pos.left
            }

            startPos.value = { top, left }

            Object.entries(inSlot.value).forEach(([key, value]) => {
                if (value === card) {
                    nearSlot.value = key
                }
            })

            calcSlotPositions()
        }

        function drag ($event: TouchEvent | MouseEvent) {
            if (dragging.value === undefined) return

            let left: number
            let top: number

            if ($event instanceof MouseEvent) {
                top = $event.clientY - startPos.value.top
                left = $event.clientX - startPos.value.left
            } else {
                top = $event.changedTouches[0].clientY - startPos.value.top
                left = $event.changedTouches[0].clientX - startPos.value.left
                
            }

            Object.entries(slotPositions.value).forEach(([id, bounds]) => {

                const dist = distance(left, top, bounds.left, bounds.top)

                if (nearSlot.value === null || nearSlot.value === id) {
                    if (inSlot.value[id] && ((dist <= 50 && nearSlot.value !== id) || (dist > 50 && nearSlot.value === id))) {
                        inSlot.value[id].style.transform = nearSlot.value ? '' : 'translate(20px, -20px)'
                    }
                    nearSlot.value = dist <= 50 ? id : null

                    if (nearSlot.value === id) {
                        top = bounds.top
                        left = bounds.left
                    } else {
                        if (dragging.value?.classList.contains('moving') === false) {
                            var audio = new Audio('/sounds/swip.mp3')
                            audio.play()
                        }

                        dragging.value?.classList.add('moving')
                        if (inSlot.value[id] === dragging.value) {
                            delete inSlot.value[id]
                        }
                    }
                }
            })

            if (top < 0) top = 0
            if (left < 0) left = 0
            if (top + dragging.value?.clientHeight > window.innerHeight) top = window.innerHeight - dragging.value.clientHeight
            if (left + dragging.value.clientWidth > window.innerWidth) left = window.innerWidth - dragging.value.clientWidth

            dragging.value.style.top = top + 'px'
            dragging.value.style.left = left + 'px'
        }

        function dragend() {
            if (dragging.value === undefined) return

            const card = dragging.value

            if (nearSlot.value === null) {
                card.style.top = ''
                card.style.left = ''
                card.classList.remove('global', 'small', 'xSmall')
                to.value[Number(card.id)] = ''

                const audio = new Audio('/sounds/zpfw.mp3')
                audio.play()
            } else {
                const oldSlot = inSlot.value[nearSlot.value]
                if (oldSlot && oldSlot !== card) {
                    oldSlot.style.top = ''
                    oldSlot.style.left = ''
                    oldSlot.style.transform = ''
                    oldSlot.classList.remove('global', 'small', 'xSmall')
                    to.value[Number(oldSlot.id)] = ''
                }

                inSlot.value[nearSlot.value] = card

                if (card.classList.contains('moving')) {
                    emitter.emit('slot' + nearSlot.value, true)
                    card.classList.add('slotted')
                    clearTimeout(slotted.value)
                    slotted.value = window.setTimeout(() => {
                        card.classList.remove('slotted')
                    }, plotAnimation + 100)

                    const audio = new Audio('/sounds/pflp.mp3')
                    audio.play()
                }
            }

            card.classList.remove('moving')
            dragging.value = undefined
            nearSlot.value = null
        }

        function onSelect () {
            placed.value = true
            const cards = Object.values(inSlot.value).map(slot => hands.value[parseInt(slot.id)])
            to.value = {}

            var audio = new Audio('/sounds/plopplop.mp3')
            audio.play()

            store.dispatch('place_cards', cards)
        }

    }
}
</script>
<style scoped lang="scss">
.hands {
  position: absolute;
  top: 100%;
  padding: 0 10px;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  max-width: 100vw;

  @media (max-width: 1000px) {
    transform: translate(-50%, -80%);
  }
}
</style>
<style lang="scss">
body .card {
  --slotted-time: 300ms;

  &.slotted .card-element {
    animation: slotted var(--slotted-time);
  }

  .moving {
    z-index: 20;
  }

  .delete {
    --card-top: 3%;
    --card-left: 93%;
    --button-color: var(--red);
    --button-font-color: var(--white);
  }

  .accept {
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

  @keyframes slotted {
    0% {transform: scale(1.05);}
    50% {transform: scale(0.95);}
  }
}
</style>
