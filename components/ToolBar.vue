<template>
    <div class="tool-bar-outer">
        <el-progress
            v-if="showPagerAndTimer()"
            hikcc_cover="opaque"
            :percentage="percentageNum"
            :show-text="false"
            :stroke-width="4"
            color="#767676"
            class="play-batch-progress"
        />
        <div class="tool-bar">
            <div class="left-part">
                <svg-i
                    title="全部关闭"
                    icon="close-all"
                    hover-color="#fff"
                    @click.native="closeAllIconChange"
                />
            </div>
            <div v-if="showPagerAndTimer()" class="middle-polling">
                <div class="percent-time" :title="getPaginationTitle()">{{ screenNumShow() }}</div>
                <svg-i
                    title="上一页视频"
                    icon="pre-page-small"
                    :font-size="2"
                    :disabled="preBtnDisable()"
                    @click.native="!preBtnDisable() && prePageVideo()"
                />
                <svg-i
                    class="start-i"
                    :title="!loopFlag ? '开启循环播放' : '停止循环播放'"
                    :icon="loopFlag?'pause':'start'"
                    :disabled="loopBtnDisabled()"
                    @click.native="!loopBtnDisabled() && handleIconLoopClick('loop')"
                />
                <svg-i
                    title="下一页视频"
                    icon="next-page-small"
                    :font-size="2"
                    :disabled="nextBtnDisable()"
                    @click.native="!nextBtnDisable() && nextPageVideo()"
                />
                <svg-i
                    title="上一个间隔时间"
                    icon="pre"
                    class="play-speed-icon-left"
                    :font-size="1.95"
                    :disabled="leftTimeLoopDisabled()"
                    @click.native="!leftTimeLoopDisabled() && timeSettingLeft()"
                />
                <time-interval :key="updateTimeIntervalKey || getCurrentSecond()" @change="timeIntervalChange"/>
                <svg-i
                    title="下一个间隔时间"
                    icon="next"
                    class="play-speed-icon-right"
                    :font-size="1.95"
                    :disabled="rightTimeLoopDisabled()"
                    @click.native="!rightTimeLoopDisabled() && timeSettingRight()"
                />
                <div class="percent-time loop-timer" title="实时时间/轮播时间">
                    {{ percentageSecond | toDateFormat }}/{{ getCurrentSecond() | toDateFormat }}
                </div>
            </div>
            <div class="right-part">
                <svg-i
                    v-for="(screen, index) in screenMap"
                    class="screen-icon"
                    :key="index"
                    :title="screen.title"
                    :font-size="screen.fontSize"
                    :color="screen.screenNum === currentScreen?'#fff':'#aaa'"
                    :icon="screen.iconBackup"
                    @click.native="screenChange(screen)"
                />
                <svg-i
                    v-show="showYXP()"
                    class="screen-icon"
                    title="打开窗口分割面板"
                    :font-size="1.2"
                    color="#aaa"
                    icon="diff-screen"
                    @click.native="openDiffScreen()"
                />
                <div @click="fullScreenHandle">
                    <svg-i
                        :title="fullScreen?'退出全屏':'全屏'"
                        :icon="fullScreen?'close-full-screen':'full-screen'"
                    />
                </div>
            </div>
        </div>
        <!-- 异形屏组件 -->
        <diff-screen ref="diffScreenRef" @diff-screen-change="diffScreenChange"/>
    </div>
</template>
<script>
import DiffScreen from "./DiffScreen";
import {getSimplePlayerData} from "./../lib";
import {LoopPlayMixin} from './../mixin/LoopPlay.mixin';
import {formatSecond, throttle} from "./../util";
import TimeInterval from './TimeInterval.vue';
import SvgI from './SvgI';
import {EVENT_TYPE, LOOP_TIME_OPTIONS, MODE} from "./../lib/params.lib";

export default {
    mixins: [LoopPlayMixin],
    components: {TimeInterval, SvgI, DiffScreen},
    props: {
        index: {
            type: Number,
            default: null
        }
    },
    data() {
        return {
            updateTimeIntervalKey: null, // 用于外部触发更新
            showOptions: false,
            count: 0,
            countdownTime: {
                minutes: 0,
                seconds: 40
            },
            currentItem: null,
            loopTimeOptions: LOOP_TIME_OPTIONS,
        }
    },
    filters: {
        toDateFormat(value) {
            return formatSecond(value);
        }
    },
    computed: {
        fullScreenClass() {
            return {
                'max-screen': this.fullScreen,
                'min-screen': !this.fullScreen
            };
        },
        simplePlayerData() {
            return getSimplePlayerData();
        },
        screenMap() {
            return this.simplePlayerData.getToolbarScreens();
        },
        fullScreen() {
            return this.simplePlayerData.getFullScreen();
        },
        currentScreen() {
            return this.simplePlayerData.getCurrentScreen();
        },
        closeAllFlag() {
            return this.simplePlayerData.getCloseAll();
        },
        playInfos() {
            return this.simplePlayerData.getPlayInfos();
        },
    },
    methods: {
        showYXP() {
            return this.simplePlayerData.getShowMoreScreens();
        },
        openDiffScreen() {
            this.$refs.diffScreenRef.open();
        },
        updateTimeInterval() {
            this.updateTimeIntervalKey = new Date().getTime();
        },
        showPagerAndTimer() {
            return Number(this.simplePlayerData.getMode()) !== MODE.SIMPLE;
        },
        timeSettingLeft() {
            this.handleIconLoopClick('timeSettingLeft');
        },
        timeSettingRight() {
            this.handleIconLoopClick('timeSettingRight');
        },
        leftTimeLoopDisabled() {
            const current = this.simplePlayerData.getToolBarCurrent();
            if (current === null) return false;
            const options = this.simplePlayerData.getToolBarOptions();
            const index = options.findIndex((c) => c.txt === current.txt);
            return index <= 0;
        },
        rightTimeLoopDisabled() {
            const current = this.simplePlayerData.getToolBarCurrent();
            if (current === null) return false;
            const options = this.simplePlayerData.getToolBarOptions();
            const index = options.findIndex((c) => c.txt === current.txt);
            return index >= options.length;
        },
        getPaginationTitle() {
            const lastIndex = this.simplePlayerData.getCurrentPageLastPointIndex();
            const total = this.simplePlayerData.getPagination('total');
            return `共${total}个点位, 当前已展示了${lastIndex + 1}个`
        },
        // 点位屏幕显示
        screenNumShow() {
            const lastIndex = this.simplePlayerData.getCurrentPageLastPointIndex();
            const total = this.simplePlayerData.getPagination('total');
            return `${lastIndex + 1}/${total}`;
        },
        preBtnDisable() {
            const {pageNo} = this.simplePlayerData.getPagination();
            return pageNo <= 1;
        },
        loopBtnDisabled() {
            return this.simplePlayerData.getPagination('size') === 1
        },
        nextBtnDisable() {
            const {pageNo, size} = this.simplePlayerData.getPagination();
            return pageNo >= size;
        },
        getCurrentSecond() {
            const current = this.simplePlayerData.getToolBarCurrent();
            return current.valSecond;
        },
        timeIntervalChange(option) {
            // 间隔时间重新选择后，需要重新触发轮询
            if (this.simplePlayerData.getLoop()) {
                this.handleIconLoopClick('loop');
            }
        },
        showLoopTimeOption() {
            this.showOptions = !this.showOptions;
            this.$refs.loopPlayTimeSettingRef && this.$refs.loopPlayTimeSettingRef.close();
        },
        fullScreenHandle() {
            this.$emit('full-screen', true);
        },
        openRightPanel() {
            this.$refs.loopPlayTimeSettingRef.open();
        },
        // 分屏改变
        screenChange: throttle(function (item) {
            const {id, screenNum} = item;
            const oldScreen = this.simplePlayerData.getCurrentScreen();
            // 如果传递了id则是精确设置，否则只是基本分屏的设置
            this.simplePlayerData.setCurrentScreen(screenNum, id);
            // 只有一页，则停止正在轮询的播放
            if (this.simplePlayerData.getPagination('size') === 1) {
                this.loopFlag && this.handleIconLoopClick('loop');
            } else {
                // 重置轮询进度条
                if (this.loopFlag) {
                    this.resetTimeLooper();
                }
            }
            this.$emit('screen-change', oldScreen, screenNum);
        }),
        closeAllIconChange: throttle(function () {
            this.$parent.eventEmit(EVENT_TYPE.CLOSE_ALL_BTN_CLICK);
            this.$emit('close-all');
        }),
        diffScreenChange(item) {
            this.screenChange(item);
        }
    }
}
</script>

<style lang="scss" scoped>
.tool-bar-outer {
    padding-top: 2px;
}

.tool-bar {
    background: rgba(61, 61, 61, 1);
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    height: 48px;

    .left-part {
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-start;
        align-items: center;
        margin-left: 6px;

        .btn-gesture {
            cursor: pointer;
            color: #ffffff;
            margin-right: 8px;
        }
    }

    .middle-polling {
        display: flex;
        flex-direction: row;
        align-items: center;
        color: rgba(255, 255, 255, 0.7);
    }

    .right-part {
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-start;
        align-items: center;
        margin-right: 8px;

        .screen-icon {
            margin-right: 10px;
        }

        .snap-tooltip {
            height: 32px;
            display: flex;
            flex-flow: row nowrap;
            justify-content: flex-start;
            align-items: center;
            margin-right: 16px;
            cursor: pointer;

            .snap-img {
                width: 32px;
                height: 100%;
                object-fit: contain;
            }

            .tooltip-text {
                margin-left: 4px;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.5);

                &:hover {
                    color: rgba(255, 255, 255, 1);
                }
            }
        }
    }

    i {
        font-size: 34px;
        color: rgba(255, 255, 255, 0.7);
        margin-left: 2px;
    }
}

.percent-time {
    width: 80px;
    font-size: 14px;
    text-align: center;
}

.loop-timer {
    margin-left: 15px;
}

.start-i {
    margin: 0 15px;
}

.play-speed-icon-left {
    margin-left: 20px;
}
</style>

