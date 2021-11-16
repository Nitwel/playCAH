<template>
    <div class="user" :class="{ large, small, invite, xSmall }">
        <Avataaars
            v-if="!invite"
            class="image"
            avatar-style="Circle"
            v-bind="look"
            :random="false"
        />
        <img v-else class="invite" src="../assets/add.svg" alt="add" />
        <div v-if="name && !hideName" class="name">{{ name }}</div>
        <div v-if="!invite && user" class="info">
            <span class="title">Player info</span>
            <span>Name: {{ name }}</span>
            <span>Points: {{ user.points || 0 }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import Avataaars from "vuejs-avataaars-nitwel/src/Avataaars.vue";
// @ts-ignore
import { mouthTypes } from "vuejs-avataaars-nitwel/src/assetsTypes/mouth.js";
// @ts-ignore
import { eyeTypes } from "vuejs-avataaars-nitwel/src/assetsTypes/eyes.js";
// @ts-ignore
import { eyebrowTypes } from "vuejs-avataaars-nitwel/src/assetsTypes/eyebrows.js";
// @ts-ignore
import { clothesType } from "vuejs-avataaars-nitwel/src/assetsTypes/clothes.js";
// @ts-ignore
import { topTypes } from "vuejs-avataaars-nitwel/src/assetsTypes/top.js";
// @ts-ignore
import { accessoriesTypes } from "vuejs-avataaars-nitwel/src/assetsTypes/accessories.js";
// @ts-ignore
import { facialHairTypes } from "vuejs-avataaars-nitwel/src/assetsTypes/facial-hair.js";
// @ts-ignore
import { GraphicShirtTypes } from "vuejs-avataaars-nitwel/src/assetsTypes/graphic-shirt.js";
import {
    hairColors,
    skinColors,
    hatAndShirtColors,
// @ts-ignore
} from "vuejs-avataaars-nitwel/src/assetsTypes/colors.js";
import { computed } from "vue";
import { store } from "../store";

const types = {
    mouthType: mouthTypes,
    eyeType: eyeTypes,
    eyebrowType: eyebrowTypes,
    clotheType: clothesType,
    topType: topTypes,
    accessoriesType: accessoriesTypes,
    facialHairType: facialHairTypes,
    graphicType: GraphicShirtTypes,
    facialHairColor: hairColors,
    hairColor: hairColors,
    skinColor: skinColors,
    topColor: hatAndShirtColors,
    clotheColor: hatAndShirtColors,
};

const props = defineProps({
    name: {
        type: String,
        default: '',
        required: true,
    },
    hideName: {
        type: Boolean,
        default: false,
    },
    invite: {
        type: Boolean,
        default: false,
    },
    large: {
        type: Boolean,
        default: false,
    },
    small: {
        type: Boolean,
        default: false,
    },
    xSmall: {
        type: Boolean,
        default: false,
    },
})

const user = computed(() =>
    store.state.users.find((user) => user.name === props.name)
);

const look = computed(() => {
    const data = types;

    const look: Record<string, any> = {};

    Object.entries(data).forEach(([category, options], index) => {
        const optionList = Object.keys(options);
        const hashSection = parseInt(
            hash.value.substring(index * 2, index * 2 + 2)
        );

        look[category] = optionList[hashSection % optionList.length];
    });
    return look;
});

const hash = computed(() => {
    const targetLength = 24;
    let hash = "";
    let code = 9999;
    for (let i = 0; i < targetLength; i++) {
        code =
            (props.name.charCodeAt(i % props.name.length) + code) %
            (props.name.length + 178);

        const codeStr = "00" + (code % 100);
        hash += codeStr.substring(codeStr.length - 2);
    }
    return hash;
});

</script>
<style scoped lang="scss">
.user {
    --user-width: 180px;
    font-size: 35px;
    position: relative;

    &.large {
        --user-width: 250px;
        font-size: 50px;
    }

    &.small {
        --user-width: 100px;
        .name {
            display: none;
        }

        @media (max-width: 800px) {
            --user-width: 60px;
        }
    }

    &.xSmall {
        --user-width: 60px;
        .name {
            display: none;
        }

        @media (max-width: 800px) {
            --user-width: 40px;
        }
    }

    @media (max-width: 1000px) {
        --user-width: 100px;
        font-size: 25px;
    }

    @media (max-width: 800px) {
        --user-width: 60px;
        font-size: 20px;
    }

    &.invite {
        padding: 10px 5px 0px 5px;
        color: var(--dark-grey);
        cursor: pointer;

        &:active .invite {
            transform: scale(0.95);
        }

        .invite {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            width: var(--user-width);
            height: var(--user-width);
            display: flex;
            justify-content: center;
            align-items: center;

            .icon {
                font-size: 70px;
            }
        }
    }

    display: flex;
    flex-direction: column;
    align-items: center;

    .image {
        width: var(--user-width);
        filter: drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.25));
    }

    &:hover .info {
        display: flex;
    }

    .info {
        z-index: 300;
        position: absolute;
        top: 90%;
        left: 50%;
        background-color: var(--white);
        box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.2);
        display: none;
        transform: translate(-50%, 0%);

        padding: 8px 16px;
        flex-direction: column;
        border-radius: 5px;

        span {
            white-space: nowrap;
            font-size: 16px;

            &.title {
                font-size: 20px;
            }
        }
    }
}
</style>
