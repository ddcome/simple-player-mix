<template>
    <div
        :class="['svg-outer', {'svg-i-disabled': disabled}]"
        :style="{
            width: getPx,
            height: getPx,
            minWidth: getPx,
            minHeight: getPx,
        }"
    >
        <div
            :class="['svg-i-common', iconClass]"
            :style="{
                width: getPx,
                height: getPx,
                minWidth: getPx,
                minHeight: getPx,
                backgroundImage: `url('${iconUrl}')`,
                filter: `drop-shadow(-40px 0px 0px ${active?activeColor:color})`,
                '-webkit-filter': `drop-shadow(-40px 0px 0px ${active?activeColor:color})`,
                '-moz-filter': `drop-shadow(-40px 0px 0px ${active?activeColor:color})`,
                '-ms-filter': `drop-shadow(-40px 0px 0px ${active?activeColor:color})`,
                '-o-filter': `drop-shadow(-40px 0px 0px ${active?activeColor:color})`,
                '--hover-color': disabled?disabledColor:hoverColor,
                '--disabled-color': disabledColor
            }"
        />
    </div>
</template>

<script>
/**
 * @function
 * @description 播放器图标组件(已废弃，存在flex 1下低版本chrome兼容问题)
 * 主要！重要！重要！ 该组件要求加载的svg图片的fill-opacity="1"必须为不透明，若设置了半透明度，则会影响颜色值效果。
 * @author lixiaodong31 2023/11/23
 * @version 1.0.0
 * @example
 * <svg-icon icon="home" color="#FF0000" :font-size="1.2"></svg-icon>
 * <svg-icon icon="user" color="#00FF00" :size="40"></svg-icon>
 */
export default {
    props: {
        // 部分应用方，根节点字体不是正常数值，默认关闭rem单位
        openRem: {
            type: Boolean,
            default: false
        },
        icon: {
            type: String,
            required: null
        },
        disabled: {
            type: Boolean,
            required: false
        },
        active: {
            type: Boolean,
            default: false
        },
        activeColor: {
            type: String,
            default: 'blue'
        },
        hoverColor: {
            type: String,
            default: '#ffffff'
        },
        disabledColor: {
            type: String,
            default: '#777'
        },
        color: {
            type: String,
            default: '#aaaaaa' // 默认颜色为黑色
        },
        // 字体大小，rem单位
        fontSize: {
            type: Number,
            default: 1.5 // 默认
        },
        // 指定具体大小，若有值，则该项生效
        size: {
            type: Number,
            default: null // 默认
        }
    },
    computed: {
        iconClass() {
            return `svg-${this.icon}`;
        },
        iconUrl() {
            return require(`./../assets/svg-icons/${this.icon}.svg`);
        },
        iconColor() {
            // 可以在这里添加一些逻辑来处理颜色值，例如使用hex、rgb或其他格式的颜色值
            return this.color;
        },
        getPx() {
            if (this.openRem) {
                return !!this.size ? `${this.size}px` : `${this.fontSize}rem`;
            } else {
                // 假设基于基础字体大小是15
                return !!this.size ? `${this.size}px` : `${Math.ceil(this.fontSize * 15)}px`;
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.svg-outer {
    overflow: hidden;
    cursor: pointer;

    &:hover {
        .svg-i-common {
            filter: drop-shadow(-40px 0px 0px var(--hover-color)) !important;
            -webkit-filter: drop-shadow(-40px 0px 0px var(--hover-color)) !important;
            -moz-filter: drop-shadow(-40px 0px 0px var(--hover-color)) !important;
            -ms-filter: drop-shadow(-40px 0px 0px var(--hover-color)) !important;
            -o-filter: drop-shadow(-40px 0px 0px var(--hover-color)) !important;
        }
    }

    .svg-i-common {
        width: 16px;
        height: 16px;
        min-width: 16px;
        min-height: 16px;
        background-repeat: no-repeat;
        background-size: contain;
        transform: translateX(40px);
        pointer-events: auto;
    }
}

.svg-i-disabled {
    cursor: not-allowed !important;

    .svg-i-common {
        filter: drop-shadow(-40px 0px 0px var(--disabled-color)) !important;
        -webkit-filter: drop-shadow(-40px 0px 0px var(--disabled-color)) !important;
        -moz-filter: drop-shadow(-40px 0px 0px var(--disabled-color)) !important;
        -ms-filter: drop-shadow(-40px 0px 0px var(--disabled-color)) !important;
        -o-filter: drop-shadow(-40px 0px 0px var(--disabled-color)) !important;
    }
}
</style>
