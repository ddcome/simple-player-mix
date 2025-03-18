<template>
    <div class="other-4-3-multiply common-template-root" >
        <div
            class="o-item common-screen-item"
            v-for="index in 12"
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
    name: "other_4_3_multiply",
    mixins: [MainMixin],
}
</script>

<style lang="scss" scoped>
@import "common";
.other-4-3-multiply {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    .o-item {
        position: relative;
        width: 33.3%;
        height: 25%;
    }
}
</style>
