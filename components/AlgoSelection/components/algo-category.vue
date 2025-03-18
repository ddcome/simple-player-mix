<template>
    <div class="algo-category">
        <div class="title">
            <span class="title-left">算法分类</span>
            <el-checkbox v-model="containNext" @change="containNextHandle">包含下级</el-checkbox>
        </div>
        <el-input
            v-model="filterText"
            placeholder="搜索算法分类名称"
            class="filter-tree-input"
            suffix-icon="h-icon-search"
            clearable
            :on-icon-click="handleIconClick"
            :clear-icon-click="clearIconClick"
            @keyup.enter.native="handleIconClick"
        />

        <div class="inner-content">
            <el-tree
                ref="treeRef"
                :data="treeData"
                :props="defaultProps"
                node-key="id"
                default-expand-all
                default-icon="h-icon-folder"
                :filter-node-method="filterNode"
                :render-content="highlightRender"
                @node-click="handleTreeNodeClick"
            />
        </div>
    </div>
</template>

<script>
export default {
    props: {
        treeData: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    watch: {
        treeData: {
            handler(value) {
                this.$nextTick(() => {
                    value && value[0] && this.$refs.treeRef.setCurrentNode(value[0]);
                    this.handleTreeNodeClick(value[0], null);
                });
            },
            deep: true,
            immediate: true,
        }
    },
    data() {
        return {
            containNext: true,
            filterText: '',
            defaultProps: {
                children: 'children',
                label: 'name',
                icon: 'icon'
            },
        };
    },
    methods: {
        containNextHandle() {
            this.$emit('contain-next', this.containNext);
        },
        handleIconClick() {

        },
        clearIconClick() {

        },
        filterNode(value, data) {
            if (!value) return true;
            return data.label.indexOf(value) !== -1;
        },
        highlightRender(h, {node}) {
            const filterText = this.filterText;
            const name = node.label;
            if (filterText) {
                // 支持大小写模糊搜索
                // specialCharts：特殊字符集合，这些字符不能直接塞进正则里，需要先转译
                const specialCharts = ['(', ')', "'", '\\', '$', '*', '+', '[', ']', '?', '^', '{', '}', '|', '.'];
                let wordStr = '';
                if (specialCharts.includes(filterText)) {
                    wordStr += `\\${filterText}`;
                } else {
                    wordStr += filterText;
                }
                const wordReg = new RegExp(wordStr, 'ig');
                const keyWordArr = name.match(wordReg);
                const vNodeArr = name.split(wordReg).reduce((all, item, index, arr) => {
                    item && all.push(h('span', {}, item));
                    if (index !== arr.length - 1) {
                        all.push(h('span', {class: 'el-tree-node_highlight'}, keyWordArr.shift()));
                    }
                    return all;
                }, []);
                return h('span', {class: 'el-tree-node__label'}, vNodeArr);
            } else {
                return h('span', {class: 'el-tree-node__label'}, name);
            }
        },
        handleTreeNodeClick(data, node) {
            this.$emit('selected-node', data, node);
        }
    }
};
</script>

<style lang="scss" scoped>
.algo-category {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 0;
    display: flex;
    flex-direction: column;

    .title,
    .filter-tree-input,
    .inner-content {
        width: 100%;
        margin-bottom: 12px;
    }

    .title {
        height: 24px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        .title-left {
            height: 24px;
            line-height: 24px;
            color: rgba(0, 0, 0, 0.9);
        }
    }

    .filter-tree-input {
        height: 32px;
        display: block;
    }

    .inner-content {
        height: calc(100% - 24px - 32px - 36px);
    }
}
</style>
