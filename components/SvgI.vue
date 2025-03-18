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
    <svg
      class="svg-icon"
      aria-hidden="true"
      :style="{
        '--hover-color': this.disabled?this.disabledColor:this.hoverColor,
        '--color': this.active?this.activeColor:this.disabled?this.disabledColor:this.color
      }"
    >
      <use :xlink:href="iconName"/>
    </svg>
  </div>
</template>

<script>
const requireAll = requireContext => requireContext.keys().map(requireContext);
const req = require.context("./../assets/svg-icons", true, /.svg$/);
requireAll(req);

/**
 * @function
 * @description 播放器图标组件
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
    iconName() {
      return `#icon-${this.icon}`;
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
}

.svg-i-disabled {
  cursor: not-allowed !important;
}

.svg-icon {
  width: 100%;
  height: 100%;
  fill: currentColor;
  overflow: hidden;
  color: var(--color);

  &:hover {
    color: var(--hover-color);
  }
}
</style>
