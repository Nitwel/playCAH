<template>
  <div class="lobby">
    <div class="title">Lobby</div>
    <div class="users">
      <div v-for="user in users" :key="user.name" class="user">
        <User :name="user.name" />
        <span
          v-if="endLobby && user.trophy"
          class="tropy material-icons"
          :class="user.trophy"
          >emoji_events</span
        >
        <span v-if="endLobby" class="points">{{ user.points }} Points</span>
      </div>
      <User
        v-if="!endLobby"
        name="invite"
        class="invite"
        invite
        @click="copyLink"
      />
      <textarea id="lobby-link" />
    </div>
    <div class="settings" label-position="top">
      <div>
        <label>Card Decks</label>
        <el-button size="small" @click="editPacks = true">Edit decks</el-button>
        <el-tag v-for="deck in selected" :key="deck" closable @close="toggleDeck(deck)">{{deck}}</el-tag>
      </div>
      <div>
        <label>Language</label>
        <el-select
          v-model="language"
          placeholder="Select Language"
          :disabled="host === false"
        >
          <el-option
            v-for="lang in languages"
            :key="lang"
            :label="lang"
            :value="lang"
          >
          </el-option>
        </el-select>
      </div>
      <div>
        <label>Points to win</label>
        <el-input-number
          v-model="pointsToWin"
          :disabled="host === false"
          :min="1"
        />
      </div>
      <div>
        <label>Hand size</label>
        <el-input-number
          :min="3"
          :max="20"
          v-model="handSize"
          :disabled="host === false"
        />
      </div>
      <div v-if="host" class="actions">
        <el-button @click="saveSettings"> Save Settings </el-button>
        <el-button @click="onClick" type="primary">
          {{ endLobby ? "Next Round" : "Start" }}
        </el-button>
      </div>
    </div>
    <el-drawer size="600px" title="Card Decks" v-model="editPacks" :modal="false">
      <div class="deck-list">
        <div class="scroll">
          <el-card v-for="deck in cardDecks" :key="deck.value" @click="toggleDeck(deck.value)">
            <el-checkbox :model-value="selected.includes(deck.value)" @change="toggleDeck(deck.value)"></el-checkbox>
            <label>{{deck.name}}</label>  
          </el-card>
        </div>
        <div class="drawer-actions">
          <el-button type="primary">Upload Card Deck</el-button>
          <input @change="readFile" type="file" id="upload" />
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import { computed, ref } from "vue";
import { cardDecks } from "../cardDecks";
import { useStore } from "../store";
import { notify } from "../setup";

export default {
  name: "Lobby",
  components: {},
  props: {
    name: {
      type: String,
    },
  },
  setup(props) {
    const languages = ref(["en", "de"]);
    const store = useStore();
    const editPacks = ref(false)

    const handSize = computed({
      get() {
        return store.state.handSize;
      },
      set(handSize: number) {
        store.state.handSize = handSize;
      },
    });

    const pointsToWin = computed({
      get() {
        return store.state.pointsToWin;
      },
      set(points: number) {
        store.state.pointsToWin = points;
      },
    });

    const selected = computed({
      get() {
        return cardDecks
          .filter((deck) => store.state.cardDecks.includes(deck.value))
          .map((deck) => deck.value);
      },
      set(val: string[]) {
        store.commit("setCardDecks", val);
      },
    });

    const language = computed({
      get() {
        return store.state.language;
      },
      set(val: string) {
        store.commit("setLanguage", val);
      },
    });

    const link = computed(() => window.location.href);

    const readonlyDecks = computed(() =>
      cardDecks
        .filter((deck) => store.state.cardDecks.includes(deck.value))
        .map((deck) => deck.name)
    );

    const host = computed(() => store.state.host === store.state.name);

    const endLobby = computed(() => store.state.endLobby);

    const users = computed(() => {
      const users = store.state.users;
      if (endLobby.value) {
        const sorted = [...users];
        const ranks = ["gold", "silver", "bronze"];

        sorted.sort((a, b) => b.points - a.points);

        users.forEach((user) => {
          for (let i = 0; i < 3 && i < sorted.length; i++) {
            if (user.name === sorted[i].name) user.trophy = ranks[i];
          }
        });
      }
      return users;
    });

    return {
      pointsToWin,
      handSize,
      languages,
      selected,
      language,
      readonlyDecks,
      host,
      endLobby,
      users,
      saveSettings,
      onClick,
      copyLink,
      cardDecks,
      editPacks,
      toggleDeck
    };

    function toggleDeck(deck: string) {
      if(selected.value.includes(deck)) selected.value = selected.value.filter(val => val !== deck)
      else selected.value = [...selected.value, deck]
    }

    function saveSettings() {
      store.dispatch("change_settings", {
        points_to_win: pointsToWin.value,
        card_decks: selected.value,
        hand_size: handSize.value,
        language: language.value,
      });
    }
    function onClick() {
      store.dispatch("start_game");
    }

    function copyLink() {
      const element = document.getElementById("lobby-link");
      if (element === null) return;

      if (element instanceof HTMLTextAreaElement) {
        element.value = link.value;
        element.select();
        document.execCommand("copy");
        notify(
          "Link Copied",
          "The link has been copied to your clipboard.",
          "success"
        );
      }
    }
  },
};
</script>

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

      .gold {
        color: var(--gold);
      }
      .silver {
        color: var(--silver);
      }
      .bronze {
        color: var(--bronze);
      }
    }
  }

  ::v-deep(.el-drawer__body) {
    height: calc(100% - 78px);
  }

  .deck-list {
     height: 100%;
    display: flex;
    flex-direction: column;

    .scroll {
      padding: 0 20px;
      overflow: auto;
      height: 100%;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .drawer-actions {
      padding: 16px;
    }

    ::v-deep(.el-card__body) {
      padding: 10px 20px;
    }

    ::v-deep(.el-checkbox) {
      margin-right: 15px;
    }
  }

  .settings {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
    font-size: 25px;

    @media (max-width: 1000px) {
      font-size: 25px;
    }

    @media (max-width: 800px) {
      font-size: 20px;
    }

    > div {
      margin-bottom: 10px;
    }

    label,& > div {
      display: block;
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
