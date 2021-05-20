<template>
  <div id="home">
    <div class="title">CAH by Nitwel<div class="tag">Unofficial</div></div>
    <User :name="name" large hideName/>
    <div class="start">
      <Input placeholder="Your name..." v-model="name" maxlength="12"/>
      <Input v-if="showLobbyInput" placeholder="Enter lobby name..." v-model="lobby" maxlength="20"/>
      <div class="btns">
        <Button v-if="!showLobbyInput" @click="resetLobby">Change Lobby</Button>
        <Button @click="onClick" :disabled="!connected">Join</Button>
      </div>
    </div>
    <div class="footer">
      <a href="https://docs.google.com/forms/d/e/1FAIpQLScPaRQoTIMgzjF6Bmgbi6TESD2KnfzohOG0opd9qN4BJ21YTg/viewform?usp=sf_link" target="_blank">Give feedback</a>
      <a href="https://github.com/sponsors/Nitwel" target="_blank">Sponsor me!</a>
      <a href="disclaimer.html">Disclamer</a>
      <a href="https://github.com/Nitwel/CAH">Source Code</a>
    </div>
    <span class="version">{{version}}</span>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {
      showLobbyInput: true
    }
  },
  created () {
    if (this.lobby !== '') this.showLobbyInput = false
  },
  props: {

  },
  computed: {
    version () {
      return 'v' + (process.env.VUE_APP_VERSION || '0.1.0')
    },
    name: {
      get () {
        return this.$store.state.name
      },
      set (val) {
        this.$store.state.name = val
      }
    },
    lobby: {
      get () {
        return this.$store.state.lobby
      },
      set (val) {
        this.$store.state.lobby = val
      }
    },
    connected () {
      return this.$store.state.connected
    }
  },
  methods: {
    onClick () {
      if (!this.connected) {
        this.$root.$emit('error', 'Not connected to the server.')
        return
      }

      if (!this.name) {
        this.$root.$emit('error', 'You must provide a user name.')
        return
      }

      if (!this.lobby) {
        this.$root.$emit('error', 'You must provide a lobby name.')
        return
      }
      this.$store.dispatch('join_lobby')
    },
    resetLobby () {
      this.showLobbyInput = true
    }
  }
}
</script>
<style scoped lang="scss">
#home {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .title {
    font-size: 90px;
    position: relative;
    text-align: center;

    @media (max-width: 1000px) {
      font-size: 70px;
    }

    @media (max-width: 800px) {
      font-size: 50px;
    }

    .tag {
      position: absolute;
      font-size: 20px;
      top: 70%;
      right: -20px;
      background-color: var(--red);
      color: var(--white);
      padding: 2px 15px;
      border-radius: 5px;
    }

    @media (max-width: 600px) {
      .tag {
        left: 50%;
        right: unset;
        top: 100%;
        transform: translate(-50%, 0%);
      }
    }
  }

  .user {
    margin: 50px 0;

    @media (max-width: 1000px) {
      --user-width: 160px;
      margin: 50px 0 30px 0;
    }

    @media (max-width: 800px) {
      --user-width: 120px;
      margin: 50px 0 20px 0;
    }
  }

  .start {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .btns {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;

      .button {
        margin: 5px 10px;
      }
    }

    input {
      margin-bottom: 10px;
      max-width: 90vw;
    }
  }

  .footer {
    position: absolute;
    bottom: 5px;
    font-size: 20px;

    a {
      color: var(--dark-grey);
      text-decoration: none;
      margin: 0 10px;

      &:hover {
        text-decoration: underline;
      }
    }

  }

  .version {
    position: absolute;
    bottom: 2px;
    right: 5px;
    color: var(--dark-grey);

  }
}
</style>
