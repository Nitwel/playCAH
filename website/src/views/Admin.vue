<template>
  <div class="admin">
    <input type="text" v-model="password" >
    <button @click="onClick">Send</button>
    <h1 class="games-sum">{{games.length}} Games are running.</h1>
    <div class="games">
      <span v-for="game in games" :key="game.name">{{game.name}} with {{game.players.length}} players.</span>
    </div>
    <h1 class="players-sum">{{players.length}} Players total</h1>
    <div class="players">
      <span v-for="player in players" :key="player.name">{{player.name}} </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Admin',
  data () {
    return {
      password: '',
      games: [],
      players: []
    }
  },
  methods: {
    onClick () {
      this.$socket.emit('games', this.password, (response) => {
        if (response.error) return console.error(response.error)
        console.log(response)

        this.games = response
      })
      this.$socket.emit('players', this.password, (response) => {
        if (response.error) return console.error(response.error)
        console.log(response)
        this.players = response
      })
    }
  }
}
</script>
<style scoped lang="scss">
.admin {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>
