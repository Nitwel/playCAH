<template>
    <div class="admin">
        <input
            v-model="password"
            type="text"
        >
        <button @click="onClick">
            Send
        </button>
        <h1 class="games-sum">
            {{ games.length }} Games are running.
        </h1>
        <textarea class="text" :value="JSON.stringify(games, null, 4)">

        </textarea>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { socket } from '../setup'

const password = ref('')
const games = ref([])

function onClick () {
    socket.emit('games', password.value, (response: any) => {
        if (response.error) return console.error(response.error)
        console.log(response)

        games.value = response
    })
}

</script>
<style scoped lang="scss">
.admin {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.text {
    width: 80vw;
    height: 500px;
}
</style>
