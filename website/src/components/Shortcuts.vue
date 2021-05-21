<template>
  <div class="shortcuts">
    <span @click="$emit('click', 'leave')" v-if="leave" class="material-icons">exit_to_app</span>
    <span @click="$emit('click', 'delete')" v-if="del" class="delete material-icons">delete</span>
  </div>
</template>

<script>
export default {
  name: 'Shortcuts',
  props: {
    leave: {
      type: Boolean,
      default: false
    },
    del: {
      type: Boolean,
      default: false
    }
  }
}
</script>
<style scoped lang="scss">
.shortcuts {
  position: absolute;
  top: 0;
  right: 0;
  padding: 10px;
  display: flex;
  flex-direction: column;

  span {
    color: var(--dark-grey);
    font-size: 35px;
    cursor: pointer;

    &:hover {
      color: var(--grey);
    }
  }

  .delete {

    &:hover {
      color: var(--red);
    }
  }
}
</style>
