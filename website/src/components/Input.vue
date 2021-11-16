<template>
    <input
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        class="input"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target?.value)"
    />
</template>

<script setup lang="ts">

const props = defineProps({
    modelValue: {
        type: [String, Number],
        default: ''
    },
    type: {
        type: String,
        default: 'text'
    },
    placeholder: {
        type: String,
        default: 'Enter...'
    },
    disabled: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue'])
</script>
<style lang="scss" scoped>
.input {
    color: var(--dark-grey);
    height: 54px;
    padding: 5px 30px;
    border: 4px solid var(--grey);
    border-radius: 10px;
    font-size: 30px;
    font-weight: 500;
    max-width: 95vw;

    &:focus * {
        outline: none;
    }

    &:disabled {
        background: var(--white);
    }

    @media (max-width: 1000px) {
        height: 48px;
        font-size: 25px;
        padding: 5px 20px;
        padding: 6px;
    }

    @media (max-width: 800px) {
        height: 42px;
        font-size: 20px;
        padding: 5px 15px;
        border: 3px solid var(--grey);
    }
}
</style>
