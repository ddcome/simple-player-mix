<template>
    <div class="read-auth-fail-layer" v-if="visible" hikcc_cover="opaque">
        <div class="auth-get-title">
            获取点位权限信息失败
        </div>
    </div>
</template>
<script>
import {CommonMixin} from "./mixin";

export default {
    mixins: [CommonMixin],
    methods: {
        open() {
            this.$parent.closeAllLayer();
            this.$nextTick(() => {
                this.visible = true;
            });
        }
    }
}
</script>
<style lang="scss" scoped>
.read-auth-fail-layer {
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: #262626;
    z-index: 102;

    .auth-get-title {
        opacity: 0.5;
        font-size: 16px;
        line-height: 36px;
        height: 36px;
        color: #ffffff;
        letter-spacing: 0;
        text-align: center;
    }
}
</style>
