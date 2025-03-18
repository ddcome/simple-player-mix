<template>
    <div hikcc_cover="opaque" class="loop-play-time-setting" @click.stop v-show="visible">
        <el-form ref="form" label-position="top" :model="form">
            <el-form-item label="自定义轮巡时间间隔">
                <el-col :style="{ paddingRight: '10px' }" :span="16">
                    <el-input-number
                        v-model="form.intervalTime"
                        placeholder="请输入"
                        :min="form.min"
                        :max="form.timeType==='second'?form.max:form.minuteMax"
                    />
                </el-col>
                <el-col :span="8">
                    <el-select v-model="form.timeType">
                        <el-option
                            v-for="option in timeTypeOptions"
                            :key="option.value"
                            :value="option.value"
                            :label="option.label"
                        />
                    </el-select>
                </el-col>
            </el-form-item>
            <el-form-item align="right">
                <el-button type="primary" @click="save">保存</el-button>
                <el-button @click="cancel">取消</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import {LOOP_TIME_CONSTANT} from "./../lib/params.lib";
import {deepClone} from "./../util";

export default {
    name: 'LoopPlayTimeSetting',
    props: {
        propTimeOption: {
            type: Object,
            default: () => {
                return null;
            }
        }
    },
    data() {
        return {
            visible: false,
            timeTypeOptions: [],
            form: {
                intervalTime: null,
                timeType: LOOP_TIME_CONSTANT.UNIT[0].value,
                min: LOOP_TIME_CONSTANT.SECOND_MIN,
                minuteMin: LOOP_TIME_CONSTANT.MINUTE_MIN,
                max: LOOP_TIME_CONSTANT.SECOND_MAX,
                minuteMax: LOOP_TIME_CONSTANT.MINUTE_MAX,
            }
        };
    },
    computed: {},
    watch: {
        propTimeOption: {
            handler(val) {
                if (val) {
                    const {valSecond, value, unit} = val;

                    if (valSecond > 0) {
                        this.form.intervalTime = value;
                        this.form.timeType = unit === '秒' ? 'second' : 'min';
                    }
                }
            },
            deep: true,
            immediate: true
        }
    },
    mounted() {
        this.initOption();
    },
    methods: {
        initOption() {
            this.timeTypeOptions = deepClone(LOOP_TIME_CONSTANT.UNIT);
        },
        open() {
            this.visible = true;
        },
        close() {
            this.visible = false;
        },
        save() {
            const {intervalTime, timeType} = this.form;

            if (!intervalTime) {
                return this.$message('轮巡时间间隔不能为空');
            }
            const {SECOND_MIN, MINUTE_MIN, SECOND_MAX, MINUTE_MAX} = LOOP_TIME_CONSTANT;
            if (
                (timeType === 'second' && (intervalTime < SECOND_MIN || intervalTime > SECOND_MAX)) ||
                (timeType === 'min' && (intervalTime < MINUTE_MIN || intervalTime > MINUTE_MAX))
            ) {
                return this.$message('轮巡时间范围为5秒到10分钟');
            }

            const valSecond = timeType === 'second' ? intervalTime : intervalTime * 60;
            const unit = timeType === 'second' ? '秒' : '分钟';
            this.$emit('ok', {
                valSecond,
                value: intervalTime,
                unit
            });
        },
        cancel() {
            this.close();
            this.$emit('close');
        }
    }
};
</script>
<style lang="scss" scoped>
.loop-play-time-setting {
    z-index: 1000;
    position: absolute;
    bottom: 45px;
    left: 143px;
    width: 288px;
    height: 160px;
    background: #ffffff;
    border-radius: 2px;
    font-size: 14px;
    color: #000000b2;
    padding: 24px;
}

.el-input-number, .el-select {
    display: block;
    width: auto;
}
</style>
