<template>
    <div class="editor">
        <div class="header">
            <div class="title">Deck Creator</div>
            <el-button @click="loadFile">Load File</el-button>
            <el-button @click="saveFile">Save File</el-button>
            <el-input class="deck-title" v-model="deckTitle"></el-input>
            <input @change="readFile" type="file" id="upload" accept=".deck" />
            <a id="download" :download="deckTitle + '.deck'"></a>
        </div>
        <div class="cards">
            <div class="white-cards">
                <span>White Cards</span>
                <el-button @click="addCard(false)" type="primary">Add Card</el-button>
            </div>
            <div class="card-list white">
                <Card
                    v-for="(card, index) in whiteCards"
                    :key="index"
                    :modelValue="whiteCards[index]"
                    @update:modelValue="updateCard(index, $event, false)"
                >
                    <el-button
                        class="delete"
                        icon="el-icon-delete"
                        @click="removeCard(index, false)"
                        circle
                        type="danger"
                    ></el-button>
                </Card>
            </div>
            <div class="black-cards">
                <span>Black Cards</span>
                <el-button @click="addCard(true)" type="primary">Add Card</el-button>
            </div>
            <div class="card-list black">
                <div class="black-box" v-for="(card, index) in blackCards" :key="index">
                    <Card
                        :modelValue="blackCards[index].text"
                        @update:modelValue="updateCard(index, $event, true)"
                        black
                    >
                        <el-button
                            class="delete"
                            icon="el-icon-delete"
                            @click="removeCard(index, true)"
                            circle
                            type="danger"
                        ></el-button>
                    </Card>
                    <el-input-number
                        class="pick"
                        :min="1"
                        :max="3"
                        v-model="blackCards[index].pick"
                    ></el-input-number>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getFiles } from '../util/getFiles'
import Input from '../components/Input.vue';
import { clone, cloneDeep } from 'lodash';

const deckTitle = ref("MyDeck")
const text = ref("Hiia")
const whiteCards = ref([""]);
const blackCards = ref<{ text: string, pick: number }[]>([{ text: "", pick: 1 }]);

function updateCard(index: number, value: string, isBlack: boolean) {
    value = value.trim().replace(/_{1,}/g, '____')
    if (isBlack) blackCards.value[index].text = value
    else whiteCards.value[index] = value
}

function addCard(isBlack: boolean) {
    if (isBlack) blackCards.value.unshift({ text: "", pick: 1 })
    else whiteCards.value.unshift("")
}

function removeCard(index: number, isBlack: boolean) {
    if (isBlack) blackCards.value.splice(index, 1);
    else whiteCards.value.splice(index, 1);
}

function loadFile() {
    document.getElementById('upload')?.click()
}

function saveFile() {
    const a = document.getElementById('download')
    const black = cloneDeep(blackCards.value).map(card => {
        card.text = card.text.trim().replace(/_{1,}/g, '_')
        return card
    })

    const text = JSON.stringify({ blackCards: black, whiteCards: whiteCards.value })
    a?.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(text))
    a?.click()
}

async function readFile(event: Event) {
    const target = event.target as HTMLInputElement
    if (!target.files || target.files?.length < 1) return
    const file = target.files[0]

    deckTitle.value = file.name.replace('.deck', '')

    const decks = await getFiles(file)

    const { blackCards: black, whiteCards: white } = decks[0]
    blackCards.value = black
    whiteCards.value = white

    blackCards.value = blackCards.value.map(card => {
        card.text = card.text.trim().replace(/_{1,}/g, '____')
        return card
    })
}
</script>

<style lang="scss" scoped>
.editor {
    height: 100%;
    width: 100%;
    padding: 0 10px;
    display: flex;
    flex-direction: column;
}

.header {
    display: flex;
    gap: 10px;
    align-items: center;
    margin: 20px 0;
    .title {
        font-size: 32px;
        white-space: nowrap;
    }
}

.black-cards,
.white-cards {
    display: flex;
    align-items: center;
    margin-top: 10px;
    span {
        font-size: 24px;
        margin-right: 10px;
    }
}

.card-list {
    padding: 15px 0;
    display: flex;
    gap: 20px;
    overflow: auto;

    .card {
        transform: scale(0.9);
        flex: 0 0 auto;

        .delete {
            position: absolute;
            bottom: 0;
            right: 0;
            transform: translate(30%, 30%);
        }
    }
}

.black-box {
    .pick {
        margin-top: 10px;
    }
}

.deck-title {
    max-width: 300px;
}

#upload,
#download {
    display: none;
}
</style>