<template>
    <div
        class="highlight-1-5 common-template-root"
    >
        <div class="hl-top">
            <div class="hl-left common-screen-item"
                 v-selected="getSelectedId(0)"
                 :data-index="0"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(0)"
            >
                <slot :index="0"/>
            </div>
            <div class="hl-right">
                <div class="hl-right-item common-screen-item"
                     v-selected="getSelectedId(1)"
                     :data-index="1"
                     @mouseenter="mouseenterHandle"
                     @mouseleave="mouseleaveHandle"
                     @mouseup.left="mouseupHandle(1)"
                >
                    <slot :index="1"/>
                </div>
                <div class="hl-right-item common-screen-item"
                     v-selected="getSelectedId(2)"
                     :data-index="2"
                     @mouseenter="mouseenterHandle"
                     @mouseleave="mouseleaveHandle"
                     @mouseup.left="mouseupHandle(2)"
                >
                    <slot :index="2"/>
                </div>
            </div>
        </div>
        <div class="hl-bottom">
            <div class="hl-bottom-item common-screen-item"
                 v-selected="getSelectedId(3)"
                 :data-index="3"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(3)"
            >
                <slot :index="3"/>
            </div>
            <div class="hl-bottom-item common-screen-item"
                 v-selected="getSelectedId(4)"
                 :data-index="4"
                 @mouseenter="mouseenterHandle"
                 @mouseleave="mouseleaveHandle"
                 @mouseup.left="mouseupHandle(4)"
            >
                <slot :index="4"/>
            </div>
            <div class="hl-bottom-item common-screen-item"
                 v-selected="getSelectedId(5)"
                 :data-index="5"
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

/**
 * 模板组件
 * @author lixiaodong31 2024/8/5
 * @version 1.0.0
 * @example
 * 模板编写规则：
 * 1、需要混入MainMixin
 * 2、窗口节点class名为common-screen-item需要定义明确的data-index，窗口编号
 * 3、窗口节点class name必须包含common-screen-item
 */
export default {
    name: "highlight_1_5",
    mixins: [MainMixin],
}
</script>

<style lang="scss" scoped>
@import "common";

.highlight-1-5 {
    position: relative;
    width: 100%;
    height: 100%;

    .hl-top {
        position: relative;
        width: 100%;
        height: 66.67%;
        display: flex;
        flex-direction: row;

        .hl-left {
            width: 66.67%;
            height: 100%;
        }

        .hl-right {
            position: relative;
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 33.33%;

            .hl-right-item {
                height: 50%;
                width: 100%;
            }
        }
    }

    .hl-bottom {
        position: relative;
        display: flex;
        flex-direction: row;
        height: 33.33%;
        width: 100%;

        .hl-bottom-item {
            width: 33.33%;
            height: 100%;
        }
    }
}
</style>
