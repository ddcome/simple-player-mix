<template>
    <div class="other-1-12 common-template-root">
        <div class="o-top">
            <div class="o-top-item common-screen-item"
                 :data-index="1"
                 v-selected="getSelectedId(1)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(1)"
            >
                <slot :index="1"/>
            </div>
            <div class="o-top-item common-screen-item"
                 :data-index="2"
                 v-selected="getSelectedId(2)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(2)"
            >
                <slot :index="2"/>
            </div>
            <div class="o-top-item common-screen-item"
                 :data-index="3"
                 v-selected="getSelectedId(3)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(3)"
            >
                <slot :index="3"/>
            </div>
            <div class="o-top-item common-screen-item"
                 :data-index="4"
                 v-selected="getSelectedId(4)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(4)"
            >
                <slot :index="4"/>
            </div>
        </div>
        <div class="o-middle">
            <div class="o-left">
                <div class="o-left-item common-screen-item"
                     :data-index="5"
                     v-selected="getSelectedId(5)"
                     @mouseenter="mouseenterHandle"
                     @mouseleave="mouseleaveHandle"
                     @mouseup.left="mouseupHandle(5)"
                >
                    <slot :index="5"/>
                </div>
                <div class="o-left-item common-screen-item"
                     :data-index="7"
                     v-selected="getSelectedId(7)"
                     @mouseenter="mouseenterHandle"
                     @mouseleave="mouseleaveHandle"
                     @mouseup.left="mouseupHandle(7)"
                >
                    <slot :index="7"/>
                </div>
            </div>
            <div class="o-center common-screen-item"
                 :data-index="0"
                 v-selected="getSelectedId(0)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(0)"
            >
                <slot :index="0"/>
            </div>
            <div class="o-right">
                <div class="o-left-item common-screen-item"
                     :data-index="6"
                     v-selected="getSelectedId(6)"
                     @mouseenter="mouseenterHandle"
                     @mouseleave="mouseleaveHandle"
                     @mouseup.left="mouseupHandle(6)"
                >
                    <slot :index="6"/>
                </div>
                <div class="o-left-item common-screen-item"
                     :data-index="8"
                     v-selected="getSelectedId(8)"
                     @mouseenter="mouseenterHandle"
                     @mouseleave="mouseleaveHandle"
                     @mouseup.left="mouseupHandle(8)"
                >
                    <slot :index="8"/>
                </div>
            </div>
        </div>
        <div class="o-bottom">
            <div class="o-bottom-item common-screen-item"
                 :data-index="9"
                 v-selected="getSelectedId(9)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(9)"
            >
                <slot :index="9"/>
            </div>
            <div class="o-bottom-item common-screen-item"
                 :data-index="10"
                 v-selected="getSelectedId(10)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(10)"
            >
                <slot :index="10"/>
            </div>
            <div class="o-bottom-item common-screen-item"
                 :data-index="11"
                 v-selected="getSelectedId(11)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(11)"
            >
                <slot :index="11"/>
            </div>
            <div class="o-bottom-item common-screen-item"
                 :data-index="12"
                 v-selected="getSelectedId(12)"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(12)"
            >
                <slot :index="12"/>
            </div>
        </div>
    </div>
</template>

<script>
import {MainMixin} from "./main.mixin";

export default {
    name: "other_1_12",
    mixins: [MainMixin],
}
</script>

<style lang="scss" scoped>
@import "common";

.other-1-12 {
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
        height: 25%;
    }

    .o-middle {
        position: relative;
        width: 100%;
        height: 50%;
        display: flex;
        flex-direction: row;

        .o-left, .o-right {
            width: 25%;
            height: 100%;
            position: relative;
            display: flex;
            flex-direction: column;

            .o-left-item,
            .o-right-item {
                width: 100%;
                height: 50%;
                position: relative;
            }
        }

        .o-center {
            width: 50%;
            height: 100%;
            position: relative;
        }
    }

    .o-top {
        position: relative;
        display: flex;
        flex-direction: row;

        .o-top-item {
            width: 25%;
            height: 100%;
        }
    }

    .o-bottom {
        position: relative;
        display: flex;
        flex-direction: row;

        .o-bottom-item {
            width: 25%;
            height: 100%;
        }
    }
}
</style>
