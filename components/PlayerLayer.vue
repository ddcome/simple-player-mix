<template>
    <div class="player-outer" :class="getOuterClass()">
        <alert-layer :index="index" ref="alertLayerRef"/>
        <apply-auth-layer :index="index" ref="applyAuthLayerRef"/>
        <try-and-see-layer :index="index" ref="tryAndSeeLayerRef"/>
        <play-fail-layer :index="index" ref="playFailLayerRef"/>
        <no-event-video-layer :index="index" ref="noEventVideoLayerRef"/>
        <no-camera-exit-layer :index="index" ref="noCameraExitLayerRef"/>
        <stream-fail-layer :index="index" ref="streamFailLayerRef"/>
        <read-auth-fail-layer :index="index" ref="readAuthFailLayerRef"/>
        <!-- loading-layer，必须放置于最后 -->
        <loading-layer :index="index" ref="loadingLayerRef"/>
        <slot name="content"></slot>
    </div>
</template>
<script>
// 引入所有的遮罩层组件
import {allCompLayer} from './../layer';
import {getSimplePlayerData} from "./../lib";
import {errorLog} from "./../util/logger";

/**
 * @object
 * @description
 * LOADING_LAYER_REF - 加载中
 * ALERT_LAYER_REF - alert弹出提示层
 * APPLY_AUTH_LAYER_REF - 申请权限
 * TRY_AND_SEE_LAYER_REF - 试看几秒
 * PLAY_FAIL_LAYER_REF - 播放失败
 * NO_EVENT_VIDEO_LAYER_REF - 没有事件视频
 * READ_AUTH_FAIL_LAYER_REF - 获取权限信息失败
 * NO_CAMERA_EXIT_LAYER_REF - 设备不存在
 * @author lixiaodong31 2023/9/8
 * @version 1.0.0
 */
export const ALL_LAYER_REF = {
    ALERT_LAYER_REF: 'alertLayerRef',
    APPLY_AUTH_LAYER_REF: 'applyAuthLayerRef',
    TRY_AND_SEE_LAYER_REF: 'tryAndSeeLayerRef',
    PLAY_FAIL_LAYER_REF: 'playFailLayerRef',
    NO_EVENT_VIDEO_LAYER_REF: 'noEventVideoLayerRef',
    STREAM_FAIL_LAYER_REF: 'streamFailLayerRef',
    NO_CAMERA_EXIT_LAYER_REF: 'noCameraExitLayerRef',
    READ_AUTH_FAIL_LAYER_REF: 'readAuthFailLayerRef',
    LOADING_LAYER_REF: 'loadingLayerRef', // 必须置于最后
}
/**
 * @function
 * @description 播放器信息封面框
 * @return {String}
 * @author lixiaodong31 2023/8/15
 * @version 1.0.0
 * @example
 */
export default {
    components: {...allCompLayer},
    props: {
        index: {
            type: [String, Number],
            default: ''
        }
    },
    data() {
        return {};
    },
    computed: {
        simplePlayerData() {
            return getSimplePlayerData();
        },
    },
    mounted() {
        // 默认关闭所有
        this.closeAllLayer();
    },
    methods: {
        flesh() {
            Object.values(ALL_LAYER_REF).forEach((ref) => {
                this.$refs[ref] && this.$refs[ref].flesh();
            })
        },
        getOuterClass() {
            try {
                const canShowTitle = this.simplePlayerData.canShowTitle(this.index);
                const isEmptyWnd = this.simplePlayerData.isEmptyWnd(this.index);
                if (isEmptyWnd) {
                    return ['player-layer-outer', 'sp-body'];
                } else if (this.simplePlayerData.isPreviewStatus(this.index)) {
                    return ['player-layer-outer', canShowTitle?'sp-body-contain-title':'sp-body'];
                } else if (this.simplePlayerData.isPlaybackStatus(this.index)) {
                    return ['player-layer-outer', canShowTitle?'sp-body-back-contain-title':'sp-body-contain-footer'];
                } else {
                    return ['player-layer-outer', 'sp-body'];
                }
            } catch (e) {
                errorLog('[e]', e)
                return ['player-layer-outer', 'sp-body'];
            }
        },
        // 关闭图层提示
        closeLayer(refKey) {
            this.$refs[refKey] && this.$refs[refKey].close();
        },
        // 打开图层提示
        openLayer(refKey) {
            this.$refs[refKey] && this.$refs[refKey].open();
        },
        // 关闭所有图层提示
        closeAllLayer() {
            this.$nextTick(() => {
                Object.values(ALL_LAYER_REF).forEach((k) => {
                    this.$refs[k] && this.$refs[k].close();
                })
            });
        },
        // 抛出事件
        // 类型 + 参数 + 回调
        emitInnerEvent(type, params, callback) {
            this.$emit('layer-change', type, params, callback);
        },
    }
};
</script>

<style lang="scss" scoped>
.player-outer {
    height: 100%;
}

.player-layer-outer {
    height: 100%;
    width: 100%;
    background: #333;
}

.sp-body {
    height: 100%;
    width: 100%;
}

.sp-body-contain-footer {
    height: calc(100% - 32px);
    width: 100%;
}

// 既无标题栏也没有回放底部工具栏
.sp-body-back {
    height: calc(100% - 30px) !important;
    width: 100%;
}
// 只有标题栏
.sp-body-contain-title {
    height: calc(100% - 32px) !important;
    width: 100%;
}
// 包含标题栏和回放底部工具栏
.sp-body-back-contain-title {
    height: calc(100% - 62px) !important;
    width: 100%;
}

</style>
