<template>
    <div class="other-3-1 common-template-root">
        <div
            class="o-top common-screen-item"
            :data-index="0"
            v-selected="getSelectedId(0)"
            @mouseenter="mouseenterHandle"
            @mouseleave="mouseleaveHandle"
            @mouseup.left="mouseupHandle(0)"
        >
            <slot :index="0"/>
        </div>
        <div class="o-bottom">
            <div
                class="o-bottom-item common-screen-item"
                :data-index="1"
                v-selected="getSelectedId(1)"
                @mouseenter="mouseenterHandle"
                @mouseleave="mouseleaveHandle"
                @mouseup.left="mouseupHandle(1)"
            >
                <slot :index="1"/>
            </div>
            <div
                class="o-bottom-item common-screen-item"
                :data-index="2"
                v-selected="getSelectedId(2)"
                @mouseenter="mouseenterHandle"
                @mouseleave="mouseleaveHandle"
                @mouseup.left="mouseupHandle(2)"
            >
                <slot :index="2"/>
            </div>
            <div
                class="o-bottom-item common-screen-item"
                :data-index="3"
                v-selected="getSelectedId(3)"
                @mouseenter="mouseenterHandle"
                @mouseleave="mouseleaveHandle"
                @mouseup.left="mouseupHandle(3)"
            >
                <slot :index="3"/>
            </div>
        </div>
    </div>
</template>

<script>
import {MainMixin} from "./main.mixin";

export default {
    name: "other_3_1",
    mixins: [MainMixin],
}
</script>

<style lang="scss" scoped>
@import "common";

.other-3-1 {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    flex-direction: column;

    .o-top,
    .o-bottom {
        position: relative;
        width: 100%;
        height: 50%;
    }

    .o-bottom {
        position: relative;
        display: flex;
        flex-direction: row;

        .o-bottom-item {
            width: 33.33%;
            height: 100%;
        }
    }
}
</style>
