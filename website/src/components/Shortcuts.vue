<template>
    <div class="shortcuts">
        <span v-if="leave" class="material-icons" @click="$emit('click', 'leave')">exit_to_app</span>
        <span v-if="del" class="delete material-icons" @click="$emit('click', 'delete')">delete</span>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    leave: {
        type: Boolean,
        default: false
    },
    del: {
        type: Boolean,
        default: false
    }
})
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
