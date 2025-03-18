<template>
    <div id="calendar-dialog" :style="{display: visible?'block':'none'}" class="calendar-dialog"
         hikcc_cover="opaque">
        <el-date-picker
            v-if="visible"
            :appendToBody="false"
            hikcc_cover="opaque"
            ref="datePicker"
            v-model="dateRange"
            popper-class="simple-player-date-picker"
            type="datetimerange"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            :picker-options="pickOptions"
            @input="handleInput"
        />
        <div v-if="visible" class="calendar-dialog-title">
            <div class="title-left">
                {{ selectedWnd + 1 }}号窗口
                <span class="camera-title">{{ title ? `（${title}）` : '' }}</span>
                回放时间选择：
            </div>
            <div class="btn btn-close" title="关闭" @click="close">
                <svg-i icon="close" color="#555" hover-color="#000"/>
            </div>
        </div>
    </div>
</template>
<script>
import {getSimplePlayerData} from "./../lib";
import SvgI from './../components/SvgI';
import {infoLog, warnLog} from "./../util/logger";

/**
 * @function
 * @description 回放时间选择器
 * @author lixiaodong31 2023/12/11
 * @version 1.0.0
 * @example
 */
export default {
    components: {SvgI},
    computed: {
        simplePlayerData() {
            return getSimplePlayerData();
        },
        playInfos() {
            return this.simplePlayerData.getPlayInfos();
        },
        selectedWnd() {
            return this.simplePlayerData.getSelectedWnd();
        },
    },
    data() {
        return {
            times: 30, // 尝试次数
            visible: false,
            pickOptions: {
                customValidation(beginTime, endTime) {
                    return endTime - beginTime <= 7 * 24 * 60 * 60 * 1000;
                },
                customPrompt: '查询时间不能超过7天'
            },
            title: '',
            dateRange: [],
            playerIdPrefix: 'player',
        }
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            this.initTimes();
            this.title = this.simplePlayerData.getTitle(this.selectedWnd);
        },
        initTimes() {
            this.times = 30;
        },
        handleInput() {
            this.hide();
            this.$emit('change', this.selectedWnd, {dateRange: this.dateRange});
        },
        open() {
            this.initTimes();
            this.visible = true;
            this.$nextTick(() => {
                this.showCalendar();
            });
        },
        // 展示时间选择组件
        showCalendar() {
            try {
                infoLog('start set calendar');
                this.$refs.datePicker.pickerVisible = true;
                const dom = document.getElementsByClassName('simple-player-date-picker')[0];
                this.$refs.datePicker.popperElm.setAttribute('hikcc_cover', 'opaque');
                dom.style.zIndex = 3005;
                dom.style.opacity = 1;
                dom.style.boxShadow = 'unset';
                dom.style.display = 'block !important';
                dom.style.position = 'fixed';
                dom.style.left = '50%';
                dom.style.top = '50%';
            } catch (e) {
                warnLog('set calendar fail, reset is again after 300ms', e);
                if (this.times >= 0) {
                    this.times = this.times - 1;
                    let _ = setTimeout(() => {
                        this.showCalendar();
                        clearTimeout(_);
                    }, 300);
                }
            }
        },
        hide() {
            this.$refs.datePicker.pickerVisible = false;
            this.visible = false;
        },
        close() {
            this.hide();
            this.dateRange = [];
        },
    }
}
</script>
<style lang="scss" scoped>
.calendar-dialog {
    height: 442px;
    width: 512px;
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 3000;
    transform: translateX(-50%) translateY(-50%);
    background: #ffffff;
    box-shadow: 0 0 2px 0 rgba(0, 0, 0, .2), 0 2px 4px 0 rgba(0, 0, 0, .12);

    .calendar-dialog-title {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 36px;
        padding: 0 8px;
        background: #ffffff;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .title-left {
            display: flex;

            .camera-title {
                max-width: 210px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }

        .btn-close {
            position: relative;
        }
    }
}
</style>
<style lang="scss">
.simple-player-date-picker {
    position: fixed !important;
    left: 50% !important;
    top: 50% !important;
    margin-left: -256px !important;
    margin-top: -180px !important;
    z-index: 3001 !important;
    display: block !important;
}
</style>
