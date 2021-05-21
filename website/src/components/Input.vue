<template>
  <input :type="type" :placeholder="placeholder" :disabled="disabled" class="input" @input="$emit('input', $event.target.value)" :value="value"/>
</template>

<script>
export default {
  name: 'Input',
  props: {
    value: {
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
  }
}
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

  &:focus, &:hover {
  }

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
