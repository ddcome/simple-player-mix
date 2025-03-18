<template>
    <div class="horizontal-1-2-multiply common-template-root">
        <div class="h-left common-screen-item"
             :data-index="0"
             v-selected="getSelectedId(0)"
             @mouseenter="mouseenterHandle"
             @mouseleave="mouseleaveHandle"
             @mouseup.left="mouseupHandle(0)"
        >
            <slot :index="0"/>
        </div>
        <div class="h-right common-screen-item"
             :data-index="1"
             v-selected="getSelectedId(1)"
             @mouseenter="mouseenterHandle"
             @mouseleave="mouseleaveHandle"
             @mouseup.left="mouseupHandle(1)"
        >
            <slot :index="1"/>
        </div>
    </div>
</template>

<script>
import {MainMixin} from "./main.mixin";

export default {
    name: "horizontal_1_2_multiply",
    mixins: [MainMixin],
}
</script>

<style lang="scss" scoped>
@import "common";

.horizontal-1-2-multiply {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;

    .h-left {
        width: 50%;
        height: 100%;
    }

    .h-right {
        width: 50%;
        height: 100%;
    }
}
</style>
