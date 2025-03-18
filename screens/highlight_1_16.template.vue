<template>
    <div class="highlight-1-16 common-template-root">
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
                <div class="hl-right-item common-screen-item"
                     :data-index="4"
                     v-selected="getSelectedId(4)"
                     @mouseenter="mouseenterHandle"
                     @mouseleave="mouseleaveHandle"
                     @mouseup.left="mouseupHandle(4)"
                >
                    <slot :index="4"/>
                </div>
                <div class="hl-right-item common-screen-item"
                     :data-index="5"
                     v-selected="getSelectedId(5)"
                     @mouseenter="mouseenterHandle"
                     @mouseleave="mouseleaveHandle"
                     @mouseup.left="mouseupHandle(5)"
                >
                    <slot :index="5"/>
                </div>
                <div class="hl-right-item common-screen-item"
                     :data-index="6"
                     v-selected="getSelectedId(6)"
                     @mouseenter="mouseenterHandle"
                     @mouseleave="mouseleaveHandle"
                     @mouseup.left="mouseupHandle(6)"
                >
                    <slot :index="6"/>
                </div>
            </div>
        </div>
        <div class="hl-bottom">
            <div class="hl-bottom-item common-screen-item"
                 :data-index="7"
                 v-selected="getSelectedId(7)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(7)"
            >
                <slot :index="7"/>
            </div>
            <div class="hl-bottom-item common-screen-item"
                 :data-index="8"
                 v-selected="getSelectedId(8)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(8)"
            >
                <slot :index="8"/>
            </div>
            <div class="hl-bottom-item common-screen-item"
                 :data-index="9"
                 v-selected="getSelectedId(9)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(9)"
            >
                <slot :index="9"/>
            </div>
            <div class="hl-bottom-item common-screen-item"
                 :data-index="10"
                 v-selected="getSelectedId(10)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(10)"
            >
                <slot :index="10"/>
            </div>
            <div class="hl-bottom-item common-screen-item"
                 :data-index="11"
                 v-selected="getSelectedId(11)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(11)"
            >
                <slot :index="11"/>
            </div>
            <div class="hl-bottom-item common-screen-item"
                 :data-index="12"
                 v-selected="getSelectedId(12)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(12)"
            >
                <slot :index="12"/>
            </div>
            <div class="hl-bottom-item common-screen-item"
                 :data-index="13"
                 v-selected="getSelectedId(13)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(13)"
            >
                <slot :index="13"/>
            </div>
            <div class="hl-bottom-item common-screen-item"
                 :data-index="14"
                 v-selected="getSelectedId(14)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(14)"
            >
                <slot :index="14"/>
            </div>
            <div class="hl-bottom-item common-screen-item"
                 :data-index="15"
                 v-selected="getSelectedId(15)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(15)"
            >
                <slot :index="15"/>
            </div>
            <div class="hl-bottom-item common-screen-item"
                 :data-index="16"
                 v-selected="getSelectedId(16)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(16)"
            >
                <slot :index="16"/>
            </div>
        </div>
    </div>
</template>

<script>
import {MainMixin} from "./main.mixin";

export default {
    name: "highlight_1_16",
    mixins: [MainMixin],
}
</script>

<style lang="scss" scoped>
@import "common";

.highlight-1-16 {
    position: relative;
    width: 100%;
    height: 100%;

    .hl-top {
        position: relative;
        width: 100%;
        height: 60%;
        display: flex;
        flex-direction: row;

        .hl-left {
            width: 60%;
            height: 100%;
        }

        .hl-right {
            position: relative;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            height: 100%;
            width: 40%;

            .hl-right-item {
                height: 33.33%;
                width: 50%;
            }
        }
    }

    .hl-bottom {
        position: relative;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        height: 40%;
        width: 100%;

        .hl-bottom-item {
            width: 20%;
            height: 50%;
        }
    }
}
</style>
