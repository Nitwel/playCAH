<template>
    <div class="card" :class="{ small, xSmall }">
        <div ref="card" class="card-element" :class="{ indeterminate, black, selectable }">
            <svg v-if="indeterminate" class="border" viewBox="0 0 200 300">
                <rect
                    x="5"
                    y="5"
                    width="190"
                    height="290"
                    rx="20"
                    ry="20"
                    stroke="var(--light-grey)"
                    stroke-width="5"
                    stroke-dasharray="20 20"
                    fill="transparent"
                />
            </svg>
            <textarea
                placeholder="Enter some text..."
                class="editable"
                v-if="modelValue !== undefined"
                :value="modelValue"
                @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
            ></textarea>
            <slot />
        </div>
        <slot name="container" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { emitter } from '../setup'

const props = defineProps({
    modelValue: {
        type: String,
        default: undefined
    },
    black: {
        type: Boolean,
        default: false
    },
    indeterminate: {
        type: Boolean,
        default: false
    },
    small: {
        type: Boolean,
        default: false
    },
    xSmall: {
        type: Boolean,
        default: false
    },
    selectable: {
        type: Boolean,
        default: false
    },
    eventId: {
        type: Number,
        default: undefined
    }
})

const emit = defineEmits(['update:modelValue'])

const card = ref<HTMLElement>()

onMounted(() => {
    if (props.eventId !== undefined) {
        emitter.on('rotate_' + props.eventId, () => {

            if (!card.value) return

            card.value.classList.add('rotating')
        })
    }
})

</script>
<style scoped lang="scss">
.card {
    position: relative;
    --card-top: 50%;
    --card-left: 50%;
    --rotation-time: 600ms;
    width: 200px;
    height: 300px;
    font-weight: 500;
    font-size: 20px;

    :deep(.abs) {
        position: absolute;
        top: var(--card-top);
        left: var(--card-left);
        transform: translate(-50%, -50%);
        z-index: 10;
    }

    &.global {
        position: absolute;
        z-index: 10;
    }

    .card-element {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 20px;
        padding: 25px 20px;
        box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.35);
        z-index: 1;

        background-color: white;
        color: black;
        transition-property: transform;
        transition: 200ms ease-in-out;

        user-select: none;

        .editable {
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            background-color: inherit;
            border: none;
            resize: none;
            outline: none;
            font-family: inherit;
            font-size: inherit;
            overflow: hidden;
            color: inherit;
        }

        &.black {
            background-color: black;
            color: white;
        }

        &.selectable:hover {
            box-shadow: 0px 0px 30px 0px rgba(0, 0, 0, 0.23);
            transform: scale(1.05);
            cursor: pointer;
            z-index: 5;
        }

        &.indeterminate {
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: transparent;
            box-shadow: none;
            padding: 0;

            .border {
                position: absolute;
                width: 100%;
                height: 100%;
            }
        }

        &.rotating {
            transition-duration: 0s;
            animation: rotate 600ms ease-in-out;

            @keyframes rotate {
                0% {
                    transform: rotateY(180deg) rotateX(0deg);
                    color: var(--white);
                }
                49% {
                    color: var(--white);
                }
                50% {
                    color: unset;
                }
                100% {
                    transform: rotateY(0deg) rotateX(0deg);
                }
            }

            & > * {
                backface-visibility: hidden;
            }
        }
    }

    &.small {
        font-size: 16px;
        width: 150px;
        height: 225px;

        .card-element {
            border-radius: 15px;
            padding: 18.75px 15px;
        }

        @media (max-width: 800px) {
            font-size: 12px;
            width: 100px;
            height: 150px;

            .card-element {
                border-radius: 10px;
                padding: 12.5px 10px;
            }
        }
    }

    &.xSmall {
        font-size: 12px;
        width: 120px;
        height: 180px;

        .card-element {
            border-radius: 10px;
            padding: 12.5px 10px;
        }
    }

    @media (min-width: 801px) and (max-width: 1000px) {
        font-size: 16px;
        width: 150px;
        height: 225px;

        .card-element {
            border-radius: 15px;
            padding: 18.75px 15px;
        }
    }

    @media (max-width: 800px) {
        font-size: 12px;
        width: 100px;
        height: 150px;

        .card-element {
            border-radius: 10px;
            padding: 12.5px 10px;
        }
    }
}
</style>
