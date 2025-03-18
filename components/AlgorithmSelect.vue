<template>
    <div class="algorithm-select" hikcc_cover="opaque" @mouseenter="mouseenterHandle" @mouseleave="mouseleaveHandle">
        <div class="inner">
            <template v-if="list && list.length > 0">
                <el-checkbox-group v-model="selected" vertical>
                    <el-checkbox v-for="(l, i) in list" :label="l.label" :value="l.value" :key="i" />
                </el-checkbox-group>
                <el-button class="apply-btn" type="link" @click="apply">算法分析</el-button>
            </template>
            <template v-else>暂无推荐算法</template>
        </div>
    </div>
</template>

<script>
import {getSimplePlayerData} from "./../lib";
import {errorLog} from "./../util/logger";
import {EVENT_TYPE} from "./../lib/params.lib";

export default {
    data() {
        return {
            selected: [],
        };
    },
    props: {
        item: {
            type: Object,
            default() {
                return {};
            }
        },
        list: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    computed: {
        simplePlayerData() {
            return getSimplePlayerData();
        },
    },
    methods: {
        apply() {
            try {
                this.$emit('selected-change', EVENT_TYPE.SINGLE_ALGORITHM_ANALYSIS, {
                    item: this.item,
                    selectedOption: this.selected,
                    options: this.list
                });
            } catch (e) {
                errorLog('[apply]', e);
            }
        },
        mouseenterHandle() {
            this.$emit('mouse-enter');
        },
        mouseleaveHandle() {
            this.$emit('mouse-leave');
        },
    },
};
</script>

<style lang="scss" scoped>
.algorithm-select {
    position: absolute;
    top: 30px;
    z-index: 999;
    padding: 12px 8px;
    background: #fff;
    border-radius: 4px;
    .inner {
        display: flex;
        align-items: start;
        flex-direction: column;
        color: rgba(0, 0, 0, 0.7);
        .el-checkbox-group {
            display: flex;
            flex-direction: column;
            .el-checkbox {
                margin: 0;
            }
        }
        ::v-deep .apply-btn {
            margin-left: 5px;
            span {
                color: rgb(30, 140, 230) !important;
            }
        }
    }

}
</style>
