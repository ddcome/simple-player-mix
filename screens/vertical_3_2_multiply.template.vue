<template>
    <div class="vertical-3-2-multiply common-template-root" >
        <div
            class="v-item common-screen-item"
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
    name: "vertical_3_2_multiply",
    mixins: [MainMixin],
}
</script>

<style lang="scss" scoped>
@import "common";
.vertical-3-2-multiply {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;

    .v-item {
        position: relative;
        width: 33.33%;
        height: 50%;
    }
}
</style>
