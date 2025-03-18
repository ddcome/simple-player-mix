<template>
    <div class="try-and-see-layer" v-if="visible && isValid()" hikcc_cover="opaque">
        <div class="auth-wrap">
            <div class="auth-progress">
                <el-progress
                    type="circle"
                    :percentage="percentage"
                    :width="16"
                    :stroke-width="2"
                    color="#ff7200"
                    :show-text="false"
                />
            </div>
            <span class="auth-lock-second" :key="time">您可试看{{ time }}秒，剩余{{ lastCount() }}次。</span>
            <span v-if="hasApplyAuth()" class="auth-get-link" @click="applyNow()">立即申请权限</span>
        </div>
    </div>
</template>
<script>
import {CommonMixin} from "./mixin";
import {getSimplePlayerData} from './../lib/index'
import {ALL_LAYER_REF} from "./../components/PlayerLayer";
import {EVENT_TYPE, PLAYER_STATUS_MAP} from "./../lib/params.lib";
import {isNotEmpty, throttle} from "./../util";
import {errorLog} from "./../util/logger";

/**
* @function
* @description 试看次数图层
* @author lixiaodong31 2024/3/6
* @version 1.0.0
* @example
*/
export default {
    mixins: [CommonMixin],
    data() {
        return {
            percentage: 100,
            time: 0,
            id: null,
            id2: null,
        }
    },
    computed: {
        // 试看次数临界值
        minTimes() {
            return getSimplePlayerData().getLastMinTimes();
        },
        simplePlayerData() {
            return getSimplePlayerData();
        },
        wndStatus() {
            return getSimplePlayerData().getWndStatus(this.index);
        }
    },
    beforeDestroy() {
        this.clearTimers();
    },
    methods: {
        hasApplyAuth() {
            const hasApply = this.simplePlayerData.getHasApplyAuth();
            return (isNotEmpty(hasApply) && hasApply === true);
        },
        // 是否是合理单位内展示（剩余次数是负数不能展示该控件）
        isValid() {
            try {
                return this.lastCount() >= 0;
            } catch (e) {
                errorLog('show TRY_SEE_OVER Layer happened Error', e, this.lastCount());
                return false;
            }
        },
        // 实现mixin中定义的方法
        clear() {
            this.clearTimers();
        },
        // 清除所有定时器和延时器
        clearTimers() {
            clearTimeout(this.id2);
            clearInterval(this.id);
        },
        // 返回剩余次数文案
        lastCount() {
            if (this.simplePlayerData.isPreviewStatus(this.index)) {
                return this.simplePlayerData.getWndStatus(this.index, 'remainPreviewCount');
            } else {
                return this.simplePlayerData.getWndStatus(this.index, 'remainPlaybackCount');
            }
        },
        // 启动试看次数控件
        startTryTime() {
            const currentWndStatus = this.simplePlayerData.getWndStatus(this.index);
            this.clearTimers();
            if (
                (this.simplePlayerData.isPreviewStatus(this.index) && currentWndStatus.remainPreviewCount <= this.minTimes) ||
                (this.simplePlayerData.isPlaybackStatus(this.index) && currentWndStatus.remainPlaybackCount <= this.minTimes)) {
                this.clearLoopAndOpenApply();
                return; // 不够次数则返回
            }

            this.updateTrySeeTimes(); // 开启后，先要刷新试看次数
            this.id = setInterval(() => {
                this.time--;
                this.percentage = Math.round(this.time / this.simplePlayerData.getVideoTryTime() * 100)
                this.simplePlayerData.setWndStatus(this.index, 'lastSecond', this.time);
            }, 1000);
            this.simplePlayerData.setWndStatus(this.index, 'tickTimer', this.id);

            this.id2 = setTimeout(() => {
                this.clearLoopAndOpenApply();
            }, this.simplePlayerData.getVideoTryTime() * 1000);
        },
        // 该方法必须节流，短时间内组件的可能有多次初始化的需求，导致这个方法会被频繁触发
        updateTrySeeTimes: throttle(function () {
            // 主动抛出事件
            this.layerChange(
                EVENT_TYPE.TRY_SEE_OVER,
                {index: this.index, item: this.simplePlayerData.getPlayInfosForOuterByIndex(this.index)},
                ({previewAuth, remainPreviewCount, playbackAuth, remainPlaybackCount}) => {
                    // 外部没有调用方回传的参数，则提示错误
                    if ([previewAuth, remainPreviewCount, playbackAuth, remainPlaybackCount].every(c => !isNotEmpty(c))) {
                        errorLog('Params of callback function is error, You Must solve this problem! When you callback TRY_SEE_OVER event, you should put params like this', '{ previewAuth, remainPreviewCount, playbackAuth, remainPlaybackCount }');
                        return; // 如果回调不传参，则不存在更新数据的情况，此时终止
                    }
                    const currentWndStatus = this.simplePlayerData.getWndStatus(this.index);
                    // 接收外部调用方处理的。
                    if (isNotEmpty(previewAuth)) this.simplePlayerData.setWndStatus(this.index, 'previewAuth', previewAuth);
                    if (isNotEmpty(remainPreviewCount)) this.simplePlayerData.setWndStatus(this.index, 'remainPreviewCount', remainPreviewCount);
                    if (isNotEmpty(playbackAuth)) this.simplePlayerData.setWndStatus(this.index, 'playbackAuth', playbackAuth);
                    if (isNotEmpty(remainPlaybackCount)) this.simplePlayerData.setWndStatus(this.index, 'remainPlaybackCount', remainPlaybackCount);

                    // 检测剩余次数
                    if (
                        (this.simplePlayerData.isPreviewStatus(this.index) && currentWndStatus.remainPreviewCount <= this.minTimes) ||
                        (this.simplePlayerData.isPlaybackStatus(this.index) && currentWndStatus.remainPlaybackCount <= this.minTimes)) {
                        this.clearLoopAndOpenApply();
                    }
                }
            );
        }, 100),
        // 清除倒计时并且打开申请页
        clearLoopAndOpenApply() {
            clearInterval(this.id);
            clearTimeout(this.id2);
            // 停止播放
            this.close();
            this.openLayer(ALL_LAYER_REF.APPLY_AUTH_LAYER_REF);
        },
        // 立即申请
        applyNow() {
            this.layerChange(EVENT_TYPE.APPLY_AUTH, {index: this.index});
        },
        // 初始化，包括是否开启倒计时
        init() {
            this.time = this.simplePlayerData.getVideoTryTime();
            const {
                previewAuth,
                remainPreviewCount,
                playbackAuth,
                remainPlaybackCount,
                status
            } = this.simplePlayerData.getWndStatus(this.index);
            if (this.simplePlayerData.isPreviewStatus(this.index)) {
                if (previewAuth) {
                    this.close();
                    this.clearTimers();
                } else {
                    if (remainPreviewCount > this.minTimes) {
                        if (status === PLAYER_STATUS_MAP.PLAYING) {
                            this.open();
                            this.startTryTime();
                        }
                    } else { // 直接调起无权限Layer
                        this.close();
                        this.openLayer(ALL_LAYER_REF.APPLY_AUTH_LAYER_REF);
                    }
                }
            } else if (this.simplePlayerData.isPlaybackStatus(this.index)) {
                if (playbackAuth) {
                    this.close();
                    this.clearTimers();
                } else {
                    if (remainPlaybackCount > this.minTimes) {
                        if (status === PLAYER_STATUS_MAP.PLAYING) {
                            this.open();
                            this.startTryTime();
                        }
                    } else { // 直接调起无权限Layer
                        this.close();
                        this.openLayer(ALL_LAYER_REF.APPLY_AUTH_LAYER_REF);
                    }
                }
            }
        },
    }
}
</script>
<style lang="scss" scoped>
.try-and-see-layer {
    position: absolute;
    left: 8px;
    bottom: 8px;
    z-index: 103;

    .auth-wrap {
        height: 32px;
        box-sizing: border-box;
        line-height: 32px;
        background: #000000;
        font-size: 14px;
        padding-left: 6px;
        padding-right: 6px;
        display: flex;

        .auth-progress {
            display: inline-block;
            padding-top: 3px;
        }

        .auth-lock-second {
            height: 32px;
            line-height: 32px;
            padding-left: 8px;
            color: #ffffff;
        }

        .auth-get-link {
            height: 32px;
            line-height: 32px;
            color: #2080f7;
            text-decoration: underline;
            cursor: pointer;
            padding-right: 12px;
        }

        .auth-get-link:hover {
            opacity: 0.9;
        }
    }
}
</style>
