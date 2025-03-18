<template>
    <div v-if="visible" class="ptz-compass" hikcc_cover="opaque" v-drag :style="{ left, top }">
        <div class="inner-top">
            <span>云台控制</span>
            <svg-i :size="24" :hover-color="hover" icon="close" @click.native="close"/>
        </div>
        <div class="inner-middle">
            <div class="compass-outer">
                <svg-i class="direction direction-top" :size="32" :hover-color="hover" :active-color="press"
                       :active="hover" icon="compass-top"
                       @mousedown.native.stop="ptzHandle(EVENT_TYPE.PTZ_TOP, 0)"
                       @mouseup.native.stop="ptzHandle(EVENT_TYPE.PTZ_TOP, 1)"
                />
                <svg-i class="direction direction-left" :size="32" :hover-color="hover" :active-color="press"
                       :active="hover" icon="compass-top"
                       @mousedown.native.stop="ptzHandle(EVENT_TYPE.PTZ_LEFT, 0)"
                       @mouseup.native.stop="ptzHandle(EVENT_TYPE.PTZ_LEFT, 1)"
                />
                <svg-i class="direction direction-right" :size="32" :hover-color="hover" :active-color="press"
                       :active="hover" icon="compass-top"
                       @mousedown.native.stop="ptzHandle(EVENT_TYPE.PTZ_RIGHT, 0)"
                       @mouseup.native.stop="ptzHandle(EVENT_TYPE.PTZ_RIGHT, 1)"
                />
                <svg-i class="direction direction-bottom" :size="32" :hover-color="hover" :active-color="press"
                       :active="hover" icon="compass-top"
                       @mousedown.native.stop="ptzHandle(EVENT_TYPE.PTZ_BOTTOM, 0)"
                       @mouseup.native.stop="ptzHandle(EVENT_TYPE.PTZ_BOTTOM, 1)"
                />
                <svg-i class="direction direction-left-top" :size="40" :hover-color="hover" :active-color="press"
                       :active="hover" icon="compass-left-top"
                       @mousedown.native.stop="ptzHandle(EVENT_TYPE.PTZ_LEFT_TOP, 0)"
                       @mouseup.native.stop="ptzHandle(EVENT_TYPE.PTZ_LEFT_TOP, 1)"
                />
                <svg-i class="direction direction-right-top" :size="40" :hover-color="hover" :active-color="press"
                       :active="hover" icon="compass-left-top"
                       @mousedown.native.stop="ptzHandle(EVENT_TYPE.PTZ_RIGHT_TOP, 0)"
                       @mouseup.native.stop="ptzHandle(EVENT_TYPE.PTZ_RIGHT_TOP, 1)"
                />
                <svg-i class="direction direction-left-bottom" :size="40" :hover-color="hover" :active-color="press"
                       :active="hover" icon="compass-left-top"
                       @mousedown.native.stop="ptzHandle(EVENT_TYPE.PTZ_LEFT_BOTTOM, 0)"
                       @mouseup.native.stop="ptzHandle(EVENT_TYPE.PTZ_LEFT_BOTTOM, 1)"
                />
                <svg-i class="direction direction-right-bottom" :size="40" :hover-color="hover" :active-color="press"
                       :active="hover" icon="compass-left-top"
                       @mousedown.native.stop="ptzHandle(EVENT_TYPE.PTZ_RIGHT_BOTTOM, 0)"
                       @mouseup.native.stop="ptzHandle(EVENT_TYPE.PTZ_RIGHT_BOTTOM, 1)"
                />
            </div>
        </div>
        <div class="inner-bottom">
            <el-button  @mousedown.native.stop="ptzHandle(EVENT_TYPE.PTZ_OUT_OF_FOCUS, 0)"
                        @mouseup.native.stop="ptzHandle(EVENT_TYPE.PTZ_OUT_OF_FOCUS, 1)">
                <svg-i :size="24" :hover-color="hover" :active-color="press"
                       :active="hover" icon="compass-unfocus"
                />
                聚焦-
            </el-button>
            <el-button @mousedown.native.stop="ptzHandle(EVENT_TYPE.PTZ_FOCUS, 0)"
                       @mouseup.native.stop="ptzHandle(EVENT_TYPE.PTZ_FOCUS, 1)">
                <svg-i :size="24" :hover-color="hover" :active-color="press"
                       :active="hover" icon="compass-focus"
                />
                聚焦+
            </el-button>
        </div>
    </div>
</template>

<script>
import SvgI from './SvgI';
import {EVENT_TYPE} from "./../lib/params.lib";

export default {
    components: {SvgI},
    data() {
        return {
            EVENT_TYPE,
            index: null,
            visible: false,
            normal: '#ffffff',
            hover: '#ffffff',
            press: '#ffffff',
            left: '',
            top: '',
        };
    },
    // 自定义指令 实现可拖动
    directives: {
        drag(el, bindings) {
            el.onmousedown = function (e) {
                const disX = e.pageX - el.offsetLeft;
                const disY = e.pageY - el.offsetTop;
                document.onmousemove = function (e) {
                    el.style.left = e.pageX - disX + 'px';
                    el.style.top = e.pageY - disY + 'px';
                    this.left = el.style.left;
                    this.top = el.style.top;
                }
                document.onmouseup = function () {
                    document.onmousemove = document.onmouseup = null;
                }
            }
        }
    },
    methods: {
        open(index) {
            this.index = index;
            this.visible = true;
        },
        close() {
            this.visible = false;
        },
        ptzHandle(type, mouseAction) {
            this.$emit('operate', this.index, type, mouseAction);
        }
    }
}
</script>

<style lang="scss" scoped>
.ptz-compass {
    width: 239px;
    height: 272px;
    border-radius: 2px;
    background-color: rgb(44, 45, 48);
    position: fixed;
    z-index: 3000;
    right: 50px;
    bottom: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;

    .inner-top {
        width: 100%;
        height: 20px;
        margin-bottom: 16px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        cursor: move;

        span {
            color: #fff;
            font-family: Microsoft YaHei UI;
            font-weight: 400;
            font-size: 14px;
            justify-content: flex-start;
        }
    }

    .inner-middle {
        margin-bottom: 24px;

        .compass-outer {
            position: relative;
            width: 133px;
            height: 133px;
            border-radius: 133px;
            background-color: rgb(51, 52, 56);
            border: 1px solid rgba(255, 255, 255, 0.1);

            .direction {
                position: absolute;
            }

            .direction-top {
                top: 4px;
                left: 50%;
                margin-left: -16px;
            }

            .direction-left {
                top: 50%;
                left: 4px;
                margin-top: -16px;
                transform: rotate(270deg);
            }

            .direction-right {
                top: 50%;
                right: 4px;
                margin-top: -16px;
                transform: rotate(90deg);
            }

            .direction-bottom {
                left: 50%;
                bottom: 4px;
                margin-left: -16px;
                transform: rotate(180deg);
            }

            .direction-left-top {
                top: 25%;
                left: 25%;
                margin-top: -20px;
                margin-left: -20px;
            }

            .direction-right-top {
                top: 25%;
                right: 25%;
                margin-top: -20px;
                margin-right: -20px;
                transform: rotate(90deg);
            }

            .direction-left-bottom {
                bottom: 25%;
                left: 25%;
                margin-bottom: -20px;
                margin-left: -20px;
                transform: rotate(270deg);
            }

            .direction-right-bottom {
                bottom: 25%;
                right: 25%;
                margin-bottom: -20px;
                margin-right: -20px;
                transform: rotate(180deg);
            }
        }

    }

    .inner-bottom {
        ::v-deep .el-button {
            padding: 0 8px;
            min-width: 75px;
            color: rgba(255, 255, 255, 0.85);
            background-color: unset;
            border: 1px	solid rgba(255, 255, 255, 0.12);
            span {
                width: 100%;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
            }
            &:hover,
            &:active {
                background-color: #1f1f1f;
                span {
                    color: #fff;
                }
            }
        }
    }
}
</style>
