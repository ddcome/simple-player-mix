<template>
   <div ref="alertLayerRef" v-if="visible" hikcc_cover="opaque" class="alert-layer" >
       <el-alert
           title="该设备未校时，时间可能错位，非浓缩片段将以16倍速播放，可联系管理员调整。"
           type="info"
           simple
           show-icon
       ></el-alert>
   </div>
</template>
<script>
import {CommonMixin} from "./mixin";

export default {
    mixins: [CommonMixin],
    data() {
        return {
            showMiniIcon: false,
            width: 0
        }
    },
    watch: {
        width() {
            this.showMiniIcon = this.width < 590;
        },
        visible() {
            this.visible && this.initWidth();
        }
    },
    mounted() {
        this.visible && this.initWidth();
    },
    beforeDestroy() {
    },
    methods: {
        initWidth() {
            this.width = this.$refs.alertLayerRef.offsetWidth;
        },
    }
}
</script>
<style lang="scss" scoped>
.el-alert--info {
    background: rgb(232, 244, 255) !important;
}
</style>
