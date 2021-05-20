<template>
  <button @click="$emit('click')">
    <slot></slot>
  </button>
</template>
<script lang="ts">
export default {
  emits: ['click']
}
</script>

<style lang="scss" scoped>
button {
    border: none;
    border-radius: 15px;
    height: 30px;
    padding: 5px 20px;
    cursor: pointer;
    
}
</style>