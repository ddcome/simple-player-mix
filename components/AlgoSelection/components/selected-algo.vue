<template>
    <div class="selected-algo" ref="selectedAlgoRef">
        <div class="title">
            <span>已选择算法（{{ tableData.length }}）</span>
            <el-button icon="h-icon-delete" @click="clearHandle()">清空</el-button>
        </div>
        <div class="filter-input">
            <el-input
                v-model="filterText"
                placeholder="搜索算法名称"
                class="filter-tree-input"
                suffix-icon="h-icon-search"
                clearable
                :on-icon-click="handleIconClick"
                :clear-icon-click="clearIconClick"
                @keyup.enter.native="handleIconClick"
            />
        </div>
        <el-table :data="tableData" :height="height" style="width: 100%">
            <el-table-column
                prop="name"
                show-overflow-tooltip
                label="算法名称"
            >
                <template slot-scope="scope">
                    <span v-if="scope.row.hasOwnProperty('selectedHighlightNameHtml') && scope.row.selectedHighlightNameHtml"
                          v-html="scope.row.selectedHighlightNameHtml"></span>
                    <template v-else>{{ scope.row.name }}</template>
                </template>
            </el-table-column>
            <!--<el-table-column prop="sourceType" width="100" label="分析源类型">-->
            <!--    <template slot-scope="scope">-->
            <!--        {{ scope.row.sourceType | sourceTypeFilter }}-->
            <!--    </template>-->
            <!--</el-table-column>-->
            <el-table-column prop="version" width="150" label="算法版本">
                <template slot-scope="scope">
                    <el-select
                        v-if="scope.row.hasOwnProperty('versionList')"
                        v-model="scope.row.version"
                        placeholder="请选择算法版本"
                    >
                        <el-option
                            v-for="item in scope.row.versionList"
                            :key="item.version"
                            :label="item.version"
                            :value="item.version"
                        >
                        </el-option>
                    </el-select>
                    <span v-else>{{ scope.row.version }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="opt" width="60" label="操作">
                <template slot-scope="scope">
                    <el-button icon="h-icon-delete" @click="deleteHandle(scope.row)"/>
                </template>
            </el-table-column>
            <template #empty>
                <h-empty size="xs"/>
            </template>
        </el-table>
    </div>
</template>

<script>
import {getRedTextHtml} from "./../util";

export default {
    props: {
        list: {
            type: Array,
            default() {
                return [];
            }
        },
    },
    filters: {
        sourceTypeFilter(val) {
            switch (val) {
                case 'video':
                    return '视频';
                case 'picture':
                    return '图片';
                default:
                    return val;
            }
        }
    },
    watch: {
        list: {
            handler(value) {
                this.tableData = value.filter(c => c.selected);
                this.tableDataCopy = value.filter(c => c.selected);
            },
            deep: true,
        }
    },
    data() {
        return {
            tableData: [],
            tableDataCopy: [],
            filterText: '',
            height: 0,
            options: [],
        };
    },
    methods: {
        clearHandle() {
            this.$emit('clear');
        },
        deleteHandle(row) {
            this.$emit('clear', row);
        },
        doResize() {
            this.height = this.$refs.selectedAlgoRef.clientHeight - 24 - 24 - 32;
        },
        handleIconClick() {
            this.tableData = this.tableDataCopy.filter(c => c.name.indexOf(this.filterText) >= 0).map((c) => ({
                ...c,
                selectedHighlightNameHtml: getRedTextHtml(this.filterText, c.name)
            }));
        },
        clearIconClick() {
            this.tableData = this.tableDataCopy;
        },
    }
};
</script>

<style lang="scss" scoped>
.selected-algo {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px;
    .title,
    .filter-input {
        width: 100%;
        margin-bottom: 12px;
    }
    .title {
        height: 24px;
        line-height: 24px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        span {
            color: rgb(0, 0, 0);
        }
    }
    .filter-input {
        height: 32px;
    }
    ::v-deep .el-table {
        border: 0;

        .el-table__body-wrapper::before,
        &::before,
        &::after {
            width: 0 !important;
            height: 0 !important;
        }
    }
    ::v-deep .el-table th {
        height: 40px;
    }
}
</style>
