<template>
  <transition name="alert">
    <div class="alert" :class="type" v-if="show">
        <span class="material-icons">{{icon}}</span>{{message}}
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Alert',
  data () {
    return {
      show: false,
      message: '',
      timeout: undefined,
      type: undefined
    }
  },
  created () {
    this.$root.$on('error', (message) => {
      this.type = 'error'
      this.onEvent(message)
    })
    this.$root.$on('info', (message) => {
      this.type = 'info'
      this.onEvent(message)
    })
  },
  computed: {
    icon () {
      switch (this.type) {
        case 'error':
          return 'warning'
        default:
          return 'info'
      }
    }
  },
  methods: {
    onEvent (message) {
      this.message = message
      this.show = true
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.show = false
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
