<template>
    <div class="apply-auth-layer" v-if="visible" hikcc_cover="opaque">
        <div class="auth-get-icon">
            <i class="h-icon-lock"/>
        </div>
        <div class="auth-get-title">
            {{ hasApplyAuth() ? `先申请权限，后查看视频` : `先配置权限，后查看视频` }}
        </div>
        <div class="auth-get-button" v-if="hasApplyAuth()">
            <el-button type="primary" @click="applyAuth">立即申请</el-button>
        </div>
        <div class="auth-get-close">
            <div class="btn-close" title="关闭" @click="close()">
                <svg-i icon="close"/>
            </div>
        </div>
    </div>
</template>
<script>
import {CommonMixin} from "./mixin";
import {getSimplePlayerData} from "./../lib";
import SvgI from './../components/SvgI';
import {EVENT_TYPE, PLAYER_STATUS_MAP} from "./../lib/params.lib";
import {isNotEmpty} from "./../util";

export default {
    components: {SvgI},
    mixins: [CommonMixin],
    data() {
        return {
            hasAllAuth: false
        }
    },
    computed: {
        simplePlayerData() {
            return getSimplePlayerData();
        },
        wndStatus() {
            return getSimplePlayerData().getWndStatus(this.index);
        },
        indexCode() {
            return [getSimplePlayerData().getIndexCode(this.index)]
        }
    },
    mounted() {
        // 检测是否有权限
        this.init();
    },
    methods: {
        // 覆写
        open() {
            this.visible = true;
            this.$parent && this.$parent.emitInnerEvent(EVENT_TYPE.APPLY_AUTH_OPENED, {
                index: this.index,
                visible: this.visible
            });
        },
        init() {
            const {previewAuth, playbackAuth, status} = this.simplePlayerData.getWndStatus(this.index);
            if (this.simplePlayerData.isPreviewStatus(this.index)) {
                if (previewAuth || ![PLAYER_STATUS_MAP.PLAYING, PLAYER_STATUS_MAP.PAUSE].includes(status)) this.close();
            }
            if (this.simplePlayerData.isPlaybackStatus(this.index)) {
                if (playbackAuth || ![PLAYER_STATUS_MAP.PLAYING, PLAYER_STATUS_MAP.PAUSE].includes(status)) this.close();
            }
        },
        hasApplyAuth() {
            const hasApply = this.simplePlayerData.getHasApplyAuth();
            return (isNotEmpty(hasApply) && hasApply === true);
        },
        applyAuth() {
            this.layerChange(EVENT_TYPE.APPLY_AUTH, {index: this.index});
        }
    }
}
</script>
<style lang="scss" scoped>
.apply-auth-layer {
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: #262626;
    z-index: 101;

    .auth-get-icon {
        text-align: center;

        .h-icon-lock {
            font-size: 50px;
        }
    }

    .auth-get-title {
        opacity: 0.5;
        font-size: 16px;
        line-height: 36px;
        height: 36px;
        color: #ffffff;
        letter-spacing: 0;
        text-align: center;
    }

    .auth-get-button {
        padding-top: 3%; // 采用比例，适应不同屏幕下
        text-align: center;
    }

    .auth-get-close {
        position: absolute;
        top: 0;
        right: 0;
        width: 32px;
        height: 32px;

        .btn-close {
            position: relative;
            top: 5px;
        }
    }
}
</style>
