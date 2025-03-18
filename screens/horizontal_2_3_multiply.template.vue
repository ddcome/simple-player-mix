<template>
    <div class="horizontal-2-3-multiply common-template-root">
        <div
            class="h-item common-screen-item"
            v-for="index in 6"
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
    name: "horizontal_2_3_multiply",
    mixins: [MainMixin],
}
</script>

<style lang="scss" scoped>
@import "common";

.horizontal-2-3-multiply {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;

    .h-item {
        position: relative;
        width: 33.33%;
        height: 50%;
    }
}
</style>
