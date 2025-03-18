<template>
    <div class="average-x common-template-root">
        <div
            class="h-item common-screen-item"
            v-for="index in simplePlayerData.getMaxScreen()"
            :style="getStyle(getId(index))"
            :class="[getClass(getId(index))]"
            :key="getId(index)"
            :data-index="getId(index)"
            v-selected="getSelectedId(getId(index))"
            @mouseenter="mouseenterHandle"
            @mouseleave="mouseleaveHandle"
            @mouseup.left="mouseupHandle(getId(index))"
        >
            <slot :index="getId(index)"/>
        </div>
    </div>
</template>

<script>
import {MainMixin} from "./main.mixin";

export default {
    name: "average_x",
    mixins: [MainMixin],
    methods: {
        getClass() {
            // 仅支持1、4、9、16
            const { screenNum } = this.simplePlayerData.getCurrentScreenObj();
            return `h-item-${screenNum}`;
        },
        getStyle(id) {
            const { screenNum } = this.simplePlayerData.getCurrentScreenObj();
            return `display: ${id < screenNum?'block':'none'}`;
        }
    }
}
</script>

<style lang="scss" scoped>
@import "common";

.average-x {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;

    .h-item {
        position: relative;
    }

    .h-item-1 {
        width: 100%;
        height: 100%;
    }
    .h-item-4 {
        width: 50%;
        height: 50%;
    }
    .h-item-9 {
        width: 33.33%;
        height: 33.33%;
    }
    .h-item-16 {
        width: 25%;
        height: 25%;
    }
    .h-item-25 {
        width: 20%;
        height: 20%;
    }
}
</style>
