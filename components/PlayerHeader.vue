<template>
    <div
        v-if="showTool || !!getPlayerTitle()"
        ref="spHeaderRef"
        class="sp-header sp-header-part top-tool"
        :style="{ position: !getPlayerTitle()?'absolute':'relative', top: 0 }"
        hikcc_cover="opaque"
    >
        <div v-if="showTool" class="sp-btn-group" :key-debug="rootKey" :key="rootKey">
            <div
                class="btn btn-switch"
                title="点击切换"
                @click="switchStatusHandle"
            >
                <span class="circle" :class="{ 'preview': isPreview(), 'playback': isPlayBack() }"/>
                <span class="text" :class="{ 'preview': isPreview(), 'playback': isPlayBack() }">
                    {{ getPlayStatusZn() }}
                </span>
            </div>
            <div v-if="!isPreviewError()" class="btn-tools">
                <!-- 枪机有可能是云台枪机，有前后推移的功能；球机有云台能力，此处不做枪机和球机的判断-->
                <div
                    v-show="isPreview() && hasPtzAbility() && hasAction(ACTION.PTZ_AUTH)"
                    class="btn"
                    :title="hasAction(ACTION.PTZ)?'关闭云台':'开启云台'"
                    @click="toolbarClick(ACTION.PTZ)"
                >
                    <svg-i :hover-color="activatedColor" :active-color="activatedColor" :active="hasAction(ACTION.PTZ)"
                           :disabled="isNotPlaying()" icon="ptz"/>
                </div>
                <div
                    v-show="hasShotAuth() && hasAbility(isPreview()?ACTION.PLAY_SNAP_ABILITY:ACTION.PLAYBACK_SNAP_AUTH)"
                    class="btn"
                    title="抓图"
                    @mousedown.left="snapStartClick(ACTION.SNAP)"
                    @mouseup.left="snapEndClick(ACTION.SNAP)"
                >
                    <svg-i :hover-color="activatedColor" :active-color="activatedColor" :active="hasAction(ACTION.SNAP)"
                           :disabled="isNotPlaying()"
                           icon="camera"/>
                </div>
                <div
                    v-show="hasAction(ACTION.DIGITAL_ZOOM_AUTH)"
                    class="btn"
                    :title="hasAction(ACTION.DIGITAL_ZOOM)?'关闭电子放大':'打开电子放大'"
                    @click="toolbarClick(ACTION.DIGITAL_ZOOM)"
                >
                    <svg-i :hover-color="activatedColor" :active-color="activatedColor"
                           :active="hasAction(ACTION.DIGITAL_ZOOM)" :disabled="isNotPlaying()"
                           icon="dianzi-big"/>
                </div>
                <div
                    v-show="hasAction(ACTION.AUDIO_RECV_AUTH) && hasAbility(ACTION.AUDIO_RECV_ABILITY)"
                    class="btn"
                    :title="hasAction(ACTION.SOUND)?'关闭声音':'开启声音'"
                    @click="toolbarClick(ACTION.SOUND)"
                >
                    <svg-i :hover-color="activatedColor" :active-color="activatedColor"
                           :active="hasAction(ACTION.SOUND)" :disabled="isNotPlaying()"
                           :icon="hasAction(ACTION.SOUND)?'sound-up':'sound-off'"/>
                </div>
                <div
                    v-show="isPreview() && hasAction(ACTION.TALK_AUTH) && hasAbility(ACTION.TALK_ABILITY)"
                    class="btn"
                    :title="hasAction(ACTION.TALK)?'停止语音对讲':'开始语音对讲'"
                    @click="toolbarClick(ACTION.TALK)"
                >
                    <svg-i :hover-color="activatedColor" :active-color="activatedColor" :active="hasAction(ACTION.TALK)"
                           :disabled="isNotPlaying()"
                           :icon="hasAction(ACTION.TALK)?'huatong':'huatong-close'"/>
                </div>
                <div
                    v-show="isPreview() && hasAction(ACTION.PREVIEW_RECORD_AUTH) && hasAbility(ACTION.PREVIEW_RECORD_ABILITY)"
                    class="btn"
                    :title="hasAction(ACTION.PREVIEW_RECORD)?'停止录像':'开始录像'"
                    @click="toolbarClick(ACTION.PREVIEW_RECORD)"
                >
                    <svg-i :hover-color="activatedColor" :active-color="activatedColor"
                           :active="hasAction(ACTION.PREVIEW_RECORD)" :disabled="isNotPlaying()"
                           icon="video"/>
                </div>
                <div
                    v-show="isPlayBack() && hasAction(ACTION.PLAYBACK_RECORD_AUTH) && hasAbility(ACTION.PLAYBACK_RECORD_ABILITY)"
                    class="btn"
                    :title="hasAction(ACTION.PLAYBACK_RECORD)?'停止录像':'开始录像'"
                    @click="toolbarClick(ACTION.PLAYBACK_RECORD)"
                >
                    <svg-i :hover-color="activatedColor" :active-color="activatedColor"
                           :active="hasAction(ACTION.PLAYBACK_RECORD)" :disabled="isNotPlaying()"
                           icon="camera-left"/>
                </div>
                <!-- 3D放大需要设备具有云台能力-->
                <div
                    v-show="isPreview() && hasPtzAbility() && hasAction(ACTION.TD_ZOOM_AUTH)"
                    class="btn"
                    title="3D放大"
                    @click="toolbarClick(ACTION.TD_ZOOM)"
                >
                    <svg-i :hover-color="activatedColor" :active-color="activatedColor"
                           :active="hasAction(ACTION.TD_ZOOM)" :disabled="isNotPlaying()"
                           icon="3d"/>
                </div>
                <div
                    v-show="!isH5Player() && hasShotAuth() && hasAbility(isPreview()?ACTION.PLAY_SNAP_ABILITY:ACTION.PLAYBACK_SNAP_AUTH)"
                    class="btn"
                    title="连续抓拍"
                    @mousedown.left="snapStartClick(ACTION.SNAP_MORE)"
                    @mouseup.left="snapEndClick(ACTION.SNAP_MORE)"
                >
                    <svg-i :hover-color="activatedColor" :active-color="activatedColor" :active="hasAction(ACTION.SNAP)"
                           :disabled="isNotPlaying()"
                           icon="camera-more"/>
                </div>
                <!--详情控制是否显示-->
                <i
                    v-show="hasAction(ACTION.INFO)"
                    class="h-icon-info self-define__info"
                    title="详情"
                    @click="toolbarClick(ACTION.INFO)"
                />
                <!--其他功能-->
                <div
                    v-if="showAlgorithmAnalysis()"
                    class="btn"
                    title="算法分析"
                    @mouseenter="showOpt=true"
                    @mouseleave="leaveHandle()"
                >
                    <svg-i :hover-color="activatedColor" :active-color="activatedColor" :disabled="isNotPlaying()"
                           icon="algorithm-analysis"/>
                    <AlgorithmSelect
                        v-if="showOpt"
                        :item="getAlgorithmSelectItem()"
                        :list="algorithmSelectList"
                        @selected-change="algoSelectedChangeHandle"
                        @mouse-enter="algoEnterHandle"
                        @mouse-leave="algoLeaveHandle"
                    />
                </div>
                <div
                    v-if="showLabelTag()"
                    class="btn"
                    title="标签标记"
                    @click="toolbarClick(ACTION.LABEL_TAG)"
                >
                    <svg-i :hover-color="activatedColor" :active-color="activatedColor" :disabled="isNotPlaying()"
                           icon="label-tag"/>
                </div>
                <div
                    v-if="isPreview() && showEventReport()"
                    class="btn"
                    title="事件上报"
                    @click="toolbarClick(ACTION.EVENT_REPORT)"
                >
                    <svg-i :hover-color="activatedColor" :active-color="activatedColor" :disabled="isNotPlaying()"
                           icon="event-report"/>
                </div>
                <div
                    v-if="isPreview() && showPictureTag()"
                    class="btn"
                    title="图片标签"
                    @click="toolbarClick(ACTION.PICTURE_TAG)"
                >
                    <svg-i :hover-color="activatedColor" :active-color="activatedColor" :disabled="isNotPlaying()"
                           icon="picture-tag"/>
                </div>
                <div
                    v-if="showAiRecommend()"
                    class="btn"
                    title="智能推荐"
                    @click="toolbarClick(ACTION.AI_RECOMMEND)"
                >
                    <svg-i :hover-color="activatedColor" :active-color="activatedColor" :disabled="isNotPlaying()"
                           icon="ai-event"/>
                </div>
            </div>
        </div>
        <div v-else-if="showTitle()" :class="getTitleClass()">
            <span v-if="showSequence()" :class="hasSequenceHtml()?'':'title-icon'" v-html="getSequence()"></span>
            <span v-else class="circle" :class="{ 'preview-title': isPreview(), 'playback-title': isPlayBack() }"/>
            <span class="title-txt" :title="getPlayerTitle()">{{ getPlayerTitle() }}</span>
        </div>
        <div
            class="btn close-btn-outer"
            title="关闭"
            @mousedown.left="closeStartCLick()"
            @mouseup.left="toolbarClick(ACTION.CLOSE)"
        >
            <svg-i active-color="#fff" :active="hasAction(ACTION.CLOSE)" icon="close-small"/>
        </div>
    </div>
</template>

<script>
import SvgI from './SvgI';
import AlgorithmSelect from './AlgorithmSelect.vue';
import {getSimplePlayerData} from "./../lib";
import {ACTION, PLAYER_STATUS_MAP, CAMERA_TYPE} from "./../lib/params.lib";
import {isNotEmpty} from "./../util";
import {API_METHOD_MAP} from "./../mixin/ApiProps.mixin";
import {warnLog} from "./../util/logger";

/**
 * @function
 * @description 视频窗口操作工具栏
 * 工具栏按钮显示的标志：
 * 1、视频是否有此能力 (严格权限模式下)
 * 2、有权限
 * 3、客观条件，比如设备类型导致的、预览回放导致的
 * 按钮禁用的标志：
 * 1、有此能力但是没有权限
 * 按钮隐藏的标志：
 * 1、无此能力
 * @author lixiaodong31 2023/11/9
 * @version 1.0.0
 * @example
 */
export default {
    name: 'PlayerHeader',
    components: {SvgI, AlgorithmSelect},
    props: {
        index: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            algorithmSelectList: [],
            showOpt: false,
            activatedColor: 'rgb(32, 128, 247)',
            showTool: false,
            rootKey: 1,
            ACTION: ACTION,
            algoSelectTimer: null,
        };
    },
    computed: {
        simplePlayerData() {
            return getSimplePlayerData();
        },
    },
    mounted() {
        this.hide();
        this.initAlgorithmSelectList();
    },
    methods: {
        getTitleClass() {
            if (this.showTitle() && this.showSequence()) return ['title-bar', 'title-own-define'];
            return 'title-bar';
        },
        getSequence() {
            return this.simplePlayerData.getSequenceHtml(this.index) || this.simplePlayerData.getSequence(this.index);
        },
        hasSequenceHtml() {
            return isNotEmpty(this.simplePlayerData.getSequenceHtml(this.index));
        },
        showSequence() {
            return this.simplePlayerData.getShowSequence();
        },
        showTitle() {
            return this.simplePlayerData.canShowTitle(this.index);
        },
        getPlayerTitle() {
            const title = this.simplePlayerData.getTitle(this.index);
            const canShowTitle = this.simplePlayerData.canShowTitle(this.index);
            if (canShowTitle) return title;
            return null;
        },
        isNotPlaying() {
            // 播放器窗口状态
            const status = this.simplePlayerData.getWndStatus(this.index, 'status');
            return status !== PLAYER_STATUS_MAP.PLAYING;
        },
        hasAction(key) {
            return this.simplePlayerData.getAction(this.index, key);
        },
        getPlayStatus() {
            return this.simplePlayerData.getStatus(this.index);
        },
        updateRootKey() {
            this.rootKey = new Date().getTime();
        },
        // 切换预览回放
        switchStatusHandle() {
            this.resetOtherPress(null); // 重置所有
            this.simplePlayerData.switchActionStatus(this.index); // 切换播放模式
            const playInfo = this.simplePlayerData.getPlayInfosByIndex(this.index);
            // 必须是父级的父级，越过动态模板组件后才是真正的父级
            this.$parent.$parent.doAddPlay(playInfo, this.index);
            this.show();
            this.updateRootKey();
            this.$emit('change', this.index);
        },
        // 是否有云台控制能力判断逻辑：
        // 实际使用中，有可能存在即使有这个云台控制按钮，但是实际上无法使用的问题
        // 如果出现这种问题，说明cameraType不对了
        // 总结下就是 (默认非严格校验权限的模式下)
        // 1、权限接口中是否有ptzControl权限(级联默认有云台，本机则进一步判断能力集)
        // 2、权限，对于普通用户需要giopc申请后才有
        hasPtzAbility() {
            const strictAuthMode = this.simplePlayerData.getStrictAuthMode();
            const isBenJi = this.simplePlayerData.isBenJi(this.index);
            const ability = this.simplePlayerData.getAction(this.index, ACTION.PTZ_ABILITY);
            return strictAuthMode ? isBenJi ? ability : true : true;
        },
        hasAbility(key) {
            const strictAuthMode = this.simplePlayerData.getStrictAuthMode();
            const isBenJi = this.simplePlayerData.isBenJi(this.index);
            return strictAuthMode ? isBenJi ? this.hasAction(key) : true : true;
        },
        // 出错了
        isPreviewError() {
            return this.simplePlayerData.isErrorStatus(this.index);
        },
        // 是否是预览
        isPreview() {
            return this.simplePlayerData.isPreviewStatus(this.index);
        },
        // 是否是回放
        isPlayBack() {
            return this.simplePlayerData.isPlaybackStatus(this.index);
        },
        getPlayStatusZn() {
            return this.simplePlayerData.getStatusZn(this.index);
        },
        activePress(key) {
            this.simplePlayerData.setAction(this.index, key, true);
            this.updateRootKey();
        },
        resetOtherPress(key) {
            this.simplePlayerData.getActionOfBtnPress().forEach(k => {
                if (key === null) this.simplePlayerData.setAction(this.index, k, false);
                else if (k !== key) this.simplePlayerData.setAction(this.index, k, false);
            });
        },
        closeStartCLick() {
            this.simplePlayerData.setAction(this.index, ACTION.CLOSE, true);
        },
        snapStartClick(operationType, disabledMode = false) {
            // 先要检测是都禁止点击
            if (disabledMode) {
                if (this.isNotPlaying) return;
            }
            this.activePress(operationType);
        },
        snapEndClick(operationType, disabledMode = false) {
            // 先要检测是都禁止点击
            if (disabledMode) {
                if (this.isNotPlaying) return;
            }
            this.simplePlayerData.setAction(this.index, operationType, false);
            this.$emit('toolbar', operationType, this.index);
        },
        // 做开关切换
        doOnOff(action) {
            const flag = this.simplePlayerData.getAction(this.index, action);
            this.simplePlayerData.setAction(this.index, action, !flag);
        },
        toolbarClick(operationType) {
            this.simplePlayerData.setAction(this.index, ACTION.CLOSE, false);
            if (this.isNotPlaying()) {
                if ([ACTION.CLOSE].includes(operationType)) {
                    this.$emit('toolbar', operationType, this.index);
                }
                return;
            }
            if ([
                ACTION.PTZ,
                ACTION.DIGITAL_ZOOM,
                ACTION.SOUND,
                ACTION.PREVIEW_RECORD,
                ACTION.PLAYBACK_RECORD,
                ACTION.TD_ZOOM,
                ACTION.TALK
            ].includes(operationType)) {
                this.exclusion(operationType); // 先解决互斥的按钮
                this.doOnOff(operationType);
            } else {
                this.activePress(operationType);
            }
            this.$emit('toolbar', operationType, this.index);
        },
        // 互斥的按钮处理
        exclusion(operationType) {
            const exclusionBtns = [ACTION.PTZ, ACTION.DIGITAL_ZOOM, ACTION.TD_ZOOM];
            const others = exclusionBtns.filter(k => operationType !== k);
            if (exclusionBtns.includes(operationType)) {
                others.forEach(c => {
                    if (this.hasAction(c)) {
                        this.doOnOff(c);
                        this.$emit('toolbar', c, this.index);
                    }
                })
            }
        },
        hasShotAuth() {
            const {playSnapAuth, playbackSnapAuth} = this.simplePlayerData.getAction(this.index);
            if (this.simplePlayerData.isPreviewStatus(this.index) && playSnapAuth) return true;
            if (this.simplePlayerData.isPlaybackStatus(this.index) && playbackSnapAuth) return true;
            return false;
        },
        isH5Player() {
            return this.simplePlayerData.isH5Player();
        },
        show() {
            this.showTool = true;
            if (this.$refs.spHeaderRef) this.$refs.spHeaderRef.style.top = '0';
        },
        hide() {
            this.showTool = false;
            if (this.$refs.spHeaderRef) this.$refs.spHeaderRef.style.top = '0';
            // this.$refs.spHeaderRef.style.top = '-38px';
        },
        algoSelectedChangeHandle(a, b) {
            this.$emit('toolbar', a, b);
        },
        algoEnterHandle() {
            clearTimeout(this.algoSelectTimer);
            this.showOpt = true;
        },
        algoLeaveHandle() {
            this.leaveHandle();
        },
        leaveHandle() {
            clearTimeout(this.algoSelectTimer);
            // 延迟小时，解决体验问题
            this.algoSelectTimer = setTimeout(() => {
                this.showOpt = false;
                clearTimeout(this.algoSelectTimer);
            }, 1500);
        },
        getAlgorithmSelectItem() {
            return this.simplePlayerData.getPlayInfosForOuterByIndex(this.index);
        },
        initAlgorithmSelectList() {
            try {
                const item = this.simplePlayerData.getPlayInfosForOuterByIndex(this.index);
                // 必须是父级的父级，越过动态模板组件后才是真正的父级
                if (this.$parent.$parent.hasApi(API_METHOD_MAP.QUERY_ALGORITHM_OPTION_API)) {
                    this.$parent.$parent.getApi(API_METHOD_MAP.QUERY_ALGORITHM_OPTION_API)(item).then((list) => {
                        this.algorithmSelectList = list;
                    });
                }
            } catch (e) {
                warnLog('[initAlgorithmSelectList] load ', API_METHOD_MAP.QUERY_ALGORITHM_OPTION_API, ' fail!');
                return [];
            }
        },
        showAlgorithmAnalysis() {
            return this.simplePlayerData.getShowAlgorithmAnalysis();
        },
        showLabelTag() {
            return this.simplePlayerData.getShowLabelTag();
        },
        showEventReport() {
            return this.simplePlayerData.getShowEventReport();
        },
        showPictureTag() {
            return this.simplePlayerData.getShowPictureTag();
        },
        showAiRecommend() {
            return this.simplePlayerData.getShowAiRecommend();
        }
    }
};
</script>

<style lang="scss" scoped>
.sp-header-part {
    position: relative;
    z-index: 999;
    left: 0;
    top: 0;
    //top: -38px;
    background: rgba(33, 33, 33, .85);
    color: #ffffff;
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    height: 32px;

    .sp-btn-group {
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-start;
        align-items: center;
        margin-left: 16px;

        .btn {
            cursor: pointer;
        }

        .btn-switch {
            width: 62px;
            height: 20px;
            opacity: 0.5;
            border: 1px solid #ffffff;
            border-radius: 10px;
            position: relative;
            margin-right: 16px;

            .circle {
                position: absolute;
                top: 5px;
                left: 6px;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #16bb96;
                transition: transform 0.3s ease;
            }

            .circle.preview {
                background: #16bb96;
                transition: transform 0.3s ease;
            }

            .circle.playback {
                background: #e02020;
                transform: translate(42px, 0);
            }

            .text {
                font-family: PingFangSC-Regular;
                font-size: 12px;
                color: #ffffff;
                letter-spacing: 0;
                position: absolute;
                top: 1px;
                left: 18px;
                transition: transform 0.3s ease;
            }

            .text.playback {
                transform: translate(-12px, 0);
            }

            &:hover {
                opacity: 1;
            }
        }

        .btn-tools {
            display: flex;
            flex-flow: row nowrap;
            justify-content: flex-start;
            align-items: center;

            .btn {
                margin-right: 5px;
            }
        }

        .self-define__info {
            font-size: 24px;
            color: rgba($color: #ffffff, $alpha: 0.5);
            margin-left: 8px;
            cursor: pointer;

            &:hover {
                color: #ffffff;
            }
        }
    }

    .close-btn-outer {
        position: absolute;
        right: 5px;
        z-index: 1000;
    }
}

.title-bar {
    position: absolute;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 32px;
    background-color: unset !important;
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    align-items: center;
    padding-left: 28px;

    .circle {
        position: absolute;
        top: 12px;
        left: 16px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
    }

    .preview-title {
        background: #16bb96;
    }

    .playback-title {
        background: #e02020;
    }

    .title-txt {
        width: 88%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: hsla(0, 0%, 100%, .85);
    }
}

.title-own-define {
    padding-left: 0;

    .title-icon {
        margin: 0 5px 0 10px;
        background: red;
        height: 24px;
        width: 24px;
        border-radius: 20px;
        border: 1px solid #fff;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>
