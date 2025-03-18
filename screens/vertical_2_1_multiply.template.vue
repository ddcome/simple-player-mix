<template>
    <div class="vertical-1-2-multiply common-template-root" >
        <div class="v-top common-screen-item"
             :data-index="0"
             v-selected="getSelectedId(0)"
             @mouseenter="mouseenterHandle"
             @mouseleave="mouseleaveHandle"
             @mouseup.left="mouseupHandle(0)"
        >
            <slot :index="0"/>
        </div>
        <div class="v-bottom common-screen-item"
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
    name: "vertical_2_1_multiply",
    mixins: [MainMixin],
}
</script>

<style lang="scss" scoped>
@import "common";

.vertical-1-2-multiply {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;

    .v-top,
    .v-bottom {
        position: relative;
        width: 100%;
        height: 50%;
    }
}
</style>
