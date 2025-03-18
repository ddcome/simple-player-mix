<template>
    <el-dialog
        hikcc_cover="opaque"
        class="algo-select-pro-dialog"
        title="选择分析算法"
        :visible.sync="visible"
        :area="[1150,600]"
    >
        <div class="inner" v-if="visible">
            <algo-selection ref="algoSelectionRef" :selected="selected" :query-api="queryApi" />
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="saveHandle">
                确 定
            </el-button>
            <el-button @click="cancelHandle">
                取 消
            </el-button>
        </div>
    </el-dialog>
</template>

<script>
import algoSelection from './index';

export default {
    components: { algoSelection },
    props: {
        queryApi: {
            type: Function,
            default() {
                return null;
            }
        },
        selected: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    data() {
        return {
            visible: false,
        };
    },
    methods: {
        open() {
            this.visible = true;
        },
        close() {
            this.visible = false;
        },
        saveHandle() {
            const data = this.$refs.algoSelectionRef.getSelected();
            if (data.length > 60) {
                this.$message.warning('任务最多关联60个算法。');
                return;
            }
            this.$emit('save', data);
            this.close();
        },
        cancelHandle() {
            this.close();
            this.$emit('close');
        }
    }
};
</script>

<style lang="scss" scoped>
.inner {
    width: 100%;
    height: 100%;
    background-color: #fff;
}
</style>

<style lang="scss">
.algo-select-pro-dialog {
    .el-dialog {
        top: 50% !important;
        margin-top: -300px;
        .el-dialog__body {
            position: relative;
            height: calc(600px - 36px - 56px);
            padding: 16px 24px;
            .el-scrollbar__view,
            .el-dialog__body-wrapper {
                height: 100%;
            }

        }
    }
}
</style>
