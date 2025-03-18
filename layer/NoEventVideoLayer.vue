<template>
    <div class="no-event-video-layer" v-if="visible" hikcc_cover="opaque">
        <p>从2022-06-12 18:00:00至2022-06-13 00:00:00</p>
        <p>没有相关事件浓缩视频录像</p>
        <el-button icon="h-icon-calendar" type="primary" :radius="true">选择时间</el-button>
    </div>
</template>
<script>
import {CommonMixin} from "./mixin";

/**
* @function
* @description 没有相关事件浓缩视频录像
* @return {String}
* @author lixiaodong31 2023/9/8
* @version 1.0.0
* @example
*/
export default {
    mixins: [CommonMixin],
    data() {
        return {}
    }
}
</script>
<style lang="scss" scoped>
@import "style";
.no-event-video-layer {
    @extend .full-screen;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}
p {
    @extend .common-word;
}
.el-button {
    @extend .common-button;
}
</style>
