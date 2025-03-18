<template>
    <div class="algo-outer" hikcc_cover="opaque">
        <div v-if="hasCategory" class="inner-left three-col">
            <algo-category
                :tree-data="treeData"
                @selected-node="selectedNodeHandle"
                @contain-next="containNextHandle"
            />
        </div>
        <div class="inner-middle" :class="hasCategory?'three-col':'two-col'">
            <unselected-algo
                ref="unselectedAlgoRef"
                :list="list"
                :contain-next="containNext"
                :filter-path="filterPath"
                @selected-change="selectedChangeHandle"
            />
        </div>
        <div class="inner-right" :class="hasCategory?'three-col':'two-col'">
            <selected-algo
                ref="selectedAlgoRef"
                :list="list"
                @clear="clearHandle"
            />
        </div>
    </div>
</template>

<script>
import algoCategory from './components/algo-category.vue';
import selectedAlgo from './components/selected-algo.vue';
import unselectedAlgo from './components/unselected-algo.vue';
import {isNotEmpty} from "./../../util/index";
import {addPathForTree, getAlgoFromTree} from "./util";
import {warnLog} from "./../../util/logger";

export default {
    props: {
        queryApi: {
            type: Function,
            default() {
                return null;
            }
        },
        algoId: {
            type: String,
            default: 'algapplyCode',
        },
        selected: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    components: {
        algoCategory,
        selectedAlgo,
        unselectedAlgo,
    },
    data() {
        return {
            loading: false,
            hasCategory: false,
            treeData: [],
            list: [],
            currentNode: {},
            filterPath: null,
            containNext: true,
        };
    },
    mounted() {
        this.init();
        this.initEvent();
    },
    beforeDestroy() {
        this.destroyEvent();
    },
    methods: {
        containNextHandle(containNext) {
            this.containNext = containNext;
            const { data, node } = this.currentNode;
            this.selectedNodeHandle(data, node);
        },
        // 选中树节点
        // 数数据仅仅是一个条件，视同待选择算法的一个筛选条件，待选择算法数据源于最初初始化，而不是树
        selectedNodeHandle(data, node) {
            this.currentNode = { data, node };
            console.log(data, node);
            const { id, path } = data;
            if (this.containNext) this.filterPath = id;
            else this.filterPath = path;
        },
        // 删除操作需要外部处理，组件内部为只读和事件抛出
        clearHandle(row) {
            if (isNotEmpty(row)) { // 删除一个
                const index = this.list.findIndex(c => c[this.algoId] === row[this.algoId]);
                this.$set(this.list, index, {
                    ...this.list[index],
                    selected: false,
                });
            } else { // 清空
                this.list = this.list.map(c => ({
                    ...c,
                    selected: false,
                }));
            }
        },
        // 对外提供
        getSelected() {
            return this.list && this.list.filter(c => c.selected) || [];
        },
        selectedChangeHandle(list) {
            console.log('[current changed list is ]', list);
            let temp;
            this.list = this.list.map((c) => {
                temp = list.find(c1 => c[this.algoId] === c1[this.algoId]);
                if (temp) {
                    return {
                        ...c,
                        ...temp
                    };
                }
                return c;
            });
        },
        destroyEvent() {
            window.removeEventListener('resize', this.doResize);
        },
        initEvent() {
            this.doResize();
            window.addEventListener('resize', this.doResize);
        },
        doResize() {
            if (this.$refs.unselectedAlgoRef) {
                this.$refs.unselectedAlgoRef.doResize && this.$refs.unselectedAlgoRef.doResize();
            }
            if (this.$refs.selectedAlgoRef) {
                this.$refs.selectedAlgoRef.doResize && this.$refs.selectedAlgoRef.doResize();
            }
        },
        // 开始加载
        openLoading() {
            this.loading = true;
        },
        // 关闭加载
        closeLoading() {
            this.loading = false;
        },
        getSelectedIds() {
            return this.selected && this.selected.map(c => c[this.algoId]) || [];
        },
        async init() {
            try {
                this.openLoading();
                const resp = await this.queryApi().catch(() => {
                    this.closeLoading();
                });
                this.closeLoading();
                const selectedList = this.getSelectedIds();
                if ([0, '0'].includes(resp.code) && resp.data) {
                    console.log('[resp.data][][]', resp.data);
                    const {children} = resp.data;
                    // 未分组情景
                    if (children && children.length === 1 && children[0].id === 'ungrouped') {
                        this.list = children[0].algorithms.map((c) => ({
                            ...c,
                            innerId: c[this.algoId], // 内部依赖的唯一ID
                            selected: selectedList.includes(c[this.algoId]),
                        }));
                        this.hasCategory = false;
                    }

                    // 存在分组
                    if (children && children.length > 1) {
                        this.hasCategory = true;
                        this.treeData = children;
                        this.list = getAlgoFromTree(addPathForTree(children, '')).map((c) => ({
                            ...c,
                            innerId: c[this.algoId], // 内部依赖的唯一ID
                            selected: selectedList.includes(c[this.algoId]),
                        }));
                    }
                }
            } catch (e) {
                warnLog('init error, Maybe cause this problem is not config queryApi props, please check your code', e, 'queryApi Props is ', this.queryApi);
            }
        },
    }
};
</script>

<style lang="scss" scoped>
.algo-outer {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    .inner-left {
        width: 280px;
    }

    .inner-left,
    .inner-middle,
    .inner-right {
        padding: 12px;
        border: 1px solid rgba(0, 0, 0, 0.12);
    }

    .inner-middle.two-col {
        width: calc(50% - 8px);
    }

    .inner-right.two-col {
        width: calc(50% - 8px);
    }

    .inner-middle.three-col {
        width: calc((100% - 280px) / 2 - 8px);
        margin-right: 8px;
    }

    .inner-right.three-col {
        width: calc((100% - 280px) / 2 - 8px);
        margin-left: 8px;
    }

}
</style>
