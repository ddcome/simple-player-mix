<template>
    <div class="diff-screen" hikcc_cover="opaque" v-if="visible">
        <p class="diff-title">
            <span class="title-span">窗口分割</span>
            <svg-i
                class="screen-icon"
                title="关闭"
                :font-size="1.2"
                color="#000"
                hoverColor="#000"
                icon="close"
                @click.native="close()"
            />
        </p>
        <div class="diff-content" @click.stop="screenChange">
            <template v-for="item in list">
                <div class="group-ul-title" :key="item.value">{{ item.label }}</div>
                <ul class="group-ul" :key="item.value">
                    <li v-for="child in item.children" :key="child.id">
                        <svg-i
                            class="screen-icon"
                            :title="child.title"
                            :font-size="3"
                            hoverColor="#79b3fa"
                            :color="child.selected?'#79b3fa':'#D2D2D2'"
                            :icon="child.icon"
                        />
                    </li>
                </ul>
            </template>
        </div>
    </div>
</template>

<script>
import SvgI from './SvgI';
import {getSimplePlayerData} from "./../lib";

// group和中文对应关系
const NAME_GROUP_MAP = {
    average: '平均',
    highlight: '高亮分割',
    horizontal: '水平',
    vertical: '垂直',
    other: '其他',
};

export default {
    components: { SvgI },
    data() {
        return {
            visible: false,
            list: [],
        };
    },
    computed: {
        simplePlayerData() {
            return getSimplePlayerData();
        },
    },
    created() {
        this.init();
    },
    methods: {
        screenChange(e) {
            if (e.target && e.target.nodeName === 'use') {
                const iconId = e.target.href.baseVal;
                const icon = iconId && iconId.replace('#icon-', '');
                const temp = this.simplePlayerData.getScreenMap();
                const item = temp.find(c => c.icon === icon);
                temp.forEach((c) => {
                    c.selected = c.id === item.id;
                });
                this.$emit('diff-screen-change', item);
            }
        },
        init() {
            const temp = this.simplePlayerData.getScreenMap();
            Object.keys(NAME_GROUP_MAP).forEach((k) => {
                this.list.push({
                    label: NAME_GROUP_MAP[k],
                    value: k,
                    children: temp.filter(c => c.group === k)
                });
            });
        },
        open() {
            this.visible = true;
        },
        close() {
            this.visible = false;
        }
    }
}
</script>

<style lang="scss" scoped>
.diff-screen {
    width: 528px;
    height: 100%;
    background-color: #fff;
    position: absolute;
    right: 0;
    z-index: 9999;
    top: 0;

    .diff-title {
        padding: 0 20px;
        height: 60px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #eee;
        .title-span {
            font-weight: bold;
            font-size: 18px;
        }
    }

    .diff-content {
        padding: 0 20px;
        .group-ul-title {
            height: 30px;
            color: rgba(0, 0, 0, 0.7);
            font-weight: 400;
            font-size: 16px;
            margin: 20px 0 10px 0;
        }

        .group-ul {
            display: flex;
            flex-direction: row;

            li {
                margin-right: 16px;
            }
        }
    }
}
</style>
