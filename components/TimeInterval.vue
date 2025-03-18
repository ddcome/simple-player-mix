<template>
    <div
        class="time-interval"
        :title="'轮播间隔'"
        @click="showLoopTimeOption()"
    >
        {{ realTime() }}
        <ul
            v-if="showOptions"
            hikcc_cover="opaque"
            class="loop-time-select-options"
            @mouseenter.stop="ulMouseEnter"
            @mouseleave.stop="ulMouseLeave"
        >
            <li
                v-for="(option, idx) in loopTimeOptions"
                :key="option.key"
                class="option-item"
                :class="getLiClass(option, idx)"
                @click.stop="liClick(option, idx)"
            >
                <template v-if="option.hasOwnProperty('createOwn') && option.createOwn === true">
                    {{ `${option.value}${option.unit}` }}
                    <div class="right-icon-edit" @click.stop="()=>{}">
                        <i
                            title="编辑"
                            class="h-icon-edit right-icon"
                            @click.stop="editTheLastLoopTimeOption()"
                        />
                        <i
                            title="删除"
                            class="h-icon-close right-icon"
                            @click.stop="deleteClick('deleteTheLastLoopTimeOption', option)"
                        />
                    </div>
                </template>
                <template v-else-if="option.valSecond === 0">
                    {{ option.txt }}<i class="h-icon-arrow_right right-icon"/>
                </template>
                <template v-else>
                    {{ option.txt }}
                </template>
            </li>
        </ul>
        <LoopPlayTimeSetting
            @mouseenter.native="nearPanelMouseEnter"
            @mouseleave.native="nearPanelMouseLeave"
            ref="loopPlayTimeSettingRef"
            hikcc_cover="opaque"
            :propTimeOption="propTimeOption"
            @ok="updateLoopTimeOptionCustomSetting"
        />
    </div>
</template>

<script>
import {LOOP_TIME_OPTIONS} from "./../lib/params.lib";
import LoopPlayTimeSetting from './LoopPlayTimeSetting.vue';
import {getSimplePlayerData} from "./../lib";
import {deepClone, isNotEmpty} from "./../util";

export default {
    components: {LoopPlayTimeSetting},
    data() {
        return {
            nearTimer: null,
            ulTimer: null,
            showOptions: false,
            currentItem: null,
            propTimeOption: null,
            loopTimeOptions: deepClone(LOOP_TIME_OPTIONS),
        }
    },
    computed: {
        simplePlayerData() {
            return getSimplePlayerData();
        },
    },
    mounted() {
        this.initOptions();
        this.init();
    },
    activated() {
        this.initOptions();
        this.init();
    },
    updated() {
        this.initOptions();
    },
    methods: {
        initOptions() {
            this.loopTimeOptions = this.simplePlayerData.getToolBarOptions();
        },
        nearPanelMouseEnter() {
            clearTimeout(this.ulTimer);
            this.showOptions = true;
        },
        nearPanelMouseLeave() {
            clearTimeout(this.nearTimer);
            this.nearTimer = setTimeout(() => {
                this.$refs.loopPlayTimeSettingRef.close();
                this.showOptions = false;
                clearTimeout(this.nearTimer);
            }, 3000);
        },
        ulMouseEnter() {
            this.showOptions = true;
            clearTimeout(this.nearTimer);
        },
        ulMouseLeave() {
            clearTimeout(this.ulTimer);
            this.ulTimer = setTimeout(() => {
                this.showOptions = false;
                this.$refs.loopPlayTimeSettingRef.close();
                clearTimeout(this.ulTimer);
            }, 3000);
        },
        realTime() {
            const current = this.simplePlayerData.getToolBarCurrent();
            return current.txt;
        },
        init() {
            const current = this.simplePlayerData.getToolBarCurrent();
            if (isNotEmpty(current)) {
                this.initCurrentItem(); // 初始化当前选中项
                this.$emit('change', current, 0)
            } else {
                this.simplePlayerData.setToolBarCurrent(this.loopTimeOptions[0]);
                this.initCurrentItem(); // 初始化当前选中项
                this.$emit('change', this.loopTimeOptions[0], 0)
            }
        },
        initCurrentItem() {
            this.currentItem = this.simplePlayerData.getToolBarCurrent();
        },
        clearTimer() {
            clearTimeout(this.nearTimer);
            clearTimeout(this.ulTimer);
        },
        showLoopTimeOption() {
            this.clearTimer();
            this.showOptions = !this.showOptions;
            if (!this.showOptions) {
                this.$refs.loopPlayTimeSettingRef.close();
            }
        },
        liClick(option, idx) {
            const {value} = option;
            if (value !== 0) this.simplePlayerData.setToolBarCurrent(option);
            else this.openRightPanel(); // 展开右侧项
            this.$parent.clickLoopTimeOption(option, idx);
            this.initCurrentItem();
            this.$emit('change', option, idx);
        },
        getLiClass(option, idx) {
            return {
                'active': this.currentItem && this.currentItem.valSecond === option.valSecond,
                'the-last-option': idx === this.loopTimeOptions.length - 1
            };
        },
        openRightPanel() {
            this.$refs.loopPlayTimeSettingRef.open();
        },
        closeRightPanel() {
            this.$refs.loopPlayTimeSettingRef.close();
        },
        deleteClick(type, option) {
            const last = this.loopTimeOptions[this.loopTimeOptions.length - 1];
            const current = this.simplePlayerData.getToolBarCurrent();
            if (current.value === last.value) {
                this.liClick(this.loopTimeOptions[0], 0);
            }
            this.simplePlayerData.removeToolBarOptions(option);
            this.initOptions();
            this.$refs.loopPlayTimeSettingRef.close();
            this.$parent.handleIconLoopClick(type);
        },
        editTheLastLoopTimeOption() {
            this.propTimeOption = this.loopTimeOptions[this.loopTimeOptions.length - 1];
            this.$refs.loopPlayTimeSettingRef.open();
        },
        updateLoopTimeOptionCustomSetting(params) {
            const options = this.simplePlayerData.getToolBarOptions();
            const ownCreateNum = (options.filter(c => !!c.createOwn) || []).length;
            if (ownCreateNum >= 3) return; // 最多添加3个自定义
            const {valSecond, value, unit} = params;
            this.simplePlayerData.addToolBarOptions({
                txt: `${value}${unit}`,
                valSecond,
                value,
                unit,
                key: new Date().getTime(),
                createOwn: true
            });
            this.initOptions();
            this.closeRightPanel();
            clearTimeout(this.nearTimer);
        }
    }
}
</script>

<style lang="scss" scoped>
.time-interval {
    width: 46px;
    text-align: center;
    font-size: 14px;
    color: #c5c0c0;
    position: relative;
    top: -1px;

    .loop-time-select-options {
        list-style: none;
        padding: 0;
        z-index: 1005;
        position: absolute;
        bottom: 45px;
        left: -80px;
        width: 220px;
        min-height: 192px;
        background: #ffffff;
        border-radius: 2px;
        font-size: 14px;
        color: #000000b2;

        li {
            width: 220px;
            height: 32px;
            padding: 6px 8px;
            line-height: 20px;
            text-align: left;
            cursor: pointer;
            position: relative;

            &.active {
                background: #2160e8;
                color: #ffffff;
            }

            &.the-last-option {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
        }
    }
}

.right-icon-edit {
    position: absolute;
    right: 6px;
    top: 0;
    z-index: 9;
    height: 32px;
    display: flex;
    flex-direction: row;
    align-items: center;

    .right-icon {
        font-size: 20px;
        margin-left: 10px;
    }
}
</style>
