<template>
  <input type="text" :value="modelValue" :placeholder="placeholder" @input="$emit('update:modelValue', $event.target.value)"  />
</template>

<script lang="ts">
export default {
    props: {
        modelValue: {
            type: String,
            default: null
        },
        placeholder: {
            type: String,
            default: null
        }
    },
    emits: ['update:modelValue']
}
</script>

<style lang="scss" scoped>
input {
    border: none;
    border-radius: 15px;
    height: 30px;
    padding: 5px 20px;
    
}
</style>