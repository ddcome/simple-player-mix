<template>
    <div class="horizontal-1-4 common-template-root">
        <div class="h-left common-screen-item"
             :data-index="0"
             v-selected="getSelectedId(0)"
             @mouseenter="mouseenterHandle"
             @mouseleave="mouseleaveHandle"
             @mouseup.left="mouseupHandle(0)"
        >
            <slot :index="0"/>
        </div>
        <div class="h-right">
            <div class="h-right-item common-screen-item"
                 :data-index="1"
                 v-selected="getSelectedId(1)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(1)"
            >
                <slot :index="1"/>
            </div>
            <div class="h-right-item common-screen-item"
                 :data-index="2"
                 v-selected="getSelectedId(2)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(2)"
            >
                <slot :index="2"/>
            </div>
            <div class="h-right-item common-screen-item"
                 :data-index="3"
                 v-selected="getSelectedId(3)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(3)"
            >
                <slot :index="3"/>
            </div>
            <div class="h-right-item common-screen-item"
                 :data-index="4"
                 v-selected="getSelectedId(4)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(4)"
            >
                <slot :index="4"/>
            </div>
        </div>
    </div>
</template>

<script>
import {MainMixin} from "./main.mixin";

export default {
    name: "horizontal_1_4",
    mixins: [MainMixin],
}
</script>

<style lang="scss" scoped>
@import "common";

.horizontal-1-4 {
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
        position: relative;
        width: 50%;
        height: 100%;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;

        .h-right-item {
            width: 50%;
            height: 50%;
        }
    }
}
</style>
