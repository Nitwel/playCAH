<template>
    <transition name="alert">
        <div
            v-if="show"
            class="alert"
            :class="type"
        >
            <span class="material-icons">{{ icon }}</span>{{ message }}
        </div>
    </transition>
</template>

<script lang="ts">
import {emitter} from '../setup'
import { computed, onMounted, ref } from 'vue'
export default {
    name: 'Alert',
    setup() {
        const show = ref(false)
        const message = ref('')
        const timeout = ref<number | undefined>(undefined)
        const type = ref<string | undefined>(undefined)

        const icon = computed(() => {
            if(type.value === 'error') return 'warning'
            else return 'info'
        })

        onMounted(() => {
            emitter.on('error', (message) => {
                type.value = 'error',
                onEvent(message)
            })
            emitter.on('info', (message) => {
                type.value = 'info',
                onEvent(message)
            })
        })

        function onEvent (msg: string) {
            message.value = msg
            show.value = true
            clearTimeout(timeout.value)
            timeout.value = setTimeout(() => {
                show.value = false
            }, 3000)
        }
    }
}
</script>
<style scoped lang="scss">
.alert {
    position: absolute;
    bottom: 20px;
    right: 20px;
    padding: 15px 25px;
    display: flex;
    align-items: center;
    justify-content: center;

    &.alert-enter, &.alert-leave-to {
        opacity: 0;
        transform: translateX(20px);
    }

    &.alert-enter-to, &.alert-leave {
        transform: translateX(0px);
    }

    &.alert-enter-active {
        transition: 200ms ease-out;
    }

    &.alert-leave-active {
        transition: 200ms ease-in;
    }

    border-radius: 5px;
    color: var(--white);
    font-size: 20px;

    .material-icons {
        margin-right: 10px;
    }

    &.error {
      background-color: var(--red);
    }

    &.info {
      background-color: var(--green);
    }
}
</style>
