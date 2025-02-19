import {ABILITY, ACTION, PLAYER_MODE_MAP, PLAYER_STATUS_MAP, POINT_AUTH_MAP} from "./../lib/params.lib";
import {isNotEmpty, numStrToRgb, parseUTC} from "./../util";
import {SimplePlayerConfig} from "client-container";
import {errorLog, infoLog} from "./../util/logger";
import moment from "moment";

/**
 * @function
 * @description 设置通用配置
 * @return {String}
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 * cc-api-doc：
 * https://wiki.hikvision.com.cn/pages/viewpage.action?pageId=158979442
 */
export async function setCommonConfig(param) {
    // 处理水印位置和颜色 --详见系统管理>系统配置>通用配置 getAllConfig
    const {
        iColor, iPos, iFontsize, iCustomSwitches, iCustom,
        iFormat, platProtocol, platIp, platPort, token, jwt,
        gpuDecode, mutiRouteId, lng, realName, waterMark, bUseSac,
        bShowDownload, iErrConcealEnable, bAIShow, strAIShowWsUrl
    } = param;
    let configParam = {
        strProtocol: platProtocol || '',
        strPlatIp: platIp || '',
        strPlatPort: platPort || '443',
        strToken: token || '',
        strAuthorization: jwt || '',
        bGpuEnable: gpuDecode || false, // 是否开启gpu解码
        iMultiRouteId: mutiRouteId || 0,
        strPlatLanguage: lng || 'zh_CN',
        strUserName: realName || waterMark.userName || '',
        strCommon: iCustom || '',
        bShowCommon: iCustomSwitches || false,
        bShowName: waterMark.showName || '',
        bShowIP: waterMark.showIP || '',
        bShowMac: waterMark.showMac || '',
        bUseSac: bUseSac || false,
        bGetSnap: true, // 获取base64截图
        bShowDownload: bShowDownload,
        bUseUnivice: true, // true时预览和回放经过univice服务, false时不经过univice服务
        iErrConcealEnable: 1, // 如果码流有问题，开差错隐藏
        iPos: Number(iPos) - 1, // 水印位置
        strColor: numStrToRgb(iColor), // 获取-水印颜色
        iTilt: iFormat === '2' ? 0 : -45, // 水印倾斜角度 系统配置-视频配置里
        iFontSize: iFontsize || '16' // 水印字体大小 系统配置-视频配置里 未提供该项配置 目前写死
    };
    if (isNotEmpty(bAIShow)) configParam = Object.assign(configParam, {bAIShow}); // 是否开启AIShow
    if (isNotEmpty(strAIShowWsUrl)) configParam = Object.assign(configParam, {strAIShowWsUrl}); // 提供websocket url

    try {
        await SimplePlayerConfig(configParam);
    } catch (error) {
        errorLog('SimplePlayerConfig函数调用失败:', error);
    }
}

/**
 * @function
 * @description 清空某个播放器窗口
 * @return {String}
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 */
export function clearPlayer($this, simplePlayerData, index) {
    simplePlayerData.$player($this, index) && simplePlayerData.$player($this, index).doClear({});
    simplePlayerData.resetPlayInfos(index);
}

/**
 * @function
 * @description 获取当前播放时间
 * @author lixiaodong31 2023/12/14
 * @version 1.0.0
 * @example
 */
export function getOSDTime($this, simplePlayerData, index) {
    try {
        return simplePlayerData.$player($this, index) && simplePlayerData.$player($this, index).getOSDTime({});
    } catch (e) {
        infoLog('[getOSDTime]', e);
        return null;
    }
}

/**
 * @function
 * @description 清空所有播放器
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 */
export function clearPlayers($this, simplePlayerData, needInit = true) {
    const currentScreen = simplePlayerData.getCurrentScreen();
    simplePlayerData.$player($this, undefined).forEach((c) => {
        c && c.doClear({});
    });
    // 初始化播放器对象
    if (needInit) {
        simplePlayerData.init();
        simplePlayerData.setCurrentScreen(currentScreen);
        simplePlayerData.resetPagination();
    }
}

/**
 * @function
 * @description 下一帧
 * @return {String}
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 */
export function frameNext($this, simplePlayerData, index, callback) {
    if (simplePlayerData.$player($this, index)) {
        simplePlayerData.$player($this, index).frameNext({});
        simplePlayerData.setAction(index, ACTION.IS_PAUSE, true);
        simplePlayerData.setAction(index, ACTION.FRAME_NEXT, false);
        callback && callback({
            index,
            pauseStatus: true,
            delayShow: true
        })
    }
}

/**
 * @function
 * @description 上一帧
 * @return {String}
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 */
export function framePre($this, simplePlayerData, index, callback) {
    if (simplePlayerData.$player($this, index)) {
        simplePlayerData.$player($this, index).framePre({});
        simplePlayerData.setAction(index, ACTION.IS_PAUSE, true);
        simplePlayerData.setAction(index, ACTION.FRAME_PRE, false);
        callback && callback({
            index,
            pauseStatus: true,
            delayShow: true
        })
    }
}

/**
 * @function
 * @description 开始播放
 * @return {String}
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 */
export async function startPlay($this, simplePlayerData, index, success, error) {
    let res;
    try {
        const $player = simplePlayerData.$player($this, index);
        // 设置播放器对象为预览中
        simplePlayerData.setStatus(index, PLAYER_MODE_MAP.PREVIEW.value);
        if ($player === null || typeof $player === 'undefined') {
            errorLog('[播放失败][$player]', $player);
            return;
        }
        $player.doClear({});
        let _p = {
            strIndexcode: "",
            streamType: 0,
            transmode: 1,
            isSmallEagleEyeAbility: 0,
            deviceName: "",
            cascade: false,
        };
        const token = simplePlayerData.getTokens(index, POINT_AUTH_MAP.PREVIEW); // 追加token
        const {
            indexCode,
            streamType, // 0主码流， 1子码流
            transmode, // 取流方式 0 UDP 1 TCP
            isSmallEagleEyeAbility, // 是否是小鹰眼设备 0 不是 1是
            expand, // domainId=0
            url,
            streamDispatchMode, // vnsc查询得到的转流方式
            delayTime, // 表示视频延时播放时间，一般在1000-5000ms
        } = simplePlayerData.getPlayInfosByIndex(index);
        _p = Object.assign(_p, {strIndexcode: indexCode});
        if (isNotEmpty(streamType)) _p = Object.assign(_p, {streamType});
        if (isNotEmpty(transmode)) _p = Object.assign(_p, {transmode});
        if (isNotEmpty(isSmallEagleEyeAbility)) _p = Object.assign(_p, {isSmallEagleEyeAbility});
        if (isNotEmpty(expand)) _p = Object.assign(_p, {expand});
        if (isNotEmpty(url)) _p = Object.assign(_p, {url});
        if (isNotEmpty(streamDispatchMode)) _p = Object.assign(_p, {streamDispatchMode});
        if (isNotEmpty(delayTime)) _p = Object.assign(_p, {delayTime});
        if (isNotEmpty(token)) _p = Object.assign(_p, {token});
        res = await $player.startPlayReal(_p);
        success && success(res);
    } catch (e) {
        errorLog('[播放异常][startPlay]', e);
        error && error(e);
    }
}

/**
 * @function
 * @description 停止播放
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 */
export async function stopPlay($this, simplePlayerData, index, error) {
    try {
        simplePlayerData.$player($this, index) && await simplePlayerData.$player($this, index).stopPlayReal({});
        simplePlayerData.setEmptyWnd(index, !!!simplePlayerData.getIndexCode(index));
        simplePlayerData.setWndStatus(index, 'status', PLAYER_STATUS_MAP.PAUSE);
    } catch (e) {
        error && error();
    }
}

/**
 * @function
 * @description 停止回放
 * @return {String}
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 */
export async function stopPlayback($this, simplePlayerData, index, error) {
    if (simplePlayerData.$player($this, index)) {
        try {
            await simplePlayerData.$player($this, index).stopPlayBack({});
            simplePlayerData.setEmptyWnd(index, !!!simplePlayerData.getIndexCode(index));
        } catch (e) {
            error && error();
        }
    } else {
        error && error();
    }
}

/**
 * @function
 * @description 改变回放时间
 * @return {String}
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 */
export async function changePlaybackTime($this, simplePlayerData, index, dateRange) {
    let res;
    const startTime = parseUTC(dateRange[0]);
    const endTime = parseUTC(dateRange[1]);
    simplePlayerData.$player($this, index) && simplePlayerData.$player($this, index).doClear({});
    // 设置为回放
    simplePlayerData.setStatus(index, PLAYER_MODE_MAP.PLAYBACK.value);
    const {
        indexCode,
        recordStyle,
        transmode,
        streamType,
        netZoneCode
    } = simplePlayerData.getPlayInfosByIndex(index);
    // 主子码流设备存储才生效
    // 1:子码流,
    // 2:第三码流
    // 254: 双码流搜索(优先返回主码流录像，没有主码流录像时返回子码流录像)
    // 255:返回所有
    const _streamType = recordStyle == 1 ? 254 : streamType;
    res = await simplePlayerData.$player($this, index).startPlayBack({
        strRecordParam: {
            indexCode,
            recordStyle: recordStyle || 0, // 0 中心存储 1查询设备存储
            recordType: '', // '0|1|2|6' 录像类型 传空查询全部录像片段 0|1|2|6 0 定时录像 1 移动侦测 2 报警触发 6 手动录像
            transmode: isNotEmpty(transmode) ? transmode : 1, // 0 UDP 1 TCP
            streamType: _streamType || 0, // 0 主码流 1 子码流
            startTime,
            endTime,
            netZoneCode
        }
    });
    return res;
}

/**
 * @function
 * @description 暂停或者继续播放
 * @return {String}
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 */
export function pauseOrContinue($this, simplePlayerData, index, callback) {
    const $player = simplePlayerData.$player($this, index);
    const {isPause} = simplePlayerData.getAction(index);
    simplePlayerData.setAction(index, ACTION.PAUSE_OR_CONTINUE, false);
    if ($player) {
        if (isPause) {
            $player.pause({bPause: false});
            simplePlayerData.setAction(index, ACTION.IS_PAUSE, false);
        } else {
            $player.pause({bPause: true});
            simplePlayerData.setAction(index, ACTION.IS_PAUSE, true);
        }
        callback && callback();
    }
}

/**
 * @function
 * @description 清空播放器窗格
 * @return {String}
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 */
export function clearWnd($this, simplePlayerData, index) {
    if (simplePlayerData.$player($this, index)) {
        simplePlayerData.$player($this, index).doClear({});
        simplePlayerData.setEmptyWnd(index, !!!simplePlayerData.getIndexCode(index));
    }
}

/**
 * @function
 * @description 清除某个播放器
 * @return {String}
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 */
export async function clearSomeonePlayer($this, simplePlayerData, index, error) {
    try {
        const playInfo = simplePlayerData.getPlayInfosByIndex(index);
        if (simplePlayerData.isPlayback(index)) {
            stopPlayback(index);
        } else if (simplePlayerData.isPreview(index)) {
            await stopPlay(index);
        }
        playInfo && (simplePlayerData.setWndStatus(index, PLAYER_STATUS_MAP.CLOSE, true));
        clearWnd(index);
    } catch (e) {
        error && error(e)
    }
}

/**
 * @function
 * @description 浓缩播放专用，回放2，录像片段和URL由外部传入
 * @return {String}
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 */
export async function startPlayback2($this, simplePlayerData, index, callback, error) {
    let res;
    const $player = simplePlayerData.$player($this, index);
    // 设置为回放中
    simplePlayerData.setStatus(index, PLAYER_MODE_MAP.PLAYBACK.value);
    if ($player === null || typeof $player === 'undefined') return;
    $player && $player.doClear({});
    try {
        // 获取浓缩播放参数
        let {list, url, streamDispatchMode, _expandParams} = simplePlayerData.getConcentrate(index);
        let strRecordResponse = {
            list,
            url,
            streamDispatchMode
        }; // 是否是浓缩播放的标志，有值则浓缩播放并使用该值，否则不用启用浓缩播放
        if (isNotEmpty(_expandParams)) strRecordResponse = Object.assign(strRecordResponse, {..._expandParams});
        res = await $player.startPlayBack({
            strRecordResponse,
            bShowDownload: simplePlayerData.getAction(index, ACTION.DOWNLOAD_AUTH)
        });
        callback && callback($this, simplePlayerData, index);
    } catch (e) {
        error && error(e);
    }
    return res;
}

/**
 * @function
 * @description 回放
 * @return {String}
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 */
export async function startPlayback($this, simplePlayerData, index, success, error) {
    let res;
    let range = [moment().add(-1, 'd'), moment()];
    simplePlayerData.$player($this, index) && simplePlayerData.$player($this, index).doClear({});
    // 设置为回放中
    simplePlayerData.setStatus(index, PLAYER_MODE_MAP.PLAYBACK.value);
    try {
        let {
            indexCode,
            recordStyle,
            transmode,
            streamType,
            startTime,
            endTime,
            netZoneCode,
            _expandParams
        } = simplePlayerData.getPlayInfosByIndex(index);
        // 主子码流设备存储才生效
        // 1:子码流,
        // 2:第三码流
        // 254: 双码流搜索(优先返回主码流录像，没有主码流录像时返回子码流录像)
        // 255:返回所有
        const _streamType = recordStyle == 1 ? 254 : streamType;
        const expand = isNotEmpty(_expandParams) ? _expandParams : {}; // 预留扩展
        const token = simplePlayerData.getTokens(index, POINT_AUTH_MAP.PLAYBACK); // 追加token
        res = await simplePlayerData.$player($this, index).startPlayBack({
            indexCode,
            token,
            strRecordParam: {
                ...expand,
                indexCode,
                recordStyle: recordStyle || 0, // 0 中心存储 1查询设备存储
                // 经常碰到因为录像片段不属于0 1 2 6 中的导致他查不到录像片段
                recordType: '', // '0|1|2|6' 录像类型 传空查询全部录像片段 0|1|2|6 0 定时录像 1 移动侦测 2 报警触发 6 手动录像
                transmode: isNotEmpty(transmode) ? transmode : 1, // 0 UDP 1 TCP
                streamType: _streamType || 0, // 0 主码流 1 子码流
                startTime: startTime || moment(range[0]).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
                endTime: endTime || moment(range[1]).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
                netZoneCode,
                userId: simplePlayerData.getUserId()
            },
            bShowDownload: simplePlayerData.getAction(index, ACTION.DOWNLOAD_AUTH)
        });
        success && success(res);
    } catch (e) {
        error && error(e);
    }
}

/**
 * @function
 * @description 切换录像读取方式，中心存储还是设备存储
 * @author lixiaodong31 2023/10/16
 * @version 1.0.0
 * @example
 */
export async function startPlaybackAgain($this, simplePlayerData, index, success, error) {
    let {recordStyle, indexCode} = simplePlayerData.getPlayInfosByIndex(index);
    let r = Number(recordStyle) === 0 ? 1 : 0;
    simplePlayerData.setPlayInfos(index, 'recordStyle', r);
    simplePlayerData.setCachePlayInfosByIndexCode(indexCode, 'recordStyle', r);
    simplePlayerData.setIsPlaybackAgain(index, true);
    startPlayback($this, simplePlayerData, index, success, error);
}


/**
 * @function
 * @description 截图
 * @param $this - 播放器作用域
 * @param simplePlayerData - 播放器对象
 * @param index - 索引
 * @param error - 错误回调
 * @return {String}
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 */
export async function endShot($this, simplePlayerData, index, error) {
    try {
        let res;
        simplePlayerData.setAction(index, ACTION.SNAP, false);
        const {title} = simplePlayerData.getPlayInfosByIndex(index);
        res = await simplePlayerData.$player($this, index).snapShot({strCameraName: title});
        return res;
    } catch (e) {
        error && error();
        return null;
    }
}

/**
 * @function
 * @description 连续抓拍
 * @param $this - 播放器作用域
 * @param simplePlayerData - 播放器对象
 * @param index - 索引
 * @param error - 错误回调
 * @return {String}
 * @author lixiaodong31 2024/4/19
 * @version 1.0.0
 * @example
 */
export async function snapShotMulti($this, simplePlayerData, index, error) {
    try {
        // 参数iSnapMode必须传，1为按时间间隔连续抓拍 2为按帧连续抓拍；
        // 参数iSnapTime、iSnapCounter、strSavePath可传可不传，不传时使用4.1配置的默认截图保存路径，传了时优先使用传值；
        let res;
        simplePlayerData.setAction(index, ACTION.SNAP_MORE, false);
        const {title, iSnapMode, iSnapTime, iSnapCounter, strSavePath} = simplePlayerData.getPlayInfosByIndex(index);
        let param = {strCameraName: title};
        param = Object.assign(param, {iSnapMode: isNotEmpty(iSnapMode) ? iSnapMode : 1});
        if (isNotEmpty(iSnapTime)) param = Object.assign(param, {iSnapTime});
        if (isNotEmpty(iSnapCounter)) param = Object.assign(param, {iSnapCounter});
        if (isNotEmpty(strSavePath)) param = Object.assign(param, {strSavePath});
        res = await simplePlayerData.$player($this, index).snapShot(param);
        return res;
    } catch (e) {
        error && error();
        return null;
    }
}

/**
 * @function
 * @description
 * @param {Object} $this - 播放器作用域
 * @param {Object} simplePlayerData - 播放器对象
 * @param {Number} index - 索引
 * @param {Object} params - 快进参数
 * iPlayBackSpeed:
 * -6,   -5,   -4,   -3,  -2,  -1, 0, 1, 2, 3, 4  对应
 * 1/64, 1/32, 1/16,  1/8, 1/4, 1/2, 1, 2, 4, 8, 16 倍速
 * @author lixiaodong31 2023/10/16
 * @version 1.0.0
 * @example
 */
export function playBySpeed($this, simplePlayerData, index, params) {
    const {iPlayBackSpeed, bShowSpeedPlayWnd} = params;
    simplePlayerData.$player($this, index).speedPlay({
        iPlayBackSpeed,
        bShowSpeedPlayWnd
    })
}

/**
 * @function
 * @description 跳帧
 * @author lixiaodong31 2023/12/14
 * @version 1.0.0
 * @example
 */
export function seekTime($this, simplePlayerData, index, params) {
    return simplePlayerData.$player($this, index).seekTime(params)
}

/**
 * @function
 * @description 控制声音
 * @param {Object} $this - 播放器作用域
 * @param {Object} simplePlayerData - 播放器对象
 * @param {Number} index - 索引
 * @return {String}
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 */
export function controlSound($this, simplePlayerData, index) {
    const player = simplePlayerData.$player($this, index);
    const sound = simplePlayerData.getAction(index, ACTION.SOUND);
    return player.sound({bOpen: sound});
}

/**
 * @function
 * @description 3D操作
 * @return {String}
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 */
export function control3dZoom($this, simplePlayerData, index) {
    const player = simplePlayerData.$player($this, index);
    const tdZoom = simplePlayerData.getAction(index, ACTION.TD_ZOOM);
    const {url, cascadeCode, iSpeed, strUserPriority, indexCode} = simplePlayerData.getPlayInfosByIndex(index);
    const cascade = simplePlayerData.getLegalCascadeCode(cascadeCode);
    let tdZoomParams = {
        bStart: tdZoom, // true开始 false结束
        iCascade: cascade, // 是否级联 0 本级 1 非本机，级联
        iSpeed: 50, // 速度默认50
        strUserPriority: 10, // 用户操作优先级
        strUserId: simplePlayerData.getUserId()
    };
    if (isNotEmpty(strUserPriority)) tdZoomParams = {...tdZoomParams, strUserPriority};
    if (isNotEmpty(iSpeed)) tdZoomParams = {...tdZoomParams, iSpeed};
    // 如果预览采用的是外部传取流url方式预览，需要传入strIndexcode监控点编号字段，否则因为不知道当前监控点编号无法正常调用3D放大功能
    if (isNotEmpty(url)) tdZoomParams = {...tdZoomParams, strIndexcode: indexCode};
    player.ptz3DZoom(tdZoomParams);
}

/**
 * @function
 * @description 预览记录
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 */
export function controlPreviewRecord($this, simplePlayerData, index) {
    const player = simplePlayerData.$player($this, index);
    const previewRecord = simplePlayerData.getAction(index, ACTION.PREVIEW_RECORD);
    const title = simplePlayerData.getTitle(index);
    const {strRecordPath} = simplePlayerData.getPlayInfosByIndex(index);
    let recordParams = {
        strCameraName: title || 'unnamed-preview-record-video',
        iSaveMode: 0, // 0 是正常切片模式， 1 是设置最大值关闭
        bOpen: previewRecord // true开始，false结束
    };
    if (isNotEmpty(strRecordPath)) recordParams = {...recordParams, strRecordPath};
    player.realRecord(recordParams);
    infoLog('[提示] 请使用海康的播放器预览紧急视频，不是所有播放器都可以预览的');
}


/**
 * @function
 * @description 回放记录
 * @return
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 */
export function controlPlaybackRecord($this, simplePlayerData, index) {
    const player = simplePlayerData.$player($this, index);
    const {isPause, playbackRecord} = simplePlayerData.getAction(index);
    const {title} = simplePlayerData.getPlayInfosByIndex(index);
    if (isPause) return;
    if (player) {
        player.realRecord({
            strCameraName: title || 'unnamed-playback-record-video',
            iSaveMode: 0,
            bOpen: playbackRecord
        });
    }
}

/**
 * @function
 * @description 对讲
 * @return {String}
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 */
export function deviceTalk($this, simplePlayerData, index) {
    const player = simplePlayerData.$player($this, index);
    const talk = simplePlayerData.getAction(index, ACTION.TALK);
    const {cascadeCode, indexCode, strTalkIndexCode, strTreatType} = simplePlayerData.getPlayInfosByIndex(index);
    const cascade = simplePlayerData.getLegalCascadeCode(cascadeCode);
    const token = simplePlayerData.getTokens(index, POINT_AUTH_MAP.TALK); // 追加token
    let talkParams = {
        token,
        bStart: talk,
        iCascade: cascade // 默认本级
    };
    // 方式1 传递监控点编号进行对讲
    if (isNotEmpty(indexCode)) talkParams = {...talkParams, strIndexcode: indexCode};
    // 方式2 无监控点编号，直接传递对讲编号
    else if (isNotEmpty(indexCode)) talkParams = {...talkParams, strTalkIndexCode, strTreatType};
    infoLog('[注意] 对讲功能有两种方式，依赖数据中字段，方式1 传递监控点编号进行对讲，字段indexCode； 方式2 无监控点编号，直接传递对讲编号字段strTalkIndexCode,strTreatType 两者互斥');
    return player.deviceTalk(talkParams);
}

/**
 * @function
 * @description 云台控制
 * @return
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 */
export function ptzControl($this, simplePlayerData, index) {
    const player = simplePlayerData.$player($this, index);
    const ptz = simplePlayerData.getAction(index, ACTION.PTZ);
    const {cascadeCode, url, strUserPriority, indexCode} = simplePlayerData.getPlayInfosByIndex(index);
    const cascade = simplePlayerData.getLegalCascadeCode(cascadeCode);
    const token = simplePlayerData.getTokens(index, POINT_AUTH_MAP.PTZ_CONTROL); // 追加token
    let ptzParams = {
        token,
        bControl: ptz, //true打开，false关闭
        nCascade: cascade, // 是否是级联，0本级，其他，级联
        strUserPriority: isNotEmpty(strUserPriority) ? strUserPriority : '10', // 不同用户操作优先级
        strUserId: simplePlayerData.getUserId() // 'admin' 用户名称或编号
    }
    // 如果预览采用的是外部传取流url方式预览，需要传入strIndexcode监控点编号字段，否则因为不知道当前监控点编号无法正常调用3D放大功能
    if (isNotEmpty(url)) ptzParams = {...ptzParams, strIndexcode: indexCode};
    return player.controlPTZ(ptzParams);
}

/**
 * @function
 * @description 电子放大
 * @return {String}
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 */
export function digitalZoom($this, simplePlayerData, index) {
    const player = simplePlayerData.$player($this, index);
    const digitalZoom = simplePlayerData.getAction(index, ACTION.DIGITAL_ZOOM);
    player.digitalZoom({
        bStart: digitalZoom
    });
}

/**
 * @function
 * @description 通过能力集设置播放器顶部工具栏权限（权限判断一）
 * @return {String}
 * @author lixiaodong31 2023/9/21
 * @version 1.0.0
 * @example
 */
export function updateLockByAbility($this, simplePlayerData, index, ability = []) {
    simplePlayerData.setAction(index, ACTION.PTZ_ABILITY, ability.includes(ABILITY.PTZ) || ability.includes(ABILITY.PTZCONTROL));
    simplePlayerData.setAction(index, ACTION.PLAY_SNAP_ABILITY, ability.includes(ABILITY.PREVIEWCANDIDSHOT));
    simplePlayerData.setAction(index, ACTION.DOWNLOAD_ABILITY, ability.includes(ABILITY.RECORDDOWNLOAD));
    simplePlayerData.setAction(index, ACTION.PLAYBACK_SNAP_ABILITY, ability.includes(ABILITY.PLAYBACKCANDIDSHOT));
    simplePlayerData.setAction(index, ACTION.AUDIO_RECV_ABILITY, ability.includes(ABILITY.AUDIORECV));
    simplePlayerData.setAction(index, ACTION.PREVIEW_RECORD_ABILITY, ability.includes(ABILITY.PREVIEWRECORD));
    simplePlayerData.setAction(index, ACTION.PLAYBACK_RECORD_ABILITY, ability.includes(ABILITY.PLAYBACKRECORD));
    simplePlayerData.setAction(index, ACTION.TALK_ABILITY, ability.includes(ABILITY.TALK));
}

/**
 * @function
 * @description 通过权限设置播放器顶部工具栏权限（权限判断二）
 * @return {String}
 * @author lixiaodong31 2023/9/21
 * @version 1.0.0
 * @example
 */
export function updateLockByAuth($this, simplePlayerData, index, auth = []) {
    const {cameraType} = simplePlayerData.getPlayInfosByIndex(index) || {};
    // 云台按钮是否展示根据cameraType 和 云台权限来判断，按钮是否disabled根据能力集（非级联根据云台能力集判断）、 级联（级联直接放开按钮）
    // 后续和相关研发讨论，取消掉能力集的判断，能力集废弃
    simplePlayerData.setAction(index, ACTION.PTZ_AUTH, (['1', '2', '3', 1, 2, 3].includes(String(cameraType))));
    simplePlayerData.setAction(index, ACTION.PLAY_SNAP_AUTH, auth.includes(ABILITY.PREVIEWCANDIDSHOT));
    simplePlayerData.setAction(index, ACTION.DOWNLOAD_AUTH, auth.includes(ABILITY.RECORDDOWNLOAD));
    simplePlayerData.setAction(index, ACTION.PLAYBACK_SNAP_AUTH, auth.includes(ABILITY.PLAYBACKCANDIDSHOT));
    simplePlayerData.setAction(index, ACTION.AUDIO_RECV_AUTH, auth.includes(ABILITY.AUDIORECV));
    simplePlayerData.setAction(index, ACTION.PREVIEW_RECORD_AUTH, auth.includes(ABILITY.PREVIEWRECORD));
    simplePlayerData.setAction(index, ACTION.PLAYBACK_RECORD_AUTH, auth.includes(ABILITY.PLAYBACKRECORD));
    simplePlayerData.setAction(index, ACTION.TALK_AUTH, auth.includes(ABILITY.TALK));
}

/**
 * @function
 * @description 重播
 * @return {String}
 * @author lixiaodong31 2023/9/21
 * @version 1.0.0
 * @example
 */
export function rePlay($this, simplePlayerData, index, callback) {
    const {status} = simplePlayerData.getPlayInfosByIndex(index);
    if (status === PLAYER_MODE_MAP.PREVIEW.value) {
        startPlay($this, simplePlayerData, index);
    } else if (status === PLAYER_MODE_MAP.PLAYBACK.value) {
        startPlayback($this, simplePlayerData, index);
    }
    callback && callback();
}

/**
 * @function
 * @description 下载视频
 * @return {String}
 * @author lixiaodong31 2023/9/21
 * @version 1.0.0
 * @example
 */
export function downloadVideo($this, simplePlayerData, index, bSelect = false) {
    const player = simplePlayerData.$player($this, index);
    const {title, indexCode} = simplePlayerData.getPlayInfosByIndex(index);
    player.downloadSelect({
        strCamName: title,
        indexCode,
        strIndexcode: indexCode
    });
    player.timeSelect({
        bSelect // true选择 false去除选择状态
    });
}

/**
 * 选择文件夹
 * @param $this 作用域，包含播放器的作用域
 * @param simplePlayerData simplePlayerData类
 * @param index 下标，默认不传
 * @param params 打开文件夹参数 { strDefaultDir }
 * @author lixiaodong31 2024/8/23
 */
export function selectExistingDir($this, simplePlayerData, index = 0, params) {
    const player = simplePlayerData.$player($this, index);
    player.selectExistingDir(params);
}
