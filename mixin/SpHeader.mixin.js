import {ACTION, BTOOL_URL, EVENT_TYPE, NOTIFY_METHOD, PLAYER_MODE_MAP, PLAYER_STATUS_MAP} from "./../lib/params.lib";
import {
    control3dZoom,
    controlPlaybackRecord,
    controlPreviewRecord,
    controlSound,
    deviceTalk,
    digitalZoom,
    downloadVideo,
    endShot,
    ptzControl,
    rePlay, snapShotMulti,
    updateLockByAbility
} from "./../lib/cc.lib";
import {
    capture,
    disableZoom,
    enableZoom,
    openSound,
    startSave,
    startTalk,
    stopSave,
    stopTalk
} from './../lib/h5.lib';

import {
    getMessageOfCapture,
    getMessageOfRecord,
    showErrMsg,
} from "./../lib/notify.lib";
import {addHikccCover, debounce, isEmpty, isNotEmpty, isWindowsOS} from "./../util";
import {infoLog, logger, warnLog} from "./../util/logger";
import Tool from "./../util/tools";

const {
    START_PLAY_REAL,
    START_PLAY_BACK,
    REAL_RECORD,
    SNAP_SHOT
} = NOTIFY_METHOD.FROM_METHOD
const {
    PAUSE_PLAY_BACK,
    SPEED_CHANGED,
    REFRESH,
    DOUBLE_CLICK,
    DOWNLOAD,
    CALENDAR,
    DROP_EVENT,
    SELECT_EXISTING_DIR,
    GESTURE
} = NOTIFY_METHOD.TYPE
const {
    MOVE_RIGHT,
    MOVE_LEFT,
    MOVE_UP,
    MOVE_DOWN,
    CHANGE_TO_PLAY_REAL,
    CHANGE_TO_PLAY_BACK,
    ABOUT,
    ENTER_PTZ,
    LEAVE_PTZ,
    CLOSE,
    TOUCH_BAR_SHOW,
    TOUCH_BAR_HIDE,
    ENTER_DIGITAL_ZOOM,
    LEAVE_DIGITAL_ZOOM,
    OPEN_VOICE,
    CLOSE_VOICE,
} = NOTIFY_METHOD.MSG

const SpHeaderMixin = {
    data() {
        return {
            hasPromptBtools: false,
            hasCheckedTool: false, // 仅仅检测一次
            showErrMsgDebounce: debounce(showErrMsg, 1000)
        };
    },
    methods: {
        // 播放器加载完毕的回调
        onLoadResult(player, errCode, data, index) {
            this.$emit('load-result', player, errCode, data, index); // 继续抛出，兼容性处理
            infoLog('[onLoadResult][loaded over][player, errCode, data, index]', player, errCode, data, index);
            this.simplePlayerData.setCcExists(errCode === 0);
            // 先初始化
            this.simplePlayerData.setWndStatus(index, 'status', PLAYER_STATUS_MAP.DOPLAYED);
            // 状态变化，抛出事件
            this.eventEmit(EVENT_TYPE.WND_STATUS_CHANGE, {index});
            this.simplePlayerData.setPlayerReady(index, false);
            this.fleshLayer(index);

            if (this.simplePlayerData.getCheckTool()) {
                this.checkBtools();
                const commonConfig = this.simplePlayerData.getCommonConfig();
                const msg = (commonConfig && commonConfig.hasOwnProperty('btoolsPlayErrorMsg')) ? commonConfig.btoolsPlayErrorMsg : null;
                this.showErrMsgDebounce(errCode, this, msg);
            }
        },
        $pullBtoolsOrccExe(wsUrl) {
            const ccExists = this.simplePlayerData.getCcExists();
            const commonConfig = this.simplePlayerData.getCommonConfig();
            const {promise1} = Tool.pullBtoolsOrccExe(
                ccExists,
                commonConfig,
                wsUrl
            );
            return promise1;
        },
        checkBtools() {
            const {platProtocol, platIp, platPort, btoolsUrl} = this.simplePlayerData.getCommonConfig();
            if (
                this.hasCheckedTool ||
                (isEmpty(platProtocol) && isEmpty(platIp) && isEmpty(platPort))
            ) {
                if (!this.hasCheckedTool) {
                    warnLog('warning your code, before player is created, you should put common config firstly!');
                }
                return;
            } // 仅仅检测一次，且关键字段均不能为空
            this.hasCheckedTool = true;
            this.$pullBtoolsOrccExe("ws://127.0.0.1:18000/WebS_Js")
                .then((resData) => {
                    if (resData.code === -1) {
                        const className = 'not-found-btool-confirm';
                        // 情况1：平台未安装插件助手，提示用户安装
                        this.$confirm(resData.message, {
                            distinguishCancelAndClose: true,
                            customClass: className,
                            confirmButtonText: "安装",
                            cancelButtonText: "取消",
                        }).then(() => {
                            const toolUrl = !!btoolsUrl ? btoolsUrl : (isWindowsOS() ? BTOOL_URL.WIN : BTOOL_URL.OTHER); // 此处为插件助手下载地址
                            window.open(toolUrl);
                        });
                        // 播放器弹框需要显示在播放画面上
                        addHikccCover(className);
                    } else if (resData.code === -2) {
                        // 情况2：极简播放器插件未安装，安装极简播放器插件并提示用户
                        this.$message({type: "warning", message: resData.message});
                    } else if (resData.code === 0) {
                        // 情况3：cc进程未启动，拉起cc进程并提示用户
                        this.$message({type: "warning", message: resData.message});
                    }
                });
        },
        updateByCode(code, index) {
            const S = code === 0 ? PLAYER_STATUS_MAP.PLAYING : code === -1 ? PLAYER_STATUS_MAP.FAILING : PLAYER_STATUS_MAP.UNKNOWN;
            this.simplePlayerData.setWndStatus(index, 'status', S);
            // 状态变化，抛出事件
            this.eventEmit(EVENT_TYPE.WND_STATUS_CHANGE, {index});
            this.fleshLayer(index);
        },
        // CC回调
        onNotify(player, data, index) {
            infoLog('[client-container][notify-method][player, data, index]', player, data, index);
            this.$emit('notify-method', player, data, index); // 继续抛出，兼容性处理
            const {fromMethod, type} = data;
            if ([START_PLAY_REAL, START_PLAY_BACK].includes(fromMethod)) {
                this.startPlayRealOrBackHandle(index, data);
            }
            if (type === PAUSE_PLAY_BACK) {
                this.pausePlayBackHandle(index, data);
            }
            // 录像
            if (fromMethod === REAL_RECORD) {
                this.realRecordHandle(index, data);
            }
            // 倍速
            if (type === SPEED_CHANGED) {
            }
            // 刷新
            if (type === REFRESH) {
                this.reFreshHandle(index);
            }
            // 双击事件
            if (type === DOUBLE_CLICK) {
                this.dbPlayerWndClick && this.dbPlayerWndClick(index);
            }
            // 調下載器
            if (type === DOWNLOAD) {
                this.downloadVideHandle();
            }
            // 重新选择回放时间/回放
            if (type === CALENDAR) {
                this.callCalendar();
            }
            // 截图成功提示 picBase64
            if (fromMethod === SNAP_SHOT) {
                this.snapShotHandle(data);
            }
            if (type === GESTURE) {
                this.gestureHandle(data, index);
            }
            if (type === DROP_EVENT) {
                this.dropEventHandle(data);
            }
            if (fromMethod === SELECT_EXISTING_DIR) {
                this.setDirPath(data.msg);
            }
            this.updateDom();
        },
        reFreshHandle() {
            const index = this.simplePlayerData.getSelectedWnd();
            rePlay(this, this.simplePlayerData, index, () => {
                this.simplePlayerData.setTitle(index, this.simplePlayerData.getTitle(index));
            })
        },
        realRecordHandle(index, data) {
            const {msg, recordFile, recordPath} = data;
            if (msg === 'recordFinished') {
                this.$notify({
                    title: '录像保存路径',
                    message: getMessageOfRecord(recordFile, recordPath, ''),
                    dangerouslyUseHTMLString: true,
                    duration: 2000
                });
            }
        },
        pausePlayBackHandle(index) {
            const isPause = msg === 'true';
            this.simplePlayerData.setAction(index, ACTION.IS_PAUSE, isPause);
            this.pauseHandle({
                index,
                pauseStatus: isPause
            });
        },
        startPlayRealOrBackHandle(index, data) {
            const {msg, code, fromMethod} = data;
            if (code !== 0 && !this.simplePlayerData.getIsPlaybackAgain(index) && this.simplePlayerData.isPlaybackNow(index)) {
                warnLog('请求失败后，需要再次请求（切换中心存储和设备存储）');
                this.rePlayback(index);
            }
            this.updateByCode(code, index);
            if (fromMethod === START_PLAY_REAL) {
                if (msg === 'success') {
                    this.simplePlayerData.setPlayerReady(index, true);
                    this.eventEmit(EVENT_TYPE.PREVIEW_SUCCESS, {index});
                } else {
                    this.simplePlayerData.setWndStatus(index, 'status', PLAYER_STATUS_MAP.FAILING);
                    this.fleshLayer(index);
                    this.eventEmit(EVENT_TYPE.PREVIEW_FAIL, {index, response: data});
                }
                this.fleshLayer(index);
            }
            if (fromMethod === START_PLAY_BACK) {
                if (msg === 'success') {
                    this.simplePlayerData.setAction(index, ACTION.IS_PAUSE, false);
                    this.simplePlayerData.setPlayerReady(index, true);
                    this.eventEmit(EVENT_TYPE.PLAYBACK_SUCCESS, {index});
                } else if (msg === 'onDecodeFinished') {
                    // 回放结束( 播放完了，不可以调用截图、电子放大等功能键，需要循环回放在收到结束消息再次调用回放接口即可)
                    // 回放結束子功能禁用
                    this.simplePlayerData.setWndStatus(index, 'status', PLAYER_STATUS_MAP.DONE);
                    // 状态变化，抛出事件
                    this.eventEmit(EVENT_TYPE.WND_STATUS_CHANGE, {index});
                }
                this.fleshLayer(index);
            }
        },
        dropEventHandle(data) {
            const {msg} = data;
            let newObj = Object.assign({}, JSON.parse(msg), {
                index: this.simplePlayerData.getSelectedWnd()
            });
            logger('[dropEventHandle]', newObj);
        },
        gestureHandle(data, index) {
            infoLog('[gestureHandle]', data, index);
            const {msg} = data;
            switch (msg) {
                // 右划
                case MOVE_RIGHT:
                    this.transWindow(MOVE_RIGHT);
                    break;
                // 左划
                case MOVE_LEFT:
                    this.transWindow(MOVE_LEFT);
                    break;
                // 上移
                case MOVE_UP:
                    break;
                // 下移
                case MOVE_DOWN:
                    break;
                // 从回放切换到预览
                case CHANGE_TO_PLAY_REAL:
                    this.switchPreviewOrPlayback(index);
                    break;
                case CHANGE_TO_PLAY_BACK:
                    this.switchPreviewOrPlayback(index);
                    break;
                // 关于
                case ABOUT:
                    this.openInfoPanel(index);
                    break;
                // 进入云台
                case ENTER_PTZ:
                    this.ptzControl(index);
                    break;
                case LEAVE_PTZ:
                    this.ptzControl(index);
                    break;
                case CLOSE:
                    this.closeWnd(index);
                    break;
                case TOUCH_BAR_SHOW:
                    this.hidePlayerHeader(index);
                    break;
                case TOUCH_BAR_HIDE:
                    this.openPlayerHeader(index);
                    break;
                case ENTER_DIGITAL_ZOOM:
                    this.digitalZoom(index);
                    break;
                case LEAVE_DIGITAL_ZOOM:
                    this.digitalZoom(index);
                    break;
                case OPEN_VOICE:
                    this.controlSound(index);
                    break;
                case CLOSE_VOICE:
                    this.controlSound(index);
                    break;
            }
        },
        snapShotHandle(data) {
            const {code} = data;
            if (code === 0) {
                const index = this.simplePlayerData.getSelectedWnd();
                const title = this.simplePlayerData.getTitle(index);
                const aimPath = this.simplePlayerData.getCcLocalConfig('strSnapPath');
                const exitAimPath = isNotEmpty(aimPath) && aimPath && aimPath.toLowerCase() !== 'null';
                const {picBase64} = data;
                if (picBase64) {
                    const url = 'data:image/jpeg;base64,' + picBase64;
                    const text = title ? `${title}.JPG，保存路径（${(exitAimPath ? aimPath : 'C:/capture')}）` : `保存路径（${(exitAimPath ? aimPath : 'C:/capture')}）, 截图成功`;
                    this.$notify({
                        message: getMessageOfCapture(url, text),
                        dangerouslyUseHTMLString: true
                    });
                } else {
                    this.$notify({message: '截图成功'});
                }
            } else {
                infoLog('[snapShotHandle][失败]');
            }
        },
        downloadVideHandle() {
            const index = this.simplePlayerData.getSelectedWnd();
            downloadVideo(this, this.simplePlayerData, index);
        },
        resetStatus(index) {
            this.simplePlayerData.resetAction(index);
        },
        /* 清除出错信息,重置窗口状态 */
        clearWnd(index) {
            if (this.simplePlayerData.$player(this, index)) {
                this.simplePlayerData.$player(this, index).doClear({});
                this.simplePlayerData.setEmptyWnd(index, true);
            }
        },
        getSpAction(index) {
            return this.simplePlayerData.getAction(index);
        },
        playerHeaderChange(index) {
            this.updateFooterKey();
            this.$emit('playerHeaderChange', index);
        },
        // 工具栏功能处理
        headerToolbarHandle(operationType, index) {
            switch (operationType) {
                case ACTION.SNAP:
                    this.endShot(index);
                    break;
                case ACTION.SNAP_MORE:
                    this.snapShotMulti(index);
                    break;
                case ACTION.DIGITAL_ZOOM:
                    this.digitalZoom(index);
                    break;
                case ACTION.SOUND:
                    this.controlSound(index);
                    break;
                case ACTION.PTZ:
                    this.ptzControl(index);
                    break;
                case ACTION.TD_ZOOM:
                    this.control3dZoom(index);
                    break;
                case ACTION.PREVIEW_RECORD:
                    this.controlPreviewRecord(index);
                    break;
                case ACTION.PLAYBACK_RECORD:
                    this.controlPlaybackRecord(index);
                    break;
                case ACTION.TALK:
                    this.deviceTalk(index);
                    break;
                case ACTION.INFO:
                    this.openInfoPanel(index);
                    break;
                case ACTION.CLOSE:
                    this.closeWnd(index);
                    break;
                case ACTION.LABEL_TAG:
                    this.eventEmit(EVENT_TYPE.LABEL_TAG, {index});
                    break;
                case ACTION.AI_RECOMMEND:
                    this.eventEmit(EVENT_TYPE.AI_RECOMMEND, {index});
                    break;
                default:
                    const F = isNotEmpty(index) && typeof index === 'object';
                    this.eventEmit(operationType, F ? index : {index});
                    break;
            }
        },
        // 云台控制
        compassOperateHandle(index, type, mouseAction) {
            this.eventEmit(type, {index, mouseAction});
        },
        switchPreviewOrPlayback(index) {
            const isPreview = this.simplePlayerData.isPreviewStatus(index);
            const isPlayback = this.simplePlayerData.isPlaybackStatus(index);
            if (isPreview) {
                this.simplePlayerData.setStatus(index, PLAYER_MODE_MAP.PLAYBACK.value);
            } else if (isPlayback) {
                this.simplePlayerData.setStatus(index, PLAYER_MODE_MAP.PREVIEW.value);
            }
            if (this.simplePlayerData.isPreviewStatus(index)) {
                this.$parent.startPlay(index);
            } else {
                this.simplePlayerData.setActionByKeys(index, [
                    'ptz',
                    'sound',
                    'digitalZoom',
                    'isPause',
                    'previewRecord',
                    'playbackRecord',
                    'talk'
                ], false);
                this.$parent.startPlayback(index);
            }
            this.openPlayerHeader(index);
        },
        // 截图
        endShot(index) {
            let res;
            if (this.simplePlayerData.isClientContainer()) res = endShot(this, this.simplePlayerData, index, () => {
                this.msgThrottle('截图失败！');
            });
            else if (this.simplePlayerData.isH5Player()) res = capture(this, this.simplePlayerData, index);
            infoLog('[endShot][res]', res);
        },
        // 连续抓拍
        snapShotMulti(index) {
            let res;
            if (this.simplePlayerData.isClientContainer()) res = snapShotMulti(this, this.simplePlayerData, index, () => {
                this.msgThrottle('截图失败！');
            });
            infoLog('[snapShotMulti][res]', res);
        },
        // 声音
        controlSound(index) {
            if (this.simplePlayerData.isClientContainer()) controlSound(this, this.simplePlayerData, index);
            else if (this.simplePlayerData.isH5Player()) openSound(this, this.simplePlayerData, index);
        },
        // 3dZoom
        control3dZoom(index) {
            if (this.simplePlayerData.isClientContainer()) control3dZoom(this, this.simplePlayerData, index);
            else if (this.simplePlayerData.isH5Player()) warnLog('no support 3D!');
        },
        // 预览记录
        controlPreviewRecord(index) {
            const record = this.simplePlayerData.getAction(index, ACTION.PREVIEW_RECORD);
            if (this.simplePlayerData.isClientContainer()) {
                controlPreviewRecord(this, this.simplePlayerData, index);
            } else if (this.simplePlayerData.isH5Player()) {
                if (record) startSave(this, this.simplePlayerData, index);
                else stopSave(this, this.simplePlayerData, index);
            }
        },
        // 回放记录
        controlPlaybackRecord(index) {
            const record = this.simplePlayerData.getAction(index, ACTION.PLAYBACK_RECORD);
            if (this.simplePlayerData.isClientContainer()) {
                controlPlaybackRecord(this, this.simplePlayerData, index);
            } else if (this.simplePlayerData.isH5Player()) {
                if (record) startSave(this, this.simplePlayerData, index);
                else stopSave(this, this.simplePlayerData, index);
            }
        },
        // 对讲
        deviceTalk(index) {
            const talk = this.simplePlayerData.getAction(index, ACTION.TALK);
            if (this.simplePlayerData.isClientContainer()) {
                deviceTalk(this, this.simplePlayerData, index);
            } else if (this.simplePlayerData.isH5Player()) {
                if (talk) startTalk(this, this.simplePlayerData, index);
                else stopTalk(this, this.simplePlayerData, index);
            }
        },
        //云台控制
        ptzControl(index) {
            if (this.simplePlayerData.getOpenPtzWidthMini()) {
                this.$refs.ptzCompassRef && this.$refs.ptzCompassRef.open(index);
            }
            if (this.simplePlayerData.isClientContainer()) ptzControl(this, this.simplePlayerData, index);
            else if (this.simplePlayerData.isH5Player()) warnLog('no support PTZ control!');
        },
        // 电子放大
        digitalZoom(index) {
            const zoom = this.simplePlayerData.getAction(index, ACTION.DIGITAL_ZOOM);
            if (this.simplePlayerData.isClientContainer()) {
                digitalZoom(this, this.simplePlayerData, index);
            } else if (this.simplePlayerData.isH5Player()) {
                if (zoom) enableZoom(this, this.simplePlayerData, index);
                else disableZoom(this, this.simplePlayerData, index);
            }
        },
        canShot(playType, playSnapAuth, playbackSnapAuth) {
            if (playType === 'play' && playSnapAuth) return true;
            if (playType === 'playback' && playbackSnapAuth) return true;
            return false;
        },
        closeWnd(index) {
            // 必须先抛出事件
            this.eventEmit(EVENT_TYPE.CLOSE_WND, {index});
            this.simplePlayerData.setEmptyWnd(index, true);
            this.callClearPlayer(index);
        },
        openPlayerHeader(index) {
            if (!this.simplePlayerData.isEmptyWnd(index)) {
                const r = this.$refs[`spHeader${index}`];
                if (Array.isArray(r)) r && r[0] && r[0].show();
                else r && r.show();
            }
        },
        hidePlayerHeader(index) {
            this.$nextTick(() => {
                const r = this.$refs[`spHeader${index}`];
                if (Array.isArray(r)) r && r[0] && r[0].hide();
                else r && r.hide();
            });
        },
        // 刷新某播放器的顶部工具栏权限
        setPlayerHandlerLock(index) {
            const ability = this.simplePlayerData.getCapabilitySet(index) || [];
            // 通过能力集设置
            updateLockByAbility(this, this.simplePlayerData, index, ability);
        }
    }
};

export {SpHeaderMixin};
