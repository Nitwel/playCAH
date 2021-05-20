<template>
  <div class="lobby">
    <div class="title">Lobby</div>
    <div class="users">
      <div class="user"  v-for="user in users" :key="user.name" >
        <User :name="user.name"/>
        <span v-if="endLobby && user.trophy" class="tropy material-icons" :class="user.trophy">emoji_events</span>
        <span class="points" v-if="endLobby">{{user.points}} Points</span>
      </div>
      <User v-if="!endLobby" name="invite" class="invite" invite @click.native="copyLink"></User>
      <textarea id="lobby-link"></textarea>
    </div>
    <div class="settings">
      <div>
        <label>Card decks</label>
        <multiselect v-if="host" v-model="selected" :options="card_decks" taggable multiple label="name" track-by="value" :searchable="false" :allow-empty="false">
          <template slot="singleLabel" slot-scope="{ option }"><strong>{{ option.name }}</strong></template>
        </multiselect>
        <multiselect v-else :value="readonlyDecks" :options="card_decks" taggable multiple disabled>
          <template slot="singleLabel" slot-scope="{ option }"><strong>{{ option.name }}</strong></template>
        </multiselect>
      </div>
      <div>
        <label>Language</label>
        <multiselect v-if="host" v-model="language" :options="languages" :searchable="false" :allow-empty="false"></multiselect>
        <multiselect v-else :value="language" :options="languages" disabled></multiselect>
      </div>
      <div>
        <label>Points to win</label>
        <Input v-if="host" type="number" v-model="pointsToWin"/>
        <Input v-else type="text" :value="$store.state.pointsToWin" disabled/>
      </div>
      <div>
        <label>Hand size</label>
        <Input v-if="host" type="number" v-model="handSize"/>
        <Input v-else type="text" :value="$store.state.handSize" disabled/>
      </div>
    </div>
    <div class="actions" v-if="host">
      <Button @click="saveSettings">Save Settings</Button>
      <Button @click="onClick">{{endLobby? "Next Round" : "Start"}}</Button>
    </div>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'

export default {
  components: {
    Multiselect
  },
  name: 'Lobby',
  props: {
    name: {
      type: String
    }
  },
  data () {
    return {
      pointsToWin: 5,
      handSize: 7,
      languages: ['en', 'de'],
      card_decks: [
        { name: 'Base Set', value: 'Base' },
        { name: 'The First Expansion', value: 'CAHe1' },
        { name: 'The Second Expansion', value: 'CAHe2' },
        { name: 'The Third Expansion', value: 'CAHe3' },
        { name: 'The Fourth Expansion', value: 'CAHe4' },
        { name: 'The Fifth Expansion', value: 'CAHe5' },
        { name: 'The Sixth Expansion', value: 'CAHe6' },
        { name: 'Green Box Expansion', value: 'greenbox' },
        { name: '90s Nostalgia Pack', value: '90s' },
        { name: 'Box Expansion', value: 'Box' },
        { name: 'Fantasy Pack', value: 'fantasy' },
        { name: 'Food Pack', value: 'food' },
        { name: 'Science Pack', value: 'science' },
        { name: 'World Wide Web Pack', value: 'www' },
        { name: 'Vote for Hillary Pack', value: 'hillary' },
        { name: 'Vote for Trump Pack', value: 'trumpvote' },
        { name: 'Trump Survival Pack', value: 'trumpbag' },
        { name: '2012 Holiday Pack', value: 'xmas2012' },
        { name: '2013 Holiday Pack', value: 'xmas2013' },
        { name: 'PAX East 2013', value: 'PAXE2013' },
        { name: 'PAX Prime 2013', value: 'PAXP2013' },
        { name: 'PAX East 2014', value: 'PAXE2014' },
        { name: 'PAX East 2014 Panel Pack', value: 'PAXEP2014' },
        { name: 'PAX Prime 2014 Panel Pack', value: 'PAXPP2014' },
        { name: 'PAX Prime 2015 Food Packs', value: 'PAX2015' },
        { name: 'House of Cards Against Humanity', value: 'HOCAH' },
        { name: 'Reject Pack', value: 'reject' },
        { name: 'Reject Pack 2', value: 'reject2' },
        { name: 'Canadian', value: 'Canadian' },
        { name: 'Misprint Replacement Bonus Cards', value: 'misprint' },
        { name: 'UoP Pack', value: 'uop' },
        { name: '[$] Apples to Apples&reg; Party Pack', value: 'apples' },
        { name: '[$] Crabs Adjust Humidity', value: 'crabs' },
        { name: '[$] Cads About Matrimony', value: 'matrimony' },
        { name: '[C] /tg/', value: 'c-tg' },
        { name: '[C] Admin\'s Picks', value: 'c-admin' },
        { name: '[C] Anime', value: 'c-anime' },
        { name: '[C] Antisocial Injustice', value: 'c-antisocial' },
        { name: '[C] Cards Against Equinity', value: 'c-equinity' },
        { name: '[C] Cards Against Homestuck', value: 'c-homestuck' },
        { name: '[C] Derps Against Humanity', value: 'c-derps' },
        { name: '[C] Doctor Who', value: 'c-doctorwho' },
        { name: '[C] Eurovision Song Contest', value: 'c-eurovision' },
        { name: '[C] FiMFiction.net', value: 'c-fim' },
        { name: '[C] Game Grumps', value: 'c-gamegrumps' },
        { name: '[C] Golby Fan Club', value: 'c-golby' },
        { name: '[C] Game of Thrones (no spoilers)', value: 'GOT' },
        { name: '[C] Grognards Against Humanity (RPG fandom pack)', value: 'CAHgrognards' },
        { name: '[C] Hackers Against Humanity', value: 'HACK' },
        { name: '[C] Joey Image 1', value: 'Image1' },
        { name: '[C] Ladies Against Humanity', value: 'c-ladies' },
        { name: '[C] Imgur', value: 'c-imgur' },
        { name: '[C] Khaos WolfKat', value: 'c-khaos' },
        { name: '[C] Mr. Man Collection', value: 'c-mrman' },
        { name: '[C] NEIndy', value: 'c-neindy' },
        { name: '[C] Nobilis Reed', value: 'c-nobilis' },
        { name: '[C] Not Safe For Humanity', value: 'NSFH' },
        { name: '[C] Northernlion', value: 'c-northernlion' },
        { name: '[C] RagingPsyfag\'s Pack of Shenanigans', value: 'c-ragingpsyfag' },
        { name: '[C] Ridiculously Stupid', value: 'c-stupid' },
        { name: '[C] Rooster Teeth', value: 'c-rt' },
        { name: '[C] RPAnons', value: 'c-rpanons' },
        { name: '[C] SocialGamer', value: 'c-socialgamer' },
        { name: '[C] Sodomy Dog\'s Furry Pack', value: 'c-sodomydog' },
        { name: '[C] That Guy With The Glasses', value: 'c-guywglasses' },
        { name: '[C] Very Serious', value: 'c-vewysewious' },
        { name: '[C] Vidya', value: 'c-vidya' },
        { name: '[C] xkcd', value: 'c-xkcd' }
      ]
    }
  },
  computed: {
    selected: {
      get () {
        return this.card_decks.filter((deck) => this.$store.state.cardDecks.includes(deck.value))
      },
      set (val) {
        this.$store.commit('setCardDecks', val.map(deck => deck.value))
      }
    },
    language: {
      get () {
        return this.$store.state.language
      },
      set (val) {
        this.$store.commit('setLanguage', val)
      }
    },
    link () {
      return window.location.href
    },
    readonlyDecks () {
      const decks = this.$store.state.cardDecks
      return this.card_decks.filter(d => decks.includes(d.value)).map(d => d.name)
    },
    host () {
      return this.$store.state.host === this.$store.state.name
    },
    endLobby () {
      return this.$store.state.endLobby
    },
    users () {
      const users = this.$store.state.users
      if (this.endLobby) {
        const sorted = [...users]
        const ranks = ['gold', 'silver', 'bronze']

        sorted.sort((a, b) => b.points - a.points)

        users.forEach(user => {
          for (let i = 0; i < 3 && i < sorted.length; i++) {
            if (user.name === sorted[i].name) user.trophy = ranks[i]
          }
        })
      }
      return users
    }
  },
  methods: {
    saveSettings () {
      this.$store.dispatch('change_settings', {
        points_to_win: parseInt(this.pointsToWin),
        card_decks: this.selected.map(deck => deck.value),
        hand_size: parseInt(this.handSize),
        language: this.language
      })
    },
    onClick () {
      this.$store.dispatch('start_game')
    },
    copyLink () {
      const el = document.getElementById('lobby-link')
      el.value = this.link
      el.select()
      document.execCommand('copy')
      this.$root.$emit('info', 'The link has been copied.')
    }
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style scoped lang="scss">
.lobby {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  .title {
    font-size: 90px;

    @media (max-width: 1000px) {
      font-size: 70px;
    }

    @media (max-width: 800px) {
      font-size: 50px;
    }
  }

  .users {
    display: flex;
    max-width: 90%;
    flex-wrap: wrap;
    margin: 50px 0;

    @media (max-width: 1000px) {
      margin: 10px 0;
    }

    #lobby-link {
      width: 0px;
      height: 0px;
      padding: 0px;
      border-width: 0px;
      opacity: 0;
    }

    .user {
      display: flex;
      align-items: center;
      flex-direction: column;

      .tropy {
        margin-top: 15px;
        font-size: 50px;
      }

      .gold { color: var(--gold); }
      .silver { color: var(--silver); }
      .bronze { color: var(--bronze); }
    }
  }

  .settings {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
    font-size: 25px;

    @media (max-width: 1000px) {
      font-size: 25px;
    }

    @media (max-width: 800px) {
      font-size: 20px;
    }

    > div {
      display: flex;
      flex-direction: column;
    }

    ::v-deep .multiselect {
      margin: 2px 0;
      max-width: 90vw;
      min-width: 200px;

      .multiselect__select {
        height: 100%;
        transform-origin: 50% calc(50% + 1px);

      }

      &.multiselect--disabled {
        opacity: 1;

        .multiselect__select {
          display: none;
        }

        .multiselect__tags {
          padding-right: 0px;
        }
      }

      .multiselect__tags {
        color: var(--dark-grey);
        border: 4px solid var(--grey);
        border-radius: 10px;
        font-size: 20px;
        font-weight: 500;

        @media (max-width: 1000px) {
          font-size: 20px;
        }

        @media (max-width: 800px) {
          padding: 4px 30px 0px 4px;
          font-size: 15px;
          border: 3px solid var(--grey);

          .multiselect__tags-wrap .multiselect__tag {
            margin-bottom: 0px;
          }
        }

        .multiselect__tags-wrap {

          .multiselect__tag {
            // margin: 0px 5px 0px 0px;
          }
        }
      }
    }
  }

  .actions {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;

    .button {
      margin: 5px 10px;
    }
  }

}
</style>
