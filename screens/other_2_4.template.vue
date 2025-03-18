<template>
    <div class="other-2-4 common-template-root">
        <div class="o-top">
            <div class="o-top-item common-screen-item"
                 :data-index="0"
                 v-selected="getSelectedId(0)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(0)"
            >
                <slot :index="0"/>
            </div>
            <div class="o-top-item common-screen-item"
                 :data-index="1"
                 v-selected="getSelectedId(1)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(1)"
            >
                <slot :index="1"/>
            </div>
        </div>
        <div class="o-bottom">
            <div class="o-bottom-item common-screen-item"
                 :data-index="2"
                 v-selected="getSelectedId(2)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(2)"
            >
                <slot :index="2"/>
            </div>
            <div class="o-bottom-item common-screen-item"
                 :data-index="3"
                 v-selected="getSelectedId(3)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(3)"
            >
                <slot :index="3"/>
            </div>
            <div class="o-bottom-item common-screen-item"
                 :data-index="4"
                 v-selected="getSelectedId(4)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(4)"
            >
                <slot :index="4"/>
            </div>
            <div class="o-bottom-item common-screen-item"
                 :data-index="5"
                 v-selected="getSelectedId(5)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(5)"
            >
                <slot :index="5"/>
            </div>
        </div>
    </div>
</template>

<script>
import {MainMixin} from "./main.mixin";

export default {
    name: "other_2_4",
    mixins: [MainMixin],
}
</script>

<style lang="scss" scoped>
@import "common";

.other-2-4 {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .o-top,
    .o-bottom {
        position: relative;
        width: 100%;
        height: 50%;
    }

    .o-top {
        position: relative;
        display: flex;
        flex-direction: row;

        .o-top-item {
            width: 50%;
            height: 100%;
        }
    }

    .o-bottom {
        position: relative;
        display: flex;
        background-color: #555555;
        flex-direction: row;
        flex-wrap: wrap;

        .o-bottom-item {
            width: 50%;
            height: 50%;
        }
    }
}
</style>
