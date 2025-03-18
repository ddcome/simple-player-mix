<template>
    <div class="concentrate" v-if="canUse()">
        <div class="right-btns">
            <div class="circle-btn" :class="isConcentrate ? 'open-active' : ''" @click.stop="isConcentrateClick">
                事件浓缩播放
            </div>
            <el-popover
                ref="eventSelectPopover"
                placement="bottom"
                hikcc_cover="opaque"
                popper-class="event-select-popover"
                width="200"
                trigger="manual"
                content="请选择需要浓缩播放的事件"
            ></el-popover>
            <div class="label-input" v-popover:eventSelectPopover v-if="hasEventSelect">
                <label>事件选择:</label>
                <el-input class="event-select" placeholder="请选择事件" v-model="currentEvent">
                    <template slot="append">
                        <i class="h-icon-arrow_right" @click.stop="openHandle"/>
                    </template>
                </el-input>
            </div>
            <div class="label-input">
                <label>回放时间段:</label>
                <el-date-picker
                    popper-class="date-picker-over-player"
                    hikcc_cover="opaque"
                    class="date-outer"
                    v-model="backPlayDateRange"
                    format="yyyy/MM/dd HH:mm:ss"
                    @focus="focusHandle"
                    type="datetimerange"
                    :clearable="false"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    @input="backPlayDateRangeChange"
                />
            </div>
        </div>
        <AlgoSelection
            hikcc_cover="opaque"
            ref="algoSelectionRef"
            :selected="selectedCameraArr"
            :query-api="getQueryApi"
            @save="resultHandle"
        />
    </div>
</template>

<script>
import AlgoSelection from './AlgoSelection/dialog';
import moment from 'moment';
import {getSimplePlayerData} from "./../lib";
import {MODE} from "./../lib/params.lib";
import {API_METHOD_MAP} from "./../mixin/ApiProps.mixin";
import {addHikccCover, deepClone, isNotEmpty} from "./../util";
import {warnLog} from "./../util/logger";

export default {
    name: 'Concentrate',
    components: {AlgoSelection},
    props: {
        indexCodes: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    data() {
        return {
            isConcentrate: false,
            selectedCameraArr: [],
            eventAlgorithmCode: [],
            backPlayDateRange: [moment().add(-3, 'd'), moment()],
            curPlayType: '1',
            currentEvent: '',
            // 录像标签查询参数
            queryVideoLabelParams: {
                startTime: '',
                endTime: '',
                label: []
            }
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
    watch: {
        currentEvent: {
            handler(value) {
                this.$nextTick(() => {
                    addHikccCover('event-select-popover');
                });
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        canUse() {
            // H5没有浓缩播放
            return this.simplePlayerData.isClientContainer();
        },
        addPopAttr() {
            const eventSelectPopover = document.getElementsByClassName('event-select-popover')[0];
        },
        showConcentrate() {
            return Number(this.simplePlayerData.getMode()) === MODE.NONGSUO;
        },
        isPreview() {
            return this.simplePlayerData.isGlobalPreview();
        },
        isPlayback() {
            return this.simplePlayerData.isGlobalPlayback();
        },
        isConcentrateClick() {
            this.isConcentrate = !this.isConcentrate;
            const _api = this.$parent.$parent.getApi(API_METHOD_MAP.SAVE_SWITCH_STATUS_API);
            if (!isNotEmpty(_api)) {
                warnLog('you should config api-methods Prop, add ', API_METHOD_MAP.SAVE_SWITCH_STATUS_API, ' attribute.');
                return;
            }
            _api({
                status: this.isConcentrate,
                label: this.eventAlgorithmCode
            }).then(res => {
                if ([0, '0'].includes(res.code)) {
                    if (this.isConcentrate) {
                        this.$message({
                            message: '已开启事件浓缩播放。',
                            type: 'success',
                            customClass: 'custom-message-outer'
                        });
                        // this.$refs.eventSelectPopover.doShow();
                    } else {
                        // this.$refs.eventSelectPopover.doClose();
                        this.$message({
                            message: '已关闭事件浓缩播放。',
                            type: 'success',
                            customClass: 'custom-message-outer'
                        });
                    }
                    addHikccCover('custom-message-outer');
                    this.$emit('concentrateChange', this.queryVideoLabelParams, this.isConcentrate);
                }
            });
        },
        openHandle() {
            this.$refs.algoSelectionRef.open();
        },
        // 解决播放器层级遮挡问题
        focusHandle() {
            this.$nextTick(() => {
                addHikccCover('date-picker-over-player');
            });
        },
        changePlayType(value) {
            if (value === '1') {
                this.simplePlayerData.setGlobalStatusPreview();
            } else {
                this.simplePlayerData.setGlobalStatusPlayback();
            }
            this.$emit('play-status-change', value);
        },
        getQueryApiParams() {
            return {
                startTime: this.queryVideoLabelParams.startTime,
                endTime: this.queryVideoLabelParams.endTime,
                indexCodes: this.indexCodes.filter(c => !!c.indexCode).map(c => c.indexCode)
            };
        },
        getQueryApi() {
            if (!this.isConcentrate) return; // 非浓缩播放模式不请求
            const _api = this.$parent.$parent.getApi(API_METHOD_MAP.QUERY_ALGORITHMS_API);
            if (!isNotEmpty(_api)) return null;
            return _api(this.getQueryApiParams());
        },
        resultHandle(r) {
            const _r = deepClone(r);
            this.eventAlgorithmCode = _r.map(c => `${c.eventCode}`);
            this.currentEvent = _r.map(c => c.name).join(',');

            this.setQueryVideoLabelParams({
                label: this.eventAlgorithmCode,
                startTime: moment(this.backPlayDateRange[0]).format('yyyy-MM-DDTHH:mm:ss.000+08:00'),
                endTime: moment(this.backPlayDateRange[1]).format('yyyy-MM-DDTHH:mm:ss.000+08:00')
            });
            this.$emit('date-change', this.queryVideoLabelParams);
        },
        // 事件选择改变时
        eventSelectChange() {
            this.setQueryVideoLabelParams({
                label: this.eventAlgorithmCode
            });
            this.$emit('date-change', this.queryVideoLabelParams);
        },
        requestValid(value) {
            const _v = typeof value !== 'undefined' ? value : this.queryVideoLabelParams.label;
            if (!isNotEmpty(_v) || _v.length === 0) {
                this.$message({
                    message: '请选择事件',
                    type: 'info',
                    customClass: 'select-agl-message-outer'
                });
                addHikccCover('select-agl-message-outer');
                return false;
            }
            return true;
        },
        // 回放时间段改变时
        backPlayDateRangeChange() {
            this.setQueryVideoLabelParams({
                label: this.eventAlgorithmCode,
                startTime: moment(this.backPlayDateRange[0]).format('yyyy-MM-DDTHH:mm:ss.000+08:00'),
                endTime: moment(this.backPlayDateRange[1]).format('yyyy-MM-DDTHH:mm:ss.000+08:00')
            });
            if (this.isConcentrate) {
                this.$emit('date-change', this.queryVideoLabelParams);
            } else {
                const list = this.simplePlayerData.getPlayInfoCopy() || [];
                this.simplePlayerData.updatePlayInfos(list.map(c => ({
                    ...c,
                    startTime: this.queryVideoLabelParams.startTime,
                    endTime: this.queryVideoLabelParams.endTime,
                })));
                this.$parent.$parent.doPlayback();
            }
        },
        // 初始化回放工具栏
        initReplayOperation() {
            const _api = this.$parent.$parent.getApi(API_METHOD_MAP.QUERY_SWITCH_STATUS_API);
            if (!isNotEmpty(_api)) return;
            _api().then(res => {
                if ([0, '0'].includes(res.code)) {
                    this.isConcentrate = res && res.data && res.data.status;
                    this.$emit('concentrateChange', this.queryVideoLabelParams, this.isConcentrate);
                }
            });
        },
        // 设置录像查询参数
        setQueryVideoLabelParams(params) {
            this.queryVideoLabelParams = Object.assign(this.queryVideoLabelParams, params);
        },
        initTime() {
            this.setQueryVideoLabelParams({
                startTime: moment(this.backPlayDateRange[0]).format('yyyy-MM-DDTHH:mm:ss.000+08:00'),
                endTime: moment(this.backPlayDateRange[1]).format('yyyy-MM-DDTHH:mm:ss.000+08:00')
            });
        }
    },
    created() {
        this.initTime();
    },
    mounted() {
        this.initReplayOperation();
    }
};
</script>

<style lang="scss" scoped>
$background1: rgba(255, 255, 255, 0.08);
$color1: rgba(255, 255, 255, 0.9);
.concentrate {
    position: relative;
    z-index: 1;

    .right-btns {
        height: 100%;
        max-width: 970px;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;

        .label-input {
            .date-outer {
                ::v-deep .h-icon-calendar {
                    color: $color1;
                }
            }
        }

        .label-input:hover {
            background: rgba(255, 255, 255, 0.15);

            .date-outer {
                ::v-deep .el-range-separator {
                    color: $color1;
                }

                ::v-deep .el-range-input {
                    color: $color1;
                }
            }
        }

        label {
            padding-left: 10px;
            height: 32px;
            line-height: 32px;
            align-items: center;
            display: flex;
            background: $background1;
            color: rgba(255, 255, 255, 0.5);
            border-bottom-left-radius: 2px;
            border-top-left-radius: 2px;
        }

        .circle-btn {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            background: $background1;
            color: rgba(255, 255, 255, 0.5);
            border-radius: 15px;
            width: 130px;
            height: 32px;
            line-height: 32px;
            padding-left: 7px;

            &::before {
                position: relative;
                content: '';
                width: 8px;
                height: 8px;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.5);
                left: -6px;
            }

            &:hover {
                background: rgba(255, 255, 255, 0.15);
                color: rgba(255, 255, 255, 0.6);

                &::before {
                    background: rgb(147, 147, 147);
                }
            }
        }

        .click-active,
        .click-active:hover {
            background: rgba(255, 255, 255, 0.15);
            color: $color1;

            &::before {
                background: rgb(22, 187, 150);
            }
        }

        .open-active,
        .open-active:hover {
            background: rgba(255, 255, 255, 0.15);
            color: $color1;

            &::before {
                background: rgb(22, 187, 150);
                animation: breathe-light 1.7s ease-out 0s infinite;
            }
        }

        ::v-deep .label-input {
            display: flex;
            flex-direction: row;
            margin-left: 10px;
            border: 1px solid $background1;
            border-radius: 2px;

            &:has(.event-select .el-input__inner:focus),
            &:has(.date-outer .el-range-input:focus) {
                border: 1px solid $color1 !important;
            }

            .event-select {
                width: 250px;

                .el-input__inner {
                    line-height: 32px;
                    background: $background1;
                    color: $color1;
                    border: 0;
                    border-radius: 0;
                }

                .el-input-group__append {
                    background: $background1;
                    color: $color1;
                    border: 0;
                }
            }

            .date-outer {
                border: 0;
                border-radius: 0;
                background: $background1;
                width: 370px;
                line-height: 32px;
                padding: 5px 32px 6px 7px;
                border-bottom-right-radius: 2px;
                border-top-right-radius: 2px;

                .el-range-separator {
                    color: $color1;
                }

                .el-range-input {
                    background: rgba(255, 255, 255, 0);
                    color: $color1;
                }
            }
        }
    }
}

.h-icon-arrow_right {
    cursor: pointer;
}

@keyframes breathe-light {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.3);
        opacity: 1;
    }
    100% {
        transform: scale(1);
        opacity: 0.3;
    }
}
</style>

<style lang="scss">
.video-plan-play-header {
    &.is-white-background {
        background: #ffffff;
    }
}

.custom-message-outer {
    top: 80px !important;
}
</style>
