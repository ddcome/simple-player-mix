<template>
    <div class="simple-player-wrapper" :simple-player-mix-theme="getTheme">
        <VideoPlanPlayHeader
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
                            <h5-single-player
                                :style="{ height: '100%' }"
                                :ref="`${simplePlayerRefName}${scope.index}`"
                                :show-time-line="showH5Timeline(scope.index)"
                                :id="`h5-single-player-${scope.index}`"
                                @date-range="callCalendar(scope.index)"
                                @error="(index, iErrorCode, oError) => errorHandle(scope.index, index, iErrorCode, oError)"
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
import H5SinglePlayer from './h5/h5-single-player';
import VideoPlanPlayHeader from './components/VideoPlanPlayHeader';
import PlayerHeader from './components/PlayerHeader';
import PlayerFooter from './components/PlayerFooter';
import PlayerLayer from "./components/PlayerLayer";
import ToolBar from "./components/ToolBar";
import GlobalLayer from "./components/GlobalLayer";
import {GLOBAL_LAYER_MAP} from "./components/GlobalLayer";
import DefaultCameraImg from './components/DefaultCameraImg.vue';
import PtzCompass from "./components/PtzCompass.vue";
import {SPEED_TYPE} from "./components/SpeedSelect";
import {SpHeaderMixin} from './mixin/SpHeader.mixin';
import {SpFooterMixin} from './mixin/SpFooter.mixin';
import {ConcentrateMixin} from './mixin/Concentrate.mixin';
import {PlayerStyleMixin} from './mixin/PlayerStyle.mixin';
import {OpenApiCommonMixin} from './mixin/OpenApiCommon.mixin';
import {OpenApiForH5Mixin} from './mixin/OpenApiForH5.mixin';
import {API_METHOD_MAP, ApiPropsMixin} from './mixin/ApiProps.mixin';
import {ConfigMixin} from './mixin/Config.mixin';
import {EventMixin} from './mixin/Event.mixin';
import {AuthMixin} from "./mixin/Auth.mixin";
import {ScreenTemplateMixin} from "./mixin/ScreenTemplate.mixin";
import {clearSimplePlayerData, getSimplePlayerData} from "./lib";
import {
    play,
    stopPlayer,
    stopPlayers,
    playback,
    playbackAgain,
    fast,
    slow,
    changePlaybackTime,
    pause, resume, frameForward, frameBack
} from "./lib/h5.lib";
import {ACTION, EVENT_TYPE, PLAYER_MODE_MAP, PLAYER_STATUS_MAP, PLAYER_TYPE} from "./lib/params.lib";
import {infoLog, logger, warnLog} from "./util/logger";
import {clearPlayers} from "./lib/h5.lib";
import {checkHttpsSafe, deepClone, isDev, isNotEmpty} from "./util";

export default {
    components: {
        H5SinglePlayer,
        VideoPlanPlayHeader,
        PlayerLayer,
        PlayerHeader,
        PlayerFooter,
        DefaultCameraImg,
        ToolBar,
        GlobalLayer,
        PtzCompass
    },
    mixins: [
        SpHeaderMixin, SpFooterMixin, PlayerStyleMixin, OpenApiCommonMixin, OpenApiForH5Mixin,
        ConfigMixin, ConcentrateMixin, EventMixin, ApiPropsMixin, AuthMixin, ScreenTemplateMixin
    ],
    computed: {
        totalWndNum() {
            return this.simplePlayerData.getCurrentScreen();
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
        this.simplePlayerData.setPlayerType(PLAYER_TYPE.H5_PLAYER);

        this.platProtocol = this.isDev ? 'https' : window.location.protocol.split(':')[0];
        this.platIP = this.isDev ? process.env.VUE_APP_IP : document.domain;
    },
    mounted() {
        this.initWindowEvent();
        this.updateH5PlayerSize();
        // 处理时间插件问题
        this.dealDatePickerProblem();
        // 刷新当前图层
        this.fleshCurrentScreenLayers();
        // this.checkBrowser();
    },
    beforeDestroy() {
        this.doDestroy();
        window.removeEventListener('resize', this.updateH5PlayerSize);
        clearSimplePlayerData();
    },
    methods: {
        checkBrowser() {
            if(!isDev()) {
                checkHttpsSafe(
                    window.location.host,
                    () => {},
                    () => {
                        this.$confirm('检测到浏览器并未安装证书，将导致播放器无法播放，请移步登录页面安装证书，重启浏览器。', {
                            confirmButtonText: '我已知晓',
                            type: 'warning'
                        });
                    }
                );
            }
        },
        updateTimeInterval() {
            this.updateTimeIntervalKey = new Date().getTime();
        },
        getH5SinglePlayerDisplay(index) {
            return this.simplePlayerData.isEmptyWnd(index) ? 'none' : 'block';
        },
        showH5Timeline(index) {
            return this.simplePlayerData.isPlaybackNow(index) && this.simplePlayerData.getWndStatus(index, 'status') === PLAYER_STATUS_MAP.PLAYING;
        },
        initWindowEvent() {
            window.addEventListener('resize', this.updateH5PlayerSize);
        },
        callAutoLoop() {
            this.$nextTick(() => {
                this.$refs.toolBarRef.handleIconLoopClick('loop');
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
            playbackAgain(this, this.simplePlayerData, index)
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
            // 2、底部全局工具栏 清除toolbar中的轮询
            this.$refs.toolBarRef.clearTimeLooper();
            this.eventEmit(EVENT_TYPE.CLOSE_ALL_WND, {list: currentScreen});
        },
        screenChangeHandle() {
            const index = this.simplePlayerData.getSelectedWnd();
            const currentPoint = this.simplePlayerData.getPlayInfosByIndex(index);
            this.doAnchorPoint(currentPoint);
            this.updateFooterKey();
            this.updateH5PlayerSize();
            this.eventEmit(EVENT_TYPE.CHANGE_SCREEN);
        },
        // 更新H5播放器尺寸
        updateH5PlayerSize() {
            this.$nextTick(() => {
                const screenNum = this.simplePlayerData.getCurrentScreen();
                for (let i = 0; i < screenNum; i++) {
                    const fNode = document.getElementsByClassName('player-outer')[0];
                    const w = fNode.offsetWidth;
                    const h = fNode.offsetHeight;
                    const refName = `${this.simplePlayerRefName}${i}`;
                    if (Array.isArray(this.$refs[refName])) this.$refs[refName][0].resize(w, h);
                    else this.$refs[refName].resize(w, h);
                    this.simplePlayerData.setH5Params(i, 'width', w);
                    this.simplePlayerData.setH5Params(i, 'height', h);
                }
            });
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
                this.clearAllPlayerHistoryStream(PLAYER_MODE_MAP.PLAYBACK.value); // 销毁切换前的流
                this.doPlay();
            } else {
                this.clearAllPlayerHistoryStream(PLAYER_MODE_MAP.PREVIEW.value); // 销毁切换前的流
                this.doPlayback();
            }
            // 事件抛出
            this.eventEmit(EVENT_TYPE.GLOBAL_PLAYER_STATUS, {
                status: this.simplePlayerData.getGlobalStatus()
            });
        },
        // 播放器时间段发生改变
        videoRangeChangeHandle(params) {
            // this.destoryAllInterval(); // 先销毁
            this.startConcentrate(params);
        },
        // 清楚当前页所有历史流
        clearAllPlayerHistoryStream(type) {
            const list = this.simplePlayerData.getCurrentPagePoint();
            list.forEach((c, i) => {
                switch(type) {
                    case PLAYER_MODE_MAP.PREVIEW.value:
                        this.callStopPlayback(i);
                        break;
                    case PLAYER_MODE_MAP.PLAYBACK.value:
                        this.callStopPlay(i);
                        break;
                }
            });
        },
        // 销毁所有播放器
        doDestroy() {
            // 先销毁播放器对象(内部清除播放器数据对象)
            stopPlayers(this, this.simplePlayerData);
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
        // 视频宫格选中事件
        playerWndClick(index) {
            this.simplePlayerData.setSelectedWnd(index);
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
            this.updateH5PlayerSize();
            // 现场发现全屏后，计算还是早于渲染，故此处再追加一次计算样式。
            const _id = setTimeout(() => {
                this.updateH5PlayerSize();
                clearTimeout(_id);
            }, 300);
        },
        callClearPlayer(index) {
            this.closeLayer(index);
            stopPlayer(this, this.simplePlayerData, index);
            this.simplePlayerData.resetActionActive(index);
        },
        callClearPlayers(needInit = true) {
            this.clearCurrentScreenLayers();
            stopPlayers(this, this.simplePlayerData, needInit);
            this.simplePlayerData.resetActionActive();
        },
        closeAllOperation() {
            this.simplePlayerData.setCloseAll(false);
            stopPlayer(this, this.simplePlayerData, true);
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
        //回放
        async callStartPlayback(index) {
            const playbackUrlKey = 'playbackUrl'; // 回放取流地址KEY
            const next = () => {
                this.fleshLayer(index);
                playback(this, this.simplePlayerData, index).then(() => {
                    this.simplePlayerData.setEmptyWnd(index, false);
                    this.simplePlayerData.setWndStatus(index, 'status', PLAYER_STATUS_MAP.PLAYING);
                    this.fleshLayer(index);
                    this.eventEmit(EVENT_TYPE.PLAYBACK_SUCCESS, {index});
                    // 状态变化，抛出事件
                    this.eventEmit(EVENT_TYPE.WND_STATUS_CHANGE, {index});
                }).catch(() => {
                    this.simplePlayerData.setWndStatus(index, 'status', PLAYER_STATUS_MAP.FAILING);
                    this.fleshLayer(index);
                    this.eventEmit(EVENT_TYPE.PLAYBACK_FAIL, {index});
                    // 状态变化，抛出事件
                    this.eventEmit(EVENT_TYPE.WND_STATUS_CHANGE, {index});
                    if (!this.simplePlayerData.getIsPlaybackAgain(index)) {
                        this.rePlayback(index);
                    }
                });
            };
            const playbackUrl = this.simplePlayerData.getH5Params(index, playbackUrlKey);
            this.simplePlayerData.setH5Params(index, 'playbackFail', null);
            if (isNotEmpty(playbackUrl)) {
                next();
            } else {
                // 先查询接口，而后调用播放器api
                this.getApi(API_METHOD_MAP.QUERY_H5_PLAYBACK_API)(this.simplePlayerData.getH5PlaybackApiParams(index)).then((res) => {
                    if (isNotEmpty(res) && [0, '0'].includes(res.code)) {
                        const {data} = res;
                        Object.keys(data).forEach((k) => {
                            if (['url', playbackUrlKey].includes(k)) this.simplePlayerData.setH5Params(index, playbackUrlKey, data[playbackUrlKey] || data['url']);
                            else this.simplePlayerData.setH5Params(index, k, data[k]);
                        });
                    } else {
                        // 展示错误页
                        this.simplePlayerData.setH5Params(index, 'playbackFail', res);
                    }
                    infoLog('set h5 params complete.', this.simplePlayerData.getH5Params(index));
                    next();
                });
            }
        },
        async callChangePlaybackTime(index, {dateRange}) {
            changePlaybackTime(this, this.simplePlayerData, index, dateRange);
        },
        //停止回放
        async callStopPlayback(index) {
            stopPlayer(this, this.simplePlayerData, index);
        },
        callPauseOrContinue(index, callback, params) {
            const {value} = params;
            const apiFunc = value ? pause : resume;
            apiFunc(this, this.simplePlayerData, index).then(() => {
                callback && callback();
            });
        },
        callFrameNext(index) {
            frameForward(this, this.simplePlayerData, index).then((res) => {
                this.pauseHandle({index, pauseStatus: true});
            });
        },
        callFramePre(index) {
            frameBack(this, this.simplePlayerData, index).then((res) => {
                this.pauseHandle({index, pauseStatus: true});
            });
        },
        callPlayBySpeed(index, params, value, speed, speedType) {
            switch (speedType) {
                case SPEED_TYPE.FAST:
                    fast(this, this.simplePlayerData, index);
                    break;
                case SPEED_TYPE.SLOW:
                    slow(this, this.simplePlayerData, index);
                    break;
            }
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
        // 错误处理
        errorHandle(scopeIndex, index, iErrorCode, oError) {
            const isPreview = this.simplePlayerData.isPreviewStatus(scopeIndex);
            const err = { code: iErrorCode, msg: '异常流中断，网络环境等原因导致' };
            infoLog('[errorHandle] scopeIndex, index, iErrorCode, oError', scopeIndex, index, iErrorCode, oError);
            this.simplePlayerData.setWndStatus(scopeIndex, 'status', PLAYER_STATUS_MAP.FAILING);
            if (isPreview) {
                this.simplePlayerData.setH5Params(scopeIndex, 'previewFail', err);
                this.eventEmit(EVENT_TYPE.PREVIEW_FAIL, {scopeIndex, index: scopeIndex});
            } else {
                this.simplePlayerData.setH5Params(scopeIndex, 'playbackFail', err);
                this.eventEmit(EVENT_TYPE.PLAYBACK_FAIL, {scopeIndex, index: scopeIndex});
            }
            this.fleshLayer(scopeIndex);
            // 状态变化，抛出事件
            this.eventEmit(EVENT_TYPE.WND_STATUS_CHANGE, {scopeIndex, index: scopeIndex});
        },
        // 开始播放
        // 支持两种播放，传入indexCode播放
        // 根据取流地址播放
        async callStartPlay(index) {
            const next = () => {
                this.fleshLayer(index);
                play(this, this.simplePlayerData, index).then(() => {
                    this.simplePlayerData.setEmptyWnd(index, false);
                    this.simplePlayerData.setWndStatus(index, 'status', PLAYER_STATUS_MAP.PLAYING);
                    this.fleshLayer(index);
                    this.eventEmit(EVENT_TYPE.PREVIEW_SUCCESS, {index});
                    // 状态变化，抛出事件
                    this.eventEmit(EVENT_TYPE.WND_STATUS_CHANGE, {index});
                }, (err) => {
                    logger('err', err);
                    this.simplePlayerData.setWndStatus(index, 'status', PLAYER_STATUS_MAP.FAILING);
                    this.fleshLayer(index);
                    this.eventEmit(EVENT_TYPE.PREVIEW_FAIL, {index});
                    // 状态变化，抛出事件
                    this.eventEmit(EVENT_TYPE.WND_STATUS_CHANGE, {index});
                });
            };
            const url = this.simplePlayerData.getH5Params(index, 'url');
            this.simplePlayerData.setH5Params(index, 'previewFail', null);
            if (isNotEmpty(url)) {
                next();
            } else {
                // 先查询接口，而后调用播放器api
                this.getApi(API_METHOD_MAP.QUERY_H5_PREVIEW_API)(this.simplePlayerData.getH5PreviewApiParams(index)).then((res) => {
                    if (isNotEmpty(res) && [0, '0'].includes(res.code)) {
                        const {data} = res;
                        Object.keys(data).forEach((k) => {
                            this.simplePlayerData.setH5Params(index, k, data[k]);
                        });
                    } else {
                        // 展示错误页
                        this.simplePlayerData.setH5Params(index, 'previewFail', res);
                    }
                    infoLog('set h5 params complete.', this.simplePlayerData.getH5Params(index));
                    next();
                });
            }
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
            await stopPlayer(this, this.simplePlayerData, index);
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
        height: 100%;
        display: flex;
        flex-flow: row wrap;
        padding: 0 1px;
    }

    .sp-window {
        overflow: hidden;
        position: relative;
        border: #000 1px solid;
        box-sizing: border-box;

        .sp-header {
            position: absolute;
            left: 0;
            top: -38px;
        }

        .simple-player {
            width: 100%;
            background: #333;
        }

        .player-container-outer {
            width: 100%;
            height: 100%;
            display: block;
        }

        .contain-footer {
            height: calc(100% - 30px);
        }

        .sp-body {
            height: 100%;
            width: 100%;
        }

        .sp-body-back {
            height: calc(100% - 30px) !important;
            width: 100%;
        }

        .icon-clicked {
            color: rgba(0, 0, 255, 1);
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
    }
}

.snap-dialog-img {
    width: 100%;
    height: 100%;
    object-fit: fill;
}
</style>
<style lang="scss">
@import "./style/themes";
.el-picker-panel.simple-player-date-picker {
    opacity: 0;
}
</style>
