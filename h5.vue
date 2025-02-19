<template>
    <div class="simple-player-wrapper" :simple-player-mix-theme="getTheme">
        <VideoPlanPlayHeader
            v-if="canShowHeader()"
            class="vpph-outer"
            hikcc_cover="opaque"
            ref="videoPlanPlayHeaderRef"
            :indexCodes="playInfos"
            :is-white-background="false"
            @concentrateChange="concentrateChangeHandle"
            @dateRangeChange="videoRangeChangeHandle"
            @play-status-change="playStatusChangeHandle"
        />
        <div
            class="sp-window-wrapper"
            :style="{ height: `${wrapHeight}px` }">
            <component
                ref="compTemplateRef"
                :is="getScreenTemplateComp()"
                @wnd-mouseenter="openPlayerHeader"
                @wnd-mouseleave="hidePlayerHeader"
                @wnd-mouseup="playerWndClick"
            >
                <template slot-scope="scope" v-show="isNotEmptyWnd(scope.index)">
                    <PlayerHeader
                        class="sp-header"
                        :ref="`spHeader${scope.index}`"
                        :key="`spHeader${scope.index}`"
                        :index="scope.index"
                        v-if="showPlayerHeader(scope.index)"
                        @change="playerHeaderChange"
                        @toolbar="headerToolbarHandle"
                    />
                    <player-layer
                        :ref="`playerLayerRef${scope.index}`"
                        :index="scope.index"
                        @layer-change="layerChangeHandle">
                        <template #content>
                            <player-container
                                class="player-container-outer"
                                style="width: 100%; height: 100%"
                                :class="isPlaybackNow(scope.index)?'contain-footer':''"
                                :ref="`${simplePlayerRefName}${scope.index}`"
                                :player-id="`simple_player_${scope.index}`"
                                :name="`${simplePlayerRefName}${scope.index}`"
                                :notify-method="(player, data) => onNotify(player, data, scope.index)"
                                @load-result="(player, errCode, data) => onLoadResult(player, errCode, data, scope.index)"
                            />
                        </template>
                    </player-layer>
                    <div
                        hikcc_cover="opaque"
                        class="sp-footer"
                        :key="footerKey"
                        :class="isPlaybackNow(scope.index)? 'sp-footer-visible':'sp-footer-hidden'">
                        <player-footer
                            :index="scope.index"
                            :key="`player-footer-${scope.index}`"
                            :num-id-state="numIdState"
                            :is-pause="isPauseNew"
                            :speed-panel-expand="speedPanelExpand"
                            :child-func-btn-disable="childFuncBtnDisableNew"
                            :video-plan-flag="videoPlanFlag"
                            @change="handleFooterChange"
                        />
                    </div>
                </template>
            </component>
        </div>
        <!--全局底部工具栏-->
        <tool-bar
            v-if="canShowToolBar()"
            class="tool-bar-outer"
            ref="toolBarRef"
            @screen-change="screenChangeHandle"
            @close-all="closeAllHandle"
            @full-screen="switchFullscreen"/>
        <!--全局遮罩层-->
        <global-layer ref="globalLayerRef"/>
        <!--云台轮盘-->
        <PtzCompass ref="ptzCompassRef" @operate="compassOperateHandle"/>
    </div>
</template>

<script>
/* eslint-disable */
import {SimplePlayer as PlayerContainer, crashOccurPromise} from 'client-container';
import VideoPlanPlayHeader from './components/VideoPlanPlayHeader';
import PlayerHeader from './components/PlayerHeader';
import PlayerFooter from './components/PlayerFooter';
import PlayerLayer from "./components/PlayerLayer";
import ToolBar from "./components/ToolBar";
import GlobalLayer from "./components/GlobalLayer";
import {GLOBAL_LAYER_MAP} from "./components/GlobalLayer";
import DefaultCameraImg from './components/DefaultCameraImg.vue';
import PtzCompass from "./components/PtzCompass.vue";
import {SpHeaderMixin} from './mixin/SpHeader.mixin';
import {SpFooterMixin} from './mixin/SpFooter.mixin';
import {ConcentrateMixin} from './mixin/Concentrate.mixin';
import {PlayerStyleMixin} from './mixin/PlayerStyle.mixin';
import {OpenApiCommonMixin} from './mixin/OpenApiCommon.mixin';
import {OpenApiForCcMixin} from './mixin/OpenApiForCc.mixin';
import {ConfigMixin} from './mixin/Config.mixin';
import {EventMixin} from './mixin/Event.mixin';
import {API_METHOD_MAP, ApiPropsMixin} from './mixin/ApiProps.mixin';
import {AuthMixin} from "./mixin/Auth.mixin";
import {ScreenTemplateMixin} from "./mixin/ScreenTemplate.mixin";
import {clearSimplePlayerData, getSimplePlayerData} from "./lib";
import {
    changePlaybackTime, clearPlayer,
    clearPlayers, clearSomeonePlayer, frameNext, framePre, getOSDTime,
    pauseOrContinue, playBySpeed, seekTime, selectExistingDir, startPlay,
    startPlayback,
    startPlayback2, startPlaybackAgain, stopPlay,
    stopPlayback
} from "./lib/cc.lib";
import {ACTION, EVENT_TYPE, PLAYER_STATUS_MAP, PLAYER_TYPE, READ_STREAM_WAY} from "./lib/params.lib";
import {infoLog, logger, warnLog} from "./util/logger";
import {deepClone, isNotEmpty} from "./util";

export default {
    components: {
        VideoPlanPlayHeader,
        PlayerLayer,
        PlayerHeader,
        PlayerContainer,
        PlayerFooter,
        DefaultCameraImg,
        ToolBar,
        GlobalLayer,
        PtzCompass
    },
    mixins: [
        ScreenTemplateMixin, SpHeaderMixin, SpFooterMixin, PlayerStyleMixin, OpenApiForCcMixin,
        OpenApiCommonMixin, ConfigMixin, ConcentrateMixin, EventMixin, ApiPropsMixin, AuthMixin
    ],
    computed: {
        totalWndNum() {
            return this.simplePlayerData.getCurrentScreen();
        },
        ccExists() {
            return this.simplePlayerData.getCcExists();
        },
        playInfos() {
            return this.simplePlayerData.getPlayInfos();
        },
        simplePlayerRefName() {
            return this.simplePlayerData.getRefPre();
        },
        selectedWnd() {
            return this.simplePlayerData.getSelectedWnd();
        },
        getTheme() {
            return this.simplePlayerData.getTheme();
        },
    },
    data() {
        return {
            footerKey: 1,
            videoPlanFlag: false,
            simplePlayerData: null,
            isDev: process.env.NODE_ENV === 'development',
            platIP: '',
            fullScreenStatus: false,
            wrapHeight: 0,
            wsSocket: null,
        };
    },
    watch: {
        videoPlanFlag: {
            handler(val) {
                if (val) {
                    this.$nextTick(() => {
                        // 更新播放器窗口高度
                        this.updateSimplePlayerWrapperHeight();
                    });
                }
            },
            immediate: true
        }
    },
    async created() {
        // 初始化播放器对象
        this.simplePlayerData = getSimplePlayerData();
        this.simplePlayerData.setPlayerType(PLAYER_TYPE.CLIENT_CONTAINER);

        // await this.initShouldGivePointAllAuth();
        // 如果本地进程崩溃了
        // 会通知前端崩溃了
        // 暂时不清楚实际作用，但是需要保留这个历史代码
        await crashOccurPromise;
        this.platProtocol = this.isDev ? 'https' : window.location.protocol.split(':')[0];
        this.platIP = this.isDev ? process.env.VUE_APP_IP : document.domain;
    },
    mounted() {
        // 处理时间插件问题
        this.dealDatePickerProblem();
        // 刷新当前图层
        this.fleshCurrentScreenLayers();
    },
    beforeDestroy() {
        this.doDestroy();
        clearSimplePlayerData();
    },
    methods: {
        updateTimeInterval() {
            this.$refs.toolBarRef && this.$refs.toolBarRef.updateTimeInterval();
        },
        canShowHeader() {
            return this.simplePlayerData.getShowHeader();
        },
        canShowToolBar() {
            return this.simplePlayerData.getShowToolBar();
        },
        callAutoLoop() {
            this.$nextTick(() => {
                this.$refs.toolBarRef && this.$refs.toolBarRef.handleIconLoopClick('loop');
            });
        },
        // 获取播放器对象id编号
        getId(index) {
            return index - 1;
        },
        // 刷新当前屏中的所有窗口权限
        fleshLayersByScreen() {
            // 当前页面所有点
            const points = this.simplePlayerData.getCurrentPagePoint();
            points && points.forEach((point, i) => {
                const refName = `playerLayerRef${i}`;
                const ref = this.$refs[refName];
                if (Array.isArray(ref)) ref && ref[0] && ref[0].flesh();
                else ref && ref.flesh();
            });
        },
        // 刷新播放器图层
        fleshLayer(index) {
            this.$nextTick(() => {
                const refName = `playerLayerRef${index}`;
                const ref = this.$refs[refName];
                if (Array.isArray(ref)) ref && ref[0] && ref[0].flesh();
                else ref && ref.flesh();
            });
        },
        // 关闭所有图层
        closeLayer(index) {
            this.$nextTick(() => {
                const refName = `playerLayerRef${index}`;
                const ref = this.$refs[refName];
                if (Array.isArray(this.$refs[refName])) ref && ref[0] && ref[0].closeAllLayer();
                else ref && ref.closeAllLayer();
                infoLog('closeLayer index ', index);
            });
        },
        rePlayback(index) {
            startPlaybackAgain(this, this.simplePlayerData, index, (response) => {
                if (!(
                    (response.hasOwnProperty('errorCode') && [0, '0'].includes(response.errorCode)) ||
                    (response.hasOwnProperty('errCode') && [0, '0'].includes(response.errCode))
                )) {
                    warnLog('code error, playback fail', response);
                    this.simplePlayerData.setWndStatus(index, 'status', PLAYER_STATUS_MAP.FAILING);
                    this.fleshLayer(index);
                    this.eventEmit(EVENT_TYPE.PLAYBACK_FAIL, {index, response: res});
                    // 状态变化，抛出事件
                    this.eventEmit(EVENT_TYPE.WND_STATUS_CHANGE, {index});
                }
            }, (error) => {
                warnLog('playback fail', error);
                this.simplePlayerData.setWndStatus(index, 'status', PLAYER_STATUS_MAP.FAILING);
                this.fleshLayer(index);
                this.eventEmit(EVENT_TYPE.PLAYBACK_FAIL, {index, error});
                // 状态变化，抛出事件
                this.eventEmit(EVENT_TYPE.WND_STATUS_CHANGE, {index});
            })
        },
        // 不改变缓冲的基础上，批量替换播放
        // 供外部开放，子组件使用，子组件使用通过$parent调用
        _doReplaceBatchPlay(pointInfos) {
            this.callClearPlayers(false);
            this.simplePlayerData.updatePlayInfos(pointInfos);
            // 这个方法中存在异步，改变数据后，需要等待DOM渲染完毕，才能调用
            this.$nextTick(() => {
                const apiReq = this.hasApi([
                    API_METHOD_MAP.QUERY_PLAYBACK_AUTH_API,
                    API_METHOD_MAP.QUERY_PREVIEW_AUTH_API,
                ]) ? this.checkPointAuthApi : this.checkPointAuth;
                apiReq(pointInfos, (index, canPlay) => {
                    // 是否属于删除数据
                    const isDelete = this.simplePlayerData.getIsDelete(index);
                    // 对于有权限的则播放
                    if (this.simplePlayerData.isPreviewStatus(index)) {
                        // 对于有权限且非删除数据的，则播放
                        if (!isDelete && canPlay) this.callStartPlay(index);
                        this.eventEmit(EVENT_TYPE.SINGLE_PREVIEW, {index});
                    } else {
                        // 对于有权限且非删除数据的，则播放
                        if (!isDelete && canPlay) this.callStartPlayback(index);
                        this.eventEmit(EVENT_TYPE.SINGLE_PLAYBACK, {index});
                    }
                    this.fleshLayer(index);
                });
            });
        },
        // 非空窗口
        isNotEmptyWnd(index) {
            return !this.simplePlayerData.isEmptyWnd(index);
        },
        // 是否展示播放器顶部工具栏
        showPlayerHeader(index) {
            return !this.simplePlayerData.getEmptyWnd(index);
        },
        // 刷新当前屏图层
        fleshCurrentScreenLayers() {
            for (let i = 0; i < this.simplePlayerData.getCurrentScreen(); i++) {
                this.fleshLayer(i);
            }
        },
        // 清除当前屏图层
        clearCurrentScreenLayers() {
            for (let i = 0; i < this.simplePlayerData.getCurrentScreen(); i++) {
                this.closeLayer(i);
            }
        },
        updateFooterKey() {
            this.footerKey = new Date().getTime();
        },
        closeAllHandle() {
            // 1、数据层清理以及窗口
            // 拷贝当前屏数据
            const currentScreen = deepClone(this.simplePlayerData.getCurrentPagePoint());
            // 要特别注意，第一个参数是需要包含播放器的作用域的this
            clearPlayers(this, this.simplePlayerData, true);
            this.clearCurrentScreenLayers();
            // 清除缓冲数据
            this.simplePlayerData.clearCachePoints();
            // 2、底部全局工具栏 清除toolbar中的轮询
            this.$refs.toolBarRef && this.$refs.toolBarRef.clearTimeLooper();
            this.eventEmit(EVENT_TYPE.CLOSE_ALL_WND, {list: currentScreen});
        },
        screenChangeHandle() {
            const index = this.simplePlayerData.getSelectedWnd();
            const currentPoint = this.simplePlayerData.getPlayInfosByIndex(index);
            this.doAnchorPoint(currentPoint);
            this.updateFooterKey();
            this.eventEmit(EVENT_TYPE.CHANGE_SCREEN);
        },
        // 是否是正在回放
        isPlaybackNow(index) {
            return this.simplePlayerData.isPlaybackNow(index);
        },
        dealDatePickerProblem() {
            try {
                // 解决播放器上一移动鼠标日历就消失的问题
                const ctx = this.$refs.datePicker.$el['@@clickoutsideContext'];
                if (ctx) {
                    ctx._myNewHandler = ctx.documentHandler;
                    Object.defineProperty(ctx, 'documentHandler', {
                        get() {
                            return ctx._myNewHandler;
                        },
                        set(handler) {
                            ctx._myNewHandler = function (mouseup = {}, mousedown = {}) {
                                if (mouseup.button === 1) {
                                    // 过滤鼠标中间
                                    return;
                                }
                                handler(mouseup, mousedown);
                            };
                        }
                    });
                    const documentHandler = ctx.documentHandler;
                    this.$set(documentHandler, 'selfHandler', function () {
                        logger('myHandler');
                    });
                    this.$set(ctx, 'documentHandler', documentHandler);
                }
                // 解决全屏无法显示日历的问题
                this.$refs.datePicker.popperOptions.onUpdate = () => {
                    if (this.fullScreenStatus) {
                        document.fullscreenElement.appendChild(this.$refs.datePicker.popperElm);
                    } else {
                        document.body.appendChild(this.$refs.datePicker.popperElm);
                    }
                };

                this.$refs.datePicker.handleClose = function () {
                    return;
                };
            } catch (e) {
                logger('[dealDatePickerProblem]', e);
            }
        },
        // 浓缩播放切换时触发
        concentrateChangeHandle(params, concentrate) {
            this.concentrate = concentrate;
        },
        // 全局预览回放切换
        playStatusChangeHandle() {
            this.clearCurrentScreenLayers(); // 清除所有窗口图层
            if (this.simplePlayerData.isGlobalPreview()) {
                this.doPlay();
            } else {
                this.doPlayback();
            }
            // 事件抛出
            this.eventEmit(EVENT_TYPE.GLOBAL_PLAYER_STATUS);
        },
        // 播放器时间段发生改变
        videoRangeChangeHandle(params) {
            this.startConcentrate(params);
        },
        // 销毁所有播放器
        doDestroy() {
            // 先销毁播放器对象(内部清除播放器数据对象)
            clearPlayers(this, this.simplePlayerData);
        },
        windowClick(windowIndex) {
            if (typeof windowIndex === 'number' && !Number.isNaN(windowIndex)) {
                this.playerWndClick(windowIndex);
            }
        },
        callCalendar() {
            // 打开时间选择控件
            this.$refs.globalLayerRef.open(GLOBAL_LAYER_MAP.DATE_DIALOG);
        },
        // 更新dom
        updateDom() {
            const domList = document.getElementsByClassName('el-notification--small');
            domList.length > 0 &&
            Array.from(domList).map(ele => {
                ele.setAttribute('hikcc_cover', 'opaque');
                ele.style.cssText = ele.style.cssText + 'top: 60px; height: 150px;';
            });
        },
        reloadPage() {
            window.location.reload();
        },
        //根据返回的报文检测是否安装插件
        checkAppExist: function (data) {
            let resCode = 0;
            let resJson = JSON.parse(data);
            if (resJson) {
                resCode = resJson.comment.resultCode;
                return resCode;
            } else {
                return resCode;
            }
        },
        // 播放器双击事件
        dbPlayerWndClick(index) {
            const screen = this.simplePlayerData.getCurrentScreen();
            const oldId = this.simplePlayerData.getCurrentDiffScreenId();
            const old = this.simplePlayerData.getHistoryScreen();
            if (screen !== 1) {
                this.playerWndClick(index);
                // 通过ID，获取1分屏对象
                const oneScreen = this.simplePlayerData.getScreenObjByScreenNum(1);
                this.$refs.toolBarRef && this.$refs.toolBarRef.screenChange(oneScreen, true);
                this.simplePlayerData.setHistoryScreen(oldId);
            } else {
                if (isNotEmpty(old)) {
                    const oldScreen = this.simplePlayerData.getScreenObjById(old);
                    this.$refs.toolBarRef && this.$refs.toolBarRef.screenChange(oldScreen);
                }
            }
        },
        // 视频宫格选中事件
        playerWndClick(index) {
            this.simplePlayerData.setSelectedWnd(index, this.simplePlayerData.getPlayInfosByIndex(index));
            this.$nextTick(() => {
                this.$refs.compTemplateRef && this.$refs.compTemplateRef.update();
            });
            this.eventEmit(EVENT_TYPE.SELECT_WND, {index});
        },
        // 视频宫格hover事件
        playerWndHover(index) {
            this.simplePlayerData.setHoverWnd(index);
        },
        transWindow(direction) {
            const pages = this.simplePlayerData.getPagination('size');
            if (pages > 1) {
                switch (direction) {
                    case 'moveLeft':
                        this.eventEmit(EVENT_TYPE.MOVE_LEFT);
                        break;
                    case 'moveRight':
                        this.eventEmit(EVENT_TYPE.MOVE_RIGHT);
                        break;
                    case 'up':
                        break;
                    case 'down':
                        break;
                }
            } else {
                warnLog('[无需翻页][页码不足]', pages);
            }
        },
        switchFullscreen() {
            this.changeScreen();
        },
        callClearPlayer(index) {
            this.closeLayer(index);
            clearPlayer(this, this.simplePlayerData, index);
            this.simplePlayerData.resetActionActive(index);
        },
        callClearPlayers(needInit = true) {
            this.clearCurrentScreenLayers();
            clearPlayers(this, this.simplePlayerData, needInit);
            this.simplePlayerData.resetActionActive();
        },
        closeAllOperation() {
            this.simplePlayerData.setCloseAll(false);
            clearPlayers(this, this.simplePlayerData, true);
            clearInterval(this.keyInterval);
            this.loopFlag = false;
        },
        openInfoPanel(index) {
            this.simplePlayerData.setAction(index, ACTION.INFO, false);
            this.receive && this.receive(EVENT_TYPE.SHOW_PLAYER_INFO, {index});
        },
        callClearSomeonePlayer(index) {
            clearSomeonePlayer(this, this.simplePlayerData, index);
        },
        //开始播放
        async callStartPlay(index) {
            startPlay(this, this.simplePlayerData, index, () => {
            }, (error) => {
                warnLog('预览失败');
                this.simplePlayerData.setWndStatus(index, 'status', PLAYER_STATUS_MAP.FAILING);
                this.fleshLayer(index);
                this.eventEmit(EVENT_TYPE.PREVIEW_FAIL, {index, error});
                // 状态变化，抛出事件
                this.eventEmit(EVENT_TYPE.WND_STATUS_CHANGE, {index});
            });
        },
        //回放2，录像片段和URL由外部传入
        async callStartPlayback2(index, nongSuoFlag = true) {
            startPlayback2(this, this.simplePlayerData, index, () => {
                if (nongSuoFlag) this.playByNongsuo(index);
            }, (response) => {
                logger('播放失败');
                this.simplePlayerData.setWndStatus(index, 'status', PLAYER_STATUS_MAP.FAILING);
                this.fleshLayer(index);
                this.eventEmit(EVENT_TYPE.PLAYBACK_FAIL, {index, response});
                // 状态变化，抛出事件
                this.eventEmit(EVENT_TYPE.WND_STATUS_CHANGE, {index});
            });
        },
        //回放
        async callStartPlayback(index) {
            // 自动适配取流方式
            const streamWay = this.simplePlayerData.getReadStreamWay();
            if (READ_STREAM_WAY.URL === streamWay) {
                this.callStartPlayback2(index, false);
                return;
            } else if (READ_STREAM_WAY.AUTO === streamWay) {
                const {url} = this.simplePlayerData.getPlayInfosByIndex(index);
                if (url && url.indexOf('rtsp') >= 0) {
                    this.callStartPlayback2(index, false);
                    return;
                }
            }
            startPlayback(this, this.simplePlayerData, index, (response) => {
                // 仍需处理错误情况
                if (!(
                    response.hasOwnProperty('errorCode') && [0, '0'].includes(response.errorCode) ||
                    response.hasOwnProperty('errCode') && [0, '0'].includes(response.errCode)
                )) {
                    warnLog('回放失败', response);
                    this.simplePlayerData.setWndStatus(index, 'status', PLAYER_STATUS_MAP.FAILING);
                    this.fleshLayer(index);
                    this.eventEmit(EVENT_TYPE.PLAYBACK_FAIL, {index, response});
                    // 状态变化，抛出事件
                    this.eventEmit(EVENT_TYPE.WND_STATUS_CHANGE, {index});
                }
            }, (error) => {
                if (!this.simplePlayerData.isAlreadyPlaybackAgain(index)) {
                    logger('回放失败，重新触发回放');
                    this.rePlayback(index);
                } else {
                    warnLog('回放失败');
                    this.simplePlayerData.setWndStatus(index, 'status', PLAYER_STATUS_MAP.FAILING);
                    this.fleshLayer(index);
                    this.eventEmit(EVENT_TYPE.PLAYBACK_FAIL, {index, error});
                    // 状态变化，抛出事件
                    this.eventEmit(EVENT_TYPE.WND_STATUS_CHANGE, {index});
                }
            });
        },
        async callChangePlaybackTime(index, {dateRange}) {
            changePlaybackTime(this, this.simplePlayerData, index, dateRange);
        },
        //停止回放
        async callStopPlayback(index) {
            stopPlayback(this, this.simplePlayerData, index, () => {
            });
        },
        callPauseOrContinue(index, callback) {
            pauseOrContinue(this, this.simplePlayerData, index, callback);
        },
        callGetOSDTime(index) {
            return getOSDTime(this, this.simplePlayerData, index);
        },
        callPlayBySpeed(index, params) {
            playBySpeed(this, this.simplePlayerData, index, params);
        },
        callSeekTime(index, params) {
            seekTime(this, this.simplePlayerData, index, params);
        },
        callFrameNext(index) {
            frameNext(this, this.simplePlayerData, index, (pauseStatus, delayShow) => {
                this.pauseHandle({
                    index,
                    pauseStatus,
                    delayShow
                });
            });
        },
        callFramePre(index) {
            framePre(this, this.simplePlayerData, index, (pauseStatus, delayShow) => {
                this.pauseHandle({
                    index,
                    pauseStatus,
                    delayShow
                });
            })
        },
        // 暂停。触发了暂停行为更新卡片的状态为暂停
        pauseHandle({index, pauseStatus, delayShow = false}) {
            // 状态变化，抛出事件
            this.eventEmit(EVENT_TYPE.STOP_PLAY, {
                index,
                pauseStatus: pauseStatus,
                delayShow
            });
        },
        // 设置文件夹路径
        setDirPath(path) {
            this.$refs.videoPlanPlayHeaderRef && this.$refs.videoPlanPlayHeaderRef.setSettingDir(path);
        },
        // 打开文件夹
        callSelectExistingDir(params) {
            selectExistingDir(this, this.simplePlayerData, 0, params);
        },
        msgThrottle: _.throttle(
            function (sMsg) {
                this.$message({
                    type: 'error',
                    message: sMsg,
                    duration: 4000
                });
            },
            2000,
            {
                leading: false,
                trailing: true
            }
        ),
        //停止播放
        async callStopPlay(index) {
            await stopPlay(this, this.simplePlayerData, index);
        }
    }
};
</script>

<style lang="scss" scoped>
.simple-player-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: rgb(26, 26, 26);

    .sp-window-wrapper {
        width: 100%;
        display: flex;
        flex-flow: row wrap;
        padding: 0;
    }
}

.sp-header {
    position: relative;
    left: 0;
}

.player-container-outer {
    width: 100%;
    height: 100%;
    display: block;
}

.contain-footer {
    height: calc(100% - 30px);
}

.sp-footer {
    display: flex;
    position: absolute;
    z-index: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30px;
    background: rgba(33, 33, 33, 1);
    color: #ffffff;
    justify-content: center;
    align-items: center;
}

.sp-footer-visible {
    display: flex;
}

.sp-footer-hidden {
    display: none;
}
</style>
<style lang="scss">
@import "./style/themes";
.el-picker-panel.simple-player-date-picker {
    opacity: 0;
}
</style>
