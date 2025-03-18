<template>
    <div class="unselected-algo" ref="unselectedAlgoRef">
        <div class="title">
            待选择算法（{{ tableData.length }}）
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
        <el-table
            :data="tableData"
            :height="height"
            style="width: 100%"
        >
            <el-table-column prop="placeName" width="50" :render-header="renderHeaderHandle">
                <template slot-scope="scope">
                    <el-checkbox v-model="scope.row.selected"
                                 @change="(checked) => cellSelectedHandle(scope.row, checked)"
                    />
                </template>
            </el-table-column>
            <el-table-column
                prop="name"
                show-overflow-tooltip
                label="算法名称"
            >
                <template slot-scope="scope">
                    <span v-if="scope.row.hasOwnProperty('highlightNameHtml') && scope.row.highlightNameHtml"
                          v-html="scope.row.highlightNameHtml"></span>
                    <template v-else>{{ scope.row.name }}</template>
                </template>
            </el-table-column>
            <el-table-column prop="sourceType" width="150" label="分析源类型">
                <template slot-scope="scope">
                    {{ scope.row.sourceType | sourceTypeFilter }}
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
import {isEmpty} from "./../../../util";

export default {
    props: {
        list: {
            type: Array,
            default() {
                return [];
            }
        },
        filterPath: {
            type: String,
            default: '',
        },
        containNext: {
            type: Boolean,
            default: true,
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
                this.tableDataCopy = value;
                if (this.filterPath && this.filterText) {
                    this.handleIconClick();
                } else if(this.filterPath) {
                    this.tableData = this.tableDataCopy.filter(c => this.getPathValid(c.path));
                } else if (this.filterText) {
                    this.tableData = this.tableDataCopy.filter(c => c.name.indexOf(this.filterText) >= 0).map((c) => ({
                        ...c,
                        highlightNameHtml: getRedTextHtml(this.filterText, c.name)
                    }));
                }else {
                    this.tableData = value;
                }
                this.updateSelectAll();
            },
            deep: true,
        },
        filterPath: {
            handler(value) {
                this.tableData = this.tableDataCopy.filter(c => this.getPathValid(c.path, value));
                this.updateSelectAll();
            },
            deep: true,
        },
    },
    data() {
        return {
            tableData: [],
            tableDataCopy: [],
            indeterminate: false,
            filterText: '',
            height: 0,
            selectAll: false
        };
    },
    methods: {
        doResize() {
            this.height = this.$refs.unselectedAlgoRef.clientHeight - 24 - 24 - 32;
        },
        getPathValid(path, value = null) {
            const v = value || this.filterPath;
            return this.containNext?
                path.indexOf(v) >= 0 :
                (`${v}/` === path || v === path);
        },
        handleIconClick() {
            this.tableData = this.tableDataCopy.filter(c => (
                (this.getPathValid(c.path) || isEmpty(this.filterPath)) &&
                c.name.indexOf(this.filterText) >= 0)
            ).map((c) => ({
                ...c,
                highlightNameHtml: getRedTextHtml(this.filterText, c.name)
            }));
        },
        clearIconClick() {
            if (this.filterPath) {
                this.tableData = this.tableDataCopy.filter(c => this.getPathValid(c.path));
            } else {
                this.tableData = this.tableDataCopy;
            }
            this.updateSelectAll();
        },
        // 单元格中checkbox改变时
        cellSelectedHandle(row, value) {
            row.selected = value;
            this.updateSelectAll();
            console.log('[全量数据]', this.tableDataCopy);
            console.log('[当前渲染的数据]', this.tableData);
            this.$emit('selected-change', this.tableData);
        },
        // 更新全选按钮
        updateSelectAll() {
            if (this.tableData && this.tableData.length > 0) {
                const all = this.tableData.every(c => c.selected);
                const halfChecked = this.tableData.some(c => c.selected);

                this.indeterminate = !all && halfChecked ? true : false;
                this.selectAll = all;
                console.log('[this.indeterminate]', this.indeterminate);
            } else {
                this.indeterminate = false;
                this.selectAll = false;
            }
        },
        // 渲染表头
        renderHeaderHandle(h) {
            return h("span", [
                h("el-checkbox", {
                    on: {
                        change: this.selectedAllChange
                    },
                    props: {
                        value: this.selectAll,
                        indeterminate: this.indeterminate
                    }
                })
            ]);
        },
        selectedAllChange(value) {
            this.indeterminate = false;
            this.selectAll = value;
            this.tableData = this.tableData.map((c, i) => ({
                ...c,
                updateKey: `${new Date().getTime()}_${i}`,
                selected: this.selectAll,
            }));
            this.$emit('selected-change', this.tableData);
        },
    }
};
</script>

<style lang="scss" scoped>
.unselected-algo {
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
        color: rgb(0, 0, 0);
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
