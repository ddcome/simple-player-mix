<template>
    <div class="player-footer-outer">
        <div class="btn-center">
            <svg-i
                title="后退一帧"
                icon="pre-frame"
                :disabled="videoNotPlaying()"
                @click.native="btnClick('backFrame')"
            />
            <svg-i
                :icon="pause?'start-not-fill':'pause'"
                :title="pause?'播放':'暂停'"
                :disabled="videoNotPlaying()"
                @click.native="btnClick('pause')"
            />
            <svg-i
                title="前进一帧"
                icon="next-frame"
                :disabled="videoNotPlaying()"
                @click.native="btnClick('forwardFrame')"
            />
        </div>
        <div class="btn-right">
            <div class="speed-btn-group cursor-pointer" :title="'倍速'">
                <svg-i
                    title="低倍速播放"
                    icon="pre"
                    hover-color="#fff"
                    class="play-speed-icon-left"
                    :disabled="videoNotPlaying()"
                    @click.native="preSpeedClick()"
                />
                <div class="play-speed-icon-middle-video" @click="speedClick">{{ realSpeed }}</div>
                <svg-i
                    title="高倍速播放"
                    icon="next"
                    hover-color="#fff"
                    class="play-speed-icon"
                    :disabled="videoNotPlaying()"
                    @click.native="nextSpeedClick()"
                />
            </div>
            <SpeedSelect :index="index" ref="speedSelectRef" @change="speedChangeHandle"/>
        </div>
    </div>
</template>

<script>
import {PLAYER_STATUS_MAP} from "./../lib/params.lib";
import SpeedSelect from './SpeedSelect';
import SvgI from './SvgI';
import {getSimplePlayerData} from "./../lib";
import {SPEED_TYPE} from "./SpeedSelect";

export default {
    name: 'PlayerFooter',
    components: {SpeedSelect, SvgI},
    props: {
        videoPlanFlag: {
            type: Boolean,
            default: false
        },
        numIdState: {
            type: Object,
            default() {
                return {
                    fontSize: '12px',
                    show: false,
                    numId: ''
                };
            }
        },
        isPause: {
            type: Boolean,
            default: false
        },
        speedPanelExpand: {
            type: Boolean,
            default: false
        },
        index: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            pause: false,
            speedPanelShow: false,
            iRvert: false,
            btnGroup: [],
            realSpeed: '1x',
            speedType: SPEED_TYPE.UNKNOWN,
        };
    },
    computed: {
        PauseControlClass() {
            return this.pause ? 'play' : 'pause';
        },
        simplePlayerData() {
            return getSimplePlayerData();
        }
    },
    watch: {
        isPause(val) {
            this.pause = val;
        },
        speedPanelExpand(val) {
            this.speedPanelShow = val;
        },
    },
    created() {
        this.speedPanelShow = this.speedPanelExpand;
    },
    methods: {
        // 当前视频并没有在播放中
        videoNotPlaying() {
            return this.simplePlayerData.getWndStatus(this.index, 'status') !== PLAYER_STATUS_MAP.PLAYING;
        },
        preSpeedClick() {
            if (this.videoNotPlaying()) return;
            this.$refs.speedSelectRef && this.$refs.speedSelectRef.goPre();
        },
        nextSpeedClick() {
            if (this.videoNotPlaying()) return;
            this.$refs.speedSelectRef && this.$refs.speedSelectRef.goNext();
        },
        speedChangeHandle(item, type) {
            this.realSpeed = item;
            this.speedType = type;
            this.btnClick('JTSpeedSetting');
        },
        speedClick() {
            if (this.videoNotPlaying()) return;
            this.$refs.speedSelectRef.switchOpen();
        },
        btnClick(key, e) {
            switch (key) {
                case 'backFrame':
                    if (this.videoNotPlaying()) return;
                    this.pause = true;
                    this.$emit('change', {key}, this.index);
                    break;
                case 'pause':
                    if (this.videoNotPlaying()) return;
                    this.pause = !this.pause;
                    this.$emit(
                        'change',
                        {key, value: this.pause},
                        this.index
                    );
                    break;
                case 'forwardFrame':
                    if (this.videoNotPlaying()) return;
                    this.pause = true;
                    this.$emit('change', {key}, this.index);
                    break;
                case 'JTSpeedSetting':
                    //不出现速度选择框
                    this.$emit(
                        'change',
                        {key, value: false, speed: this.$refs.speedSelectRef.getCurrent(), speedType: this.speedType},
                        this.index
                    );
                    break;
                case 'revert':
                    if (this.iRvert !== e) {
                        this.iRvert = !this.iRvert;
                        this.$emit(
                            'change',
                            {key, value: this.iRvert},
                            this.index
                        );
                    }
                    break;
            }
        }
    }
};
</script>

<style lang="less" scoped>
.player-footer-outer {
    width: 100%;
    height: 32px;
    min-height: 32px;
    max-height: 32px;
    position: relative;
    padding-left: 16px;

    .btn-left {
        display: flex;
        flex-flow: row nowrap;
    }

    .btn-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateY(-50%) translateX(-50%);
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        align-content: center;
        min-width: 112px;
    }

    .btn-right {
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-end;
        align-content: center;
        min-width: 40px;

        .speed-btn-group {
            width: 80px;
            height: 25px;
            margin-right: 10px;
            background: #2C2D30;
            border-radius: 12px;
            display: flex;
            flex-flow: row nowrap;
            align-content: center;
            align-items: center;
            justify-content: center;

            .play-speed-icon-middle-video {
                width: 30px;
                text-align: center;
                position: relative;
                top: -1px;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.85);
            }
        }
    }

    .btn {
        width: 32px;
        height: 32px;
        filter: drop-shadow(rgba(255, 255, 255, 0.4) 100px 0);
        transform: translate(-100px);
    }

    .ie-btn {
        width: 32px;
        height: 32px;
    }

    .cursor-pointer {
        cursor: pointer;
    }

    .cursor-pointer.disable {
        cursor: default;
    }

    .cursor-pointer:hover {
        .btn {
            filter: drop-shadow(rgba(255, 255, 255, 1) 100px 0);
        }

        .btn.dark {
            filter: drop-shadow(rgba(0, 0, 0, 1) 100px 0);
        }

        .disable.btn {
            cursor: default;
            filter: drop-shadow(rgba(255, 255, 255, 0.2) 100px 0);
        }
    }

    .opened.btn {
        color: rgba(255, 255, 255, 1);
        filter: drop-shadow(rgba(255, 255, 255, 1) 100px 0);
    }
}
</style>
