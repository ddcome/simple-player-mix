// 封装H5Player接口
// h5player封装了预览，回放，暂停恢复，快放慢放，抓图，录像，声音控制，电子放大，智能信息展示以及单帧进等接口

import {getH5Protocol, isNotEmpty, objectPick, parseUTC} from "./../util";
import {errorLog, infoLog} from "./../util/logger";
import moment from "moment";
import {PLAYER_MODE_MAP, VIDEO_STORAGE} from "./../lib/params.lib";

/**
 * @function
 * @description 是否可以打断
 * @author lixiaodong31 2023/10/19
 * @version 1.0.0
 * @example
 */
function canBreak($player) {
    if (isNotEmpty($player)) {
        return false;
    } else {
        errorLog('[play fail][$player]', $player);
        return true;
    }
}

export function play($this, simplePlayerData, index) {
    const params = simplePlayerData.getH5Params(index);
    const url = simplePlayerData.getH5Params(index, 'url');
    const $player = simplePlayerData.$player($this, index);
    simplePlayerData.setStatus(index, PLAYER_MODE_MAP.PREVIEW.value);
    if (canBreak($player)) return;

    // const URL_POSTFIX = `?streamform=${'rtp'}`
    const szURL = url
    const playURL = `${url}`
    // const playURL = `${url}${URL_POSTFIX}`
    let _params = {};

    // 处理https（wss协议）下的特殊参数
    if (getH5Protocol() === 'wss') {
        const hasProxy = /\/proxy\/(\d+.\d+.\d+.\d+:\d+)\//.test(url)
        if (hasProxy) {
            _params.proxy = RegExp.$1
            _params.mode = 'media'
        } else {
            errorLog(`${url} has no proxy!`);
        }
    }

    // 处理基础参数
    _params = Object.assign(_params, objectPick(params, ['auth', 'token', 'proxy', 'mode', 'playURL']));
    // Object.assign(_params, objectPick(params, ['auth', 'token', 'mode', 'playURL']))
    !_params.playURL && (_params.playURL = playURL);
    return $player.play(szURL, _params);
}

export function playbackAgain($this, simplePlayerData, index) {
    const mode = simplePlayerData.getH5Params(index, 'mode');
    // 自动切换一次存储位置
    simplePlayerData.setH5Params(index, 'mode', mode === VIDEO_STORAGE.ZHOGNXIN ? VIDEO_STORAGE.SHEBEI : VIDEO_STORAGE.ZHOGNXIN);
    simplePlayerData.setIsPlaybackAgain(index, true);
    infoLog('set playback again close');
    return playback($this, simplePlayerData, index);
}

export function playback($this, simplePlayerData, index) {
    const params = simplePlayerData.getH5Params(index);
    const url = simplePlayerData.getH5Params(index, 'playbackUrl');
    const $player = simplePlayerData.$player($this, index);
    simplePlayerData.setStatus(index, PLAYER_MODE_MAP.PLAYBACK.value);
    if (canBreak($player)) return;

    // const URL_POSTFIX = `?streamform=${'rtp'}`
    const szURL = url
    const playURL = `${url}`
    // const playURL = `${url}${URL_POSTFIX}`
    const _params = {};
    let range = [moment().add(-1, 'd'), moment()];

    // 处理https（wss协议）下的特殊参数
    if (getH5Protocol() === 'wss') {
        const hasProxy = /\/proxy\/(\d+.\d+.\d+.\d+:\d+)\//.test(url)
        if (hasProxy) {
            _params.proxy = RegExp.$1
            _params.mode = 'media'
        } else {
            errorLog(`${url} has no proxy!`);
        }
    }

    // 处理基础参数
    Object.assign(_params, objectPick(params, ['auth', 'token', 'proxy', 'mode', 'playURL']));
    !_params.playURL && (_params.playURL = playURL);

    let startTime;
    let endTime;
    if (!!params.startTime && !!params.endTime) {
        startTime = params.startTime;
        endTime = params.endTime;
    } else {
        startTime = moment(range[0]).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
        endTime = moment(range[1]).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    }
    return $player.playback(szURL, _params, startTime, endTime, 0);
}

// 改变回放时间
export function changePlaybackTime($this, simplePlayerData, index, dateRange) {
    const beginTime = parseUTC(dateRange[0]);
    const endTime = parseUTC(dateRange[1]);

    const params = simplePlayerData.getH5Params(index);
    const url = simplePlayerData.getH5Params(index, 'playbackUrl');
    const $player = simplePlayerData.$player($this, index);
    if (canBreak($player)) return;

    const szURL = url
    const playURL = `${url}`
    const _params = {};

    // 处理https（wss协议）下的特殊参数
    if (getH5Protocol() === 'wss') {
        const hasProxy = /\/proxy\/(\d+.\d+.\d+.\d+:\d+)\//.test(url)
        if (hasProxy) {
            _params.proxy = RegExp.$1
            _params.mode = 'media'
        } else {
            errorLog(`${url} 未携带proxy`);
        }
    }

    // 处理基础参数
    Object.assign(_params, objectPick(params, ['auth', 'token', 'proxy', 'mode', 'playURL']));
    !_params.playURL && (_params.playURL = playURL);
    return $player.playback(szURL, _params, beginTime, endTime, 0);
}

export function clearPlayers($this, simplePlayerData, needInit = true) {
    const currentScreen = simplePlayerData.getCurrentScreen();
    simplePlayerData.$player($this, undefined).forEach((c) => {
        c && c.stopRealPlayAll();
    });
    // 初始化播放器对象
    if (needInit) {
        simplePlayerData.init();
        simplePlayerData.setCurrentScreen(currentScreen);
    }
}

export function resize($this, simplePlayerData, params) {
    const $player = simplePlayerData.$player($this, index);
    if (canBreak($player)) return;
    const {width, height} = params;
    return $player.resize(width, height);
}

export function selectWnd($this, simplePlayerData, index) {
    const $player = simplePlayerData.$player($this, index);
    if (canBreak($player)) return;
    return $player.selectWnd(0);
}

export function capture($this, simplePlayerData, index, name = new Date().getTime(), fileType = 'JPEG', callback) {
    const $player = simplePlayerData.$player($this, index);
    if (canBreak($player)) return;
    return $player.capturePicture(0, name, fileType, callback);
}

export function openSound($this, simplePlayerData, index) {
    const $player = simplePlayerData.$player($this, index);
    if (canBreak($player)) return;
    return $player.openSound(0);
}

export function enableZoom($this, simplePlayerData, index) {
    const $player = simplePlayerData.$player($this, index);
    if (canBreak($player)) return;
    $player.enableZoom(0);
}

export function disableZoom($this, simplePlayerData, index) {
    const $player = simplePlayerData.$player($this, index);
    if (canBreak($player)) return;
    $player.disableZoom(0);
}

export function startSave($this, simplePlayerData, index) {
    const $player = simplePlayerData.$player($this, index);
    if (canBreak($player)) return;
    $player.startSave(simplePlayerData.getTitle(index), 0);
}

export function stopSave($this, simplePlayerData, index) {
    const $player = simplePlayerData.$player($this, index);
    if (canBreak($player)) return;
    $player.stopSave(0);
}

export function startTalk($this, simplePlayerData, index) {
    const $player = simplePlayerData.$player($this, index);
    if (canBreak($player)) return;
    $player.startTalk(0);
}

export function stopTalk($this, simplePlayerData, index) {
    const $player = simplePlayerData.$player($this, index);
    if (canBreak($player)) return;
    $player.stopTalk();
}

export function stopPlayers($this, simplePlayerData, needInit = true) {
    simplePlayerData.$player($this, undefined).forEach((c) => {
        c && c.stop(0);
    });
    // 初始化播放器对象
    needInit && simplePlayerData.init();
}

export function stopPlayer($this, simplePlayerData, index) {
    const $player = simplePlayerData.$player($this, index);
    if (canBreak($player)) return;
    return $player.stop(0);
}

export function resume($this, simplePlayerData, index) {
    const $player = simplePlayerData.$player($this, index);
    if (canBreak($player)) return;
    return $player.resume(0);
}

export function pause($this, simplePlayerData, index) {
    const $player = simplePlayerData.$player($this, index);
    if (canBreak($player)) return;
    return $player.pause(0);
}

export function frameForward($this, simplePlayerData, index) {
    const $player = simplePlayerData.$player($this, index);
    if (canBreak($player)) return;
    return $player.frameForward(0);
}

export function frameBack($this, simplePlayerData, index) {
    const $player = simplePlayerData.$player($this, index);
    if (canBreak($player)) return;
    return $player.frameBack(0);
}

export function fast($this, simplePlayerData, index) {
    const $player = simplePlayerData.$player($this, index);
    if (canBreak($player)) return;
    return $player.fast(0);
}

export function slow($this, simplePlayerData, index) {
    const $player = simplePlayerData.$player($this, index);
    if (canBreak($player)) return;
    return $player.slow(0);
}
