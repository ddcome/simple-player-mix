<template>
    <div class="vertical-1-2 common-template-root" >
        <div class="v-top common-screen-item"
             :data-index="0"
             v-selected="getSelectedId(0)"
             @mouseenter="mouseenterHandle"
             @mouseleave="mouseleaveHandle"
             @mouseup.left="mouseupHandle(0)"
        >
            <slot :index="0"/>
        </div>
        <div class="v-bottom">
            <div class="v-bottom-item common-screen-item"
                 :data-index="1"
                 v-selected="getSelectedId(1)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(1)"
            >
                <slot :index="1"/>
            </div>
            <div class="v-bottom-item common-screen-item"
                 :data-index="2"
                 v-selected="getSelectedId(2)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(2)"
            >
                <slot :index="2"/>
            </div>
        </div>
    </div>
</template>

<script>
import {MainMixin} from "./main.mixin";

export default {
    name: "vertical_2_1",
    mixins: [MainMixin],
}
</script>

<style lang="scss" scoped>
@import "common";

.vertical-1-2 {
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

    .v-bottom {
        position: relative;
        display: flex;

        .v-bottom-item {
            width: 50%;
            height: 100%;
        }
    }
}
</style>
