import {CONFIG, MODE, THEME} from "./../lib/params.lib";
import {getSimplePlayerData} from "./../lib";
import {isNotEmpty} from "./../util";
import {infoLog, setDebugMode, warnLog} from "./../util/logger";

// 配置项key和methods中方法名 映射关系
const CONFIG_METHOD_MAP = {
    theme: 'setTheme',
    mode: 'setMode',
    debug: 'setDebug',
    showMoreScreens: 'setShowMoreScreens',
    showTitle: 'setShowTitle',
    showToolBar: 'setShowToolBar',
    showHeader: 'setShowHeader',
    showSetting: 'setShowSetting',
    showSequence: 'setShowSequence',
    showAlgorithmAnalysis: 'setShowAlgorithmAnalysis',
    showLabelTag: 'setShowLabelTag',
    showEventReport: 'setShowEventReport',
    showPictureTag: 'setShowPictureTag',
    showAiRecommend: 'setShowAiRecommend',
    openPtzWidthMini: 'setOpenPtzWidthMini',
    hasApplyAuth: 'setHasApplyAuth',
    strictAuthMode: 'setStrictAuthMode',
    maxScreen: 'setMaxScreen',
    videoTryTime: 'setVideoTryTime',
    readStreamWay: 'setReadStreamWay',
    checkTool: 'setCheckTool',
    capabilitySetKey: 'setCapabilitySetKey',
    globalTopHeader: 'setGlobalTopHeader',
    globalToolBar: 'setGlobalToolBar',
    queryH5PreviewParamKeys: 'setQueryH5PreviewParamKeys',
    queryH5PlaybackParamKeys: 'setQueryH5PlaybackParamKeys',
}

/**
 * @function
 * @description 播放器配置项。配置项是外部调用传参，内部对接设置播放器核心数据。避免外部不必要的调用和设置，简化外部调用
 * @author lixiaodong31 2023/9/28
 * @version 1.0.0
 * @example
 */
export const ConfigMixin = {
    props: {
        config: {
            type: Object,
            required: false,
            default() {
                return Object.assign({}, CONFIG);
            }
        }
    },
    watch: {
        config: {
            deep: true,
            handler(newConfig, oldConfig) {
                infoLog('Start setting config ... ', newConfig, oldConfig);
                if (typeof oldConfig !== 'undefined') {
                    // 使用深度比较函数检查属性值是否有变化，并获取发生变化的项
                    let diffKeys = this.deepCompare(oldConfig, newConfig);
                    (diffKeys.length > 0) && this.distributeAfterConfig(oldConfig, newConfig, diffKeys);
                } else {
                    warnLog('check some one config has changed, do updating config now ', oldConfig);
                    isNotEmpty(newConfig) && Object.keys(newConfig).length > 0 && this.distributeAfterConfig(newConfig, Object.keys(newConfig));
                }
            },
            immediate: true // 初始化不做处理
        }
    },
    methods: {
        // 刷新配置项
        fleshConfig() {
            this.distributeAfterConfig(this.config, Object.keys(this.config));
        },
        // config变化后，分发处理
        distributeAfterConfig(oldConfig, newConfigOrDiffKeys, diffKeys) {
            const K = Object.keys(CONFIG_METHOD_MAP);
            if (typeof diffKeys === 'undefined') {
                newConfigOrDiffKeys && newConfigOrDiffKeys.forEach((k) => {
                    if (K.includes(k)) this[CONFIG_METHOD_MAP[k]](oldConfig[k], oldConfig);
                    else warnLog(
                        'this is not error, only warn you to use simple-player-mix rightly!',
                        'no key in CONFIG_METHOD_MAP map, error key is', k,
                        ', your config Props keys must belong to: ', K.join(',')
                    );
                })
            } else {
                diffKeys && diffKeys.forEach((k) => {
                    if (K.includes(k)) this[CONFIG_METHOD_MAP[k]](newConfigOrDiffKeys[k], newConfigOrDiffKeys);
                    else warnLog(
                        'this is not error, only warn you to use simple-player-mix rightly!',
                        'no key in CONFIG_METHOD_MAP map, error key is', k,
                        ', your config Props keys must belong to: ', K.join(',')
                    );
                })
            }
        },
        setTheme(value) {
            if (Object.values(THEME).includes(value)) {
                getSimplePlayerData().setTheme(value);
            } else {
                warnLog(`[setTheme fail] received config value is`, value, `[only support THEME like this: ]`, THEME);
            }
        },
        setDebug(value = true) {
            setDebugMode(value);
        },
        setShowMoreScreens(value = true) {
            getSimplePlayerData().setShowMoreScreens(value);
        },
        setShowTitle(value = true) {
            getSimplePlayerData().setShowTitle(value);
        },
        setShowToolBar(value = true) {
            getSimplePlayerData().setShowToolBar(value);
        },
        setShowSetting(value = true) {
            getSimplePlayerData().setShowSetting(value);
        },
        setShowHeader(value = true) {
            getSimplePlayerData().setShowHeader(value);
        },
        setShowSequence(value = true) {
            getSimplePlayerData().setShowSequence(value);
        },
        setShowAlgorithmAnalysis(value = true) {
            getSimplePlayerData().setShowAlgorithmAnalysis(value);
        },
        setShowLabelTag(value = true) {
            getSimplePlayerData().setShowLabelTag(value);
        },
        setShowEventReport(value = true) {
            getSimplePlayerData().setShowEventReport(value);
        },
        setShowPictureTag(value = true) {
            getSimplePlayerData().setShowPictureTag(value);
        },
        setShowAiRecommend(value = true) {
            getSimplePlayerData().setShowAiRecommend(value);
        },
        setOpenPtzWidthMini(value = true) {
            getSimplePlayerData().setOpenPtzWidthMini(value);
        },
        setVideoTryTime(value) {
            getSimplePlayerData().setVideoTryTime(value);
        },
        setReadStreamWay(value) {
            getSimplePlayerData().setReadStreamWay(value);
        },
        setCheckTool(value) {
            getSimplePlayerData().setCheckTool(value);
        },
        setCapabilitySetKey(value) {
            getSimplePlayerData().setCapabilitySetKey(value);
        },
        setStrictAuthMode(value = true) {
            getSimplePlayerData().setStrictAuthMode(value);
        },
        setHasApplyAuth(value = true) {
            getSimplePlayerData().setHasApplyAuth(value);
        },
        setMaxScreen(value) {
            const spd = getSimplePlayerData();
            spd.setMaxScreen(value); // 必须先设置最大分屏数
            spd.initScreenMap(); // 需要再次初始化分屏数据
            const screen = spd.getScreenMap();
            const partScreen = screen.filter(c => c.screenNum <= value);
            const screenNumArr = screen.map(c => c.screenNum);
            if (screenNumArr.includes(value)) {
                spd.setScreenMap(partScreen);
            } else {
                warnLog([`[setMaxScreen fail] receive value is ${value}，[only support like this: ]`, screenNumArr]);
            }
        },
        setQueryH5PreviewParamKeys(value) {
            if (isNotEmpty(value) && Array.isArray(value)) {
                getSimplePlayerData().setQueryH5PreviewParamKeys(value);
            } else {
                warnLog('queryH5PreviewParamKeys param is error type, must is Array');
            }
        },
        setQueryH5PlaybackParamKeys(value) {
            if (isNotEmpty(value) && Array.isArray(value)) {
                getSimplePlayerData().setQueryH5PlaybackParamKeys(value);
            } else {
                warnLog('queryH5PlaybackParamKeys param is error type, must is Array');
            }
        },
        setMode(value) {
            if (Object.values(MODE).includes(value)) {
                getSimplePlayerData().setMode(value);
            } else {
                warnLog([`[setMode fail] received value is ${value}，[only support MODE like this: ]`, MODE]);
            }
        },
        setGlobalTopHeader(value, obj) {

        },
        setGlobalToolBar(value, obj) {

        },
        deepCompare(oldConfig, newConfig) {
            let diffKeys = [];

            for (let key in oldConfig) {
                if (oldConfig.hasOwnProperty(key) && newConfig.hasOwnProperty(key)) {
                    let oldVal = oldConfig[key];
                    let newVal = newConfig[key];

                    // 如果新旧值都是对象，进行递归比较
                    if (typeof oldVal === 'object' && typeof newVal === 'object') {
                        let deepDiffKeys = this.deepCompare(oldVal, newVal);
                        if (deepDiffKeys.length > 0) {
                            diffKeys.push({[key]: deepDiffKeys});
                        }
                    } else if (oldVal !== newVal) { // 如果新旧值不相同，则将该属性加入diffKeys数组
                        diffKeys.push(key);
                    }
                } else if (!newConfig.hasOwnProperty(key)) { // 如果新配置中不存在该属性，则将该属性加入diffKeys数组
                    diffKeys.push(key);
                }
            }
            return diffKeys;
        }
    }
}
