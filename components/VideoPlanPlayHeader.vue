<template>
    <div class="video-plan-play-header" hikcc_cover="opaque" :class="{ 'is-white-background': isWhiteBackground }">
        <div class="left-btns">
            <div
                class="left-btn-item"
                :class="isPreview() ? 'active-item' : ''"
                @click.stop="changePlayType('1')"
            >
                预览
            </div>
            <div
                class="left-btn-item"
                :class="isPlayback() ? 'active-item' : ''"
                @click.stop="changePlayType('2')"
            >
                回放
            </div>
        </div>
        <div class="right-group">
            <!--算法分析模块-->
            <template v-if="showAlgorithmAnalysis()">
                <algorithm-analysis/>
            </template>
            <!--浓缩播放模块-->
            <template v-if="showConcentrate() && isPlayback()">
                <concentrate :indexCodes="indexCodes" @date-change="dateChangeHandle"/>
            </template>
            <svg-i
                v-if="isCC() && showSetting()"
                class="setting-outer"
                title="打开设置"
                hover-color="#fff"
                active-color="#fff"
                icon="setting"
                :size="25"
                @click.native="openSetting"
            />
        </div>
        <setting v-if="isCC()" ref="settingRef" @open-dir="openDirHandle"/>
    </div>
</template>

<script>
import Setting from './Setting';
import SvgI from './SvgI';
import Concentrate from './Concentrate.vue';
import AlgorithmAnalysis from './AlgorithmAnalysis.vue';
import {getSimplePlayerData} from "./../lib";
import {MODE} from "./../lib/params.lib";
import {addHikccCover} from "./../util";

export default {
    name: 'VideoPlanPlayHeader',
    components: {Concentrate, AlgorithmAnalysis, SvgI, Setting},
    props: {
        indexCodes: {
            type: Array,
            default() {
                return [];
            }
        },
        playType: {
            type: String,
            default: '1'
        },
        isWhiteBackground: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            isConcentrate: false,
        };
    },
    computed: {
        simplePlayerData() {
            return getSimplePlayerData();
        },
        hasRight() {
            if (this.isPlayback()) addHikccCover('el-popover');
            const hasConcentrate = this.simplePlayerData.getHasConcentrate();
            return hasConcentrate && this.isPlayback();
        },
        hasEventSelect() {
            return this.isConcentrate;
        }
    },
    methods: {
        openDirHandle(id, params) {
            this.$parent.callSelectExistingDir(params);
        },
        // 设置文件夹选择后的路径
        setSettingDir(path) {
            this.$refs.settingRef && this.$refs.settingRef.setDirPath(path);
        },
        openSetting() {
            this.$refs.settingRef && this.$refs.settingRef.open();
        },
        showAlgorithmAnalysis() {
            return this.simplePlayerData.getShowAlgorithmAnalysis();
        },
        showConcentrate() {
            return Number(this.simplePlayerData.getMode()) === MODE.NONGSUO;
        },
        showSetting() {
            return this.simplePlayerData.getShowSetting();
        },
        isCC() {
            return this.simplePlayerData.isClientContainer();
        },
        isPreview() {
            return this.simplePlayerData.isGlobalPreview();
        },
        isPlayback() {
            return this.simplePlayerData.isGlobalPlayback();
        },
        changePlayType(value) {
            if (value === '1') {
                this.simplePlayerData.setGlobalStatusPreview();
            } else {
                this.simplePlayerData.setGlobalStatusPlayback();
            }
            this.$emit('play-status-change', value);
        },
        dateChangeHandle(data) {
            this.$emit('dateRangeChange', data);
        }
    }
};
</script>

<style lang="scss" scoped>
$background1: rgba(255, 255, 255, 0.08);
$color1: rgba(255, 255, 255, 0.9);
.video-plan-play-header {
    height: 48px;
    display: flex;
    background: rgb(61, 61, 61);
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;

    .left-btns {
        position: relative;
        padding: 0;
        width: 100px;
        height: 22px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        font-size: 12px;
        color: rgba(255, 255, 255, 0.5);
        display: flex;
        flex-direction: row;
        align-items: center;

        .left-btn-item {
            border-radius: 10px;
            width: 50px;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;

            &:first-child::before {
                content: '';
                width: 8px;
                height: 8px;
                border-radius: 8px;
                margin-right: 2px;
                background: rgba(255, 255, 255, 0.2);
            }

            &:last-child::after {
                content: '';
                width: 8px;
                height: 8px;
                border-radius: 8px;
                margin-left: 2px;
                background: rgba(255, 255, 255, 0.2);
            }
        }

        .active-item {
            color: #fff;
            background: rgba(255, 255, 255, 0.12);

            &::before {
                background: #16bb96 !important;
            }

            &::after {
                background: rgb(224, 32, 32) !important;
            }
        }
    }

    .right-group {
        height: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;

        .setting-outer {
            margin-left: 10px;
        }
    }
}

.h-icon-arrow_right {
    cursor: pointer;
}
</style>

<style lang="scss">
.video-plan-play-header {
    &.is-white-background {
        background: #ffffff;
    }
}
</style>
