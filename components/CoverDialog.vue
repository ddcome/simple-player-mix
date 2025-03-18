<template>
    <div
        v-if="visible"
        class="cover-dialog__wrap"
        :style="{ height: `${wrapHeight}px`, width: `${wrapWidth}px` }"
        hikcc_cover="opaque"
    >
        <div class="cover-dialog__header">
            <slot v-if="showHeader" name="header">
                <span class="header-text">{{ title }}</span>
                <i class="h-icon-close" @click="handlePanelCloseEvent" />
            </slot>
        </div>
        <div
            class="cover-dialog__content"
            :class="{ 'with-header': showHeader }"
        >
            <img :src="snapUrl" class="snap-dialog-img" />
        </div>
    </div>
</template>

<script>
export default {
    name: 'CoverDialog',
    props: {
        wrapHeight: {
            type: Number,
            default: 250
        },
        wrapWidth: {
            type: Number,
            default: 300
        },
        title: {
            type: String,
            default: ''
        },
        showClose: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            snapUrl: '',
            visible: false,
            leftSecond: 0
        };
    },
    computed: {
        showHeader() {
            return this.title || this.showClose;
        }
    },
    watch: {
        visible(newVal) {
            if (newVal) {
                setTimeout(this.handlePanelCloseEvent, 3000);
            }
        }
    },
    created() {},
    mounted() {
        const wrapNode = document.getElementsByClassName('cover-dialog__wrap')[0];
        wrapNode && document.body.appendChild(wrapNode);
    },
    methods: {
        open() {
            this.visible = true;
        },
        close() {
            this.visible = false;
        },
        // 展示截图缩略图
        showSnap(snapUrl, snapMsg) {
            this.snapUrl = 'data:image/jpeg;base64,' + snapUrl;
        },
        handlePanelCloseEvent() {
            this.$emit('update:visible', false); // sync修饰符
        }
    }
};
</script>

<style lang="scss" scoped>
.cover-dialog__wrap {
    position: absolute;
    right: 0;
    bottom: 0;
    .cover-dialog__header {
        height: 32px;
        background: #ffffff;
        line-height: 32px;
        font-size: 16px;
        color: #333333;
        padding-left: 8px;
        border-bottom: solid 1px rgba(0, 0, 0, 0.2);
        i {
            width: 32px;
            height: 32px;
            font-size: 24px;
            line-height: 32px;
            float: right;
            color: rgba(0, 0, 0, 0.5);
            cursor: pointer;
            &:hover {
                color: #333333;
            }
        }
        i::after {
            content: '';
            clear: both;
            display: block;
            overflow: hidden;
        }
    }
    .cover-dialog__content {
        display: flex;
        flex-flow: row nowrap;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        width: 100%;
        height: 100%;
        background: #ffffff;
        &.with-header {
            width: 100%;
            height: calc(100% - 32px);
        }
    }
}
</style>
