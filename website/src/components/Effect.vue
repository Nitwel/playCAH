<template>
    <div
        class="effect"
        :style="{'--effect-time': `${time}ms`}"
    >
        <slot />
        <img
            v-if="show && effect == 'pop'"
            class="effect-image pop"
            src="../assets/place.svg"
            alt=""
        >
    </div>
</template>

<script lang="ts">
import { onMounted, ref } from 'vue'
import { emitter } from '../setup'
export default {
    name: 'Effect',
    props: {
        trigger: {
            type: String,
            default: ''
        },
        time: {
            type: Number,
            default: 800
        },
        effect: {
            type: String,
            default: null
        }
    },
    setup(props) {
        const show = ref(false)

        onMounted(() => {
            emitter.on(props.trigger, (event) => {
                show.value = true
                setTimeout(() => {
                    show.value = false
                }, props.time)
            })
        })
                
        return  { show }
    }
}
</script>
<style scoped lang="scss">
.effect {
  position: relative;
  --effect-time: 800ms;

  &-image {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    position: absolute;
    z-index: 5;
    pointer-events: none;

    &.pop {
      animation: var(--effect-time) ease-in-out pop;
    }
  }

  @keyframes pop {
    0% {transform: scale(0.9);}
    50% {opacity: 1;}
    100% {transform: scale(1.3); opacity: 0;}
  }
}
</style>
