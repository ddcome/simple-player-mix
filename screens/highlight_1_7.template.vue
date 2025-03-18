<template>
    <div class="highlight-1-7 common-template-root">
        <div class="hl-top">
            <div class="hl-left common-screen-item"
                 :data-index="0"
                 v-selected="getSelectedId(0)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(0)"
            >
                <slot :index="0"/>
            </div>
            <div class="hl-right">
                <div class="hl-right-item common-screen-item"
                     :data-index="1"
                     v-selected="getSelectedId(1)"
                     @mouseenter="mouseenterHandle"
                     @mouseleave="mouseleaveHandle"
                     @mouseup.left="mouseupHandle(1)"
                >
                    <slot :index="1"/>
                </div>
                <div class="hl-right-item common-screen-item"
                     :data-index="2"
                     v-selected="getSelectedId(2)"
                     @mouseenter="mouseenterHandle"
                     @mouseleave="mouseleaveHandle"
                     @mouseup.left="mouseupHandle(2)"
                >
                    <slot :index="2"/>
                </div>
                <div class="hl-right-item common-screen-item"
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
        <div class="hl-bottom">
            <div class="hl-bottom-item common-screen-item"
                 :data-index="4"
                 v-selected="getSelectedId(4)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(4)"
            >
                <slot :index="4"/>
            </div>
            <div class="hl-bottom-item common-screen-item"
                 :data-index="5"
                 v-selected="getSelectedId(5)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(5)"
            >
                <slot :index="5"/>
            </div>
            <div class="hl-bottom-item common-screen-item"
                 :data-index="6"
                 v-selected="getSelectedId(6)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(6)"
            >
                <slot :index="6"/>
            </div>
            <div class="hl-bottom-item common-screen-item"
                 :data-index="7"
                 v-selected="getSelectedId(7)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(7)"
            >
                <slot :index="7"/>
            </div>
        </div>
    </div>
</template>

<script>
import {MainMixin} from "./main.mixin";

export default {
    name: "highlight_1_7",
    mixins: [MainMixin],
}
</script>

<style lang="scss" scoped>
@import "common";

.highlight-1-7 {
    position: relative;
    width: 100%;
    height: 100%;

    .hl-top {
        position: relative;
        width: 100%;
        height: 75%;
        display: flex;
        flex-direction: row;

        .hl-left {
            width: 75%;
            height: 100%;
        }

        .hl-right {
            position: relative;
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 25%;

            .hl-right-item {
                height: 33.33%;
                width: 100%;
            }
        }
    }

    .hl-bottom {
        position: relative;
        display: flex;
        flex-direction: row;
        height: 25%;
        width: 100%;

        .hl-bottom-item {
            width: 25%;
            height: 100%;
        }
    }
}
</style>

