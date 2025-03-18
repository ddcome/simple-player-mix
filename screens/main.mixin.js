import {getSimplePlayerData} from "./../lib";

export const MainMixin = {
    data() {
        return {
            timer: null,
            currentId: 0
        }
    },
    computed: {
        simplePlayerData() {
            return getSimplePlayerData();
        },
    },
    directives: {
        selected: {
            // 当被绑定的元素插入到DOM中时调用
            inserted: function (el, binding) {
                // 检查是否为选中状态
                if (binding.value) {
                    el.classList.add('common-screen-selected');
                }
            },
            // 当绑定的数据更新时调用
            update: function (el, binding) {
                // 如果不再是选中状态，移除类名
                if (!binding.value) {
                    el.classList.remove('common-screen-selected');
                } else {
                    el.classList.add('common-screen-selected');
                }
            }
        }
    },
    methods: {
        getId(index) {
            return index - 1;
        },
        update() {
            this.currentId = this.simplePlayerData.getSelectedWnd();
        },
        getSelectedId(id) {
            return this.currentId === Number(id);
        },
        mouseenterHandle(e) {
            const target = e.target;
            this.$emit('wnd-mouseenter', target.dataset.index);
        },
        mouseleaveHandle(e) {
            const target = e.target;
            this.$emit('wnd-mouseleave', target.dataset.index);
        },
        mouseupHandle(index) {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                // 执行单击操作
                this.$emit('wnd-mouseup', index)
            }, 250);
        },
    }
}
