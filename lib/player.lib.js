import {
    BASE_PARAMS,
    CAMERA_TYPE,
    CASCADE_TYPE,
    GLOBAL_PARAMS,
    PLAYER_MODE_MAP,
    PLAYER_EXTRA_PARAMS,
    PLAYER_STATUS_MAP,
    H5_PARAMS,
    PLAYER_TYPE,
    ACTION,
    LOOP_TIME_OPTIONS,
    CONST_KEYS_OF_GLOBAL_PARAMS,
    LOOP_TIME_CONSTANT, POINT_AUTH_MAP
} from "./params.lib";

import {assignObj, deepClone, isInteger, isNotEmpty, isObject} from './../util';
import {errorLog, infoLog, logger, warnLog} from "./../util/logger";
import {SCREENS} from "./../lib/screens.lib";

/**
 * 播放器类
 * 维护阶段注意事项：
 * 1、不可改变任意的方法内部逻辑
 * 2、当且仅当params.lib.js中的数据有所增加后，方可增加新方法
 * @author lixiaodong31 2023/8/14
 * @version 1.0.0
 */
export class SimplePlayerData {

    /**
     * 构造器。负责初始化调用init。
     * @author lixiaodong31 2024/3/15
     * @version 1.0.0
     */
    constructor() {
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.initGlobalParams();
        this.initScreenMap();
        this.playInfos = [];
        this.initPlayInfos();
        infoLog('================================[- ^ ^ -]================================');
        infoLog('[simple-player-mix data obj is loaded]', this);
        this.update();
        // 调试预留
        window['simple_player_mix_debugger'] = this;
        infoLog('if you want to use debugger mode, please use window object named "simple_player_mix_debugger"');
        infoLog('================================[- ^ ^ -]================================');
    }

    /**
     * 更新函数（废弃，内部使用）
     */
    update() {
    }

    /**
     * 初始化播放器全局变量到类中
     */
    initGlobalParams() {
        const _copy = deepClone(GLOBAL_PARAMS);
        Object.keys(_copy).forEach((k) => {
            // 初始化时，只能初始化指定的数据，其他数据因为有配置存在，所以不能随便初始化
            if (CONST_KEYS_OF_GLOBAL_PARAMS.includes(k) && isNotEmpty(this[k])) {
                infoLog('[initGlobalParams] can not init this param, Params of can not init is ', CONST_KEYS_OF_GLOBAL_PARAMS);
                this[k] = _copy[k];
            } else if (!this.hasOwnProperty(k)) {
                this[k] = _copy[k];
            }
        });
    }

    // 初始化分屏数据
    initScreenMap() {
        const temp = deepClone(SCREENS);
        const flag = this.getShowMoreScreens();
        const max = this.getMaxScreen();
        const screens = flag ? temp : temp.filter(c => c.baseScreen);
        this.setScreenMap(screens.filter(c => c.screenNum <= max));
    }

    /**
     * 初始化，合并预置所有播放器相关对象
     */
    initPlayInfos() {
        try {
            // 初始化长度为最大分屏数的数组，提前准备所有对象
            const playInfos = Array.from({length: this.getMaxScreen()}, (_, i) => ({
                ...BASE_PARAMS,
                [this.h5ParamsKey]: H5_PARAMS, // 兼容H5参数
                [this.extraKey]: {
                    ...PLAYER_EXTRA_PARAMS,
                    index: i, // i和外部的HTML中遍历index in 9保持一致
                    ref: `${this.getRefPre()}${i}`
                }
            }));
            this.setPlayInfos(deepClone(playInfos));
        } catch (e) {
            warnLog('[initPlayInfos]', e);
        }
    }

    /**
     * 播放器对象Ref
     * 播放器对象中不存储CC或者H5播放器 ref对象，原因是存在调用链位置问题，所以不存储实际对象，都是调用时直接使用。
     * 所以限制是，必须是CC或者H5播放器作用域中调用。
     * @param {Object} $this - 必须是包含播放器CC或者H5作用域的（重点！重点！）,本方法会通过$this.$refs调用播放器
     * @param {Number} index - 播放器下标
     * @return {Object} this.refs播放器对象
     */
    $player($this, index) {
        try {
            if (typeof index === 'undefined') {
                return this.playInfos.map((c) => {
                    const index = c[this.extraKey].index;
                    const temp = $this.$refs[this.$getPlayerRef(index)];
                    if (Array.isArray(temp)) return temp && temp[0];
                    else return temp;
                })
            }
            const ref = $this.$refs[this.$getPlayerRef(index)];
            if (Array.isArray(ref)) return ref && ref[0];
            else return ref;
        } catch (e) {
            warnLog('[$player()][$getPlayerRef fail][$this,this,e]', $this, this, e);
            return null;
        }
    }

    /**
     * 获取对象的拷贝(供外部使用)
     * @return {Object} playInfo对象，无则返回null
     */
    getPlayInfoCopy() {
        try {
            return deepClone(this.getPlayInfos());
        } catch (e) {
            return null;
        }
    }

    /**
     * 获取配置项
     * @param {String} key - 配置项键
     * @return {Object} 当前配置项
     */
    getCommonConfig(key) {
        if (typeof key === 'undefined') {
            return this.commonConfig;
        } else {
            return this.commonConfig[key];
        }
    }

    /**
     * 设置配置项
     * @param {String|Object} keyOrValue - 键
     * @param {String|Object} value - 值
     */
    setCommonConfig(keyOrValue, value) {
        if (typeof value === 'undefined' && typeof keyOrValue !== 'string') {
            this.commonConfig = keyOrValue;
        } else {
            this.commonConfig[keyOrValue] = value;
        }
    }

    /**
     * 是H5播放器吗？
     * @return {Boolean} 是否是H5播放器的布尔值，true为是H5
     */
    isH5Player() {
        return this.getPlayerType() === PLAYER_TYPE.H5_PLAYER;
    }

    /**
     * 是极简播放器吗
     * @return {Boolean} 是否是极简播放器的布尔值，true为是极简
     */
    isClientContainer() {
        return this.getPlayerType() === PLAYER_TYPE.CLIENT_CONTAINER;
    }

    /**
     * 获取播放器类型
     * @return {String} 返回播放器类型字符串。h5_player和client_container，见常量PLAYER_TYPE
     */
    getPlayerType() {
        return this.playerType;
    }

    /**
     * 设置播放器类型
     * @param {String} playerType - 播放器类型字符串。h5_player和client_container，见常量PLAYER_TYPE
     */
    setPlayerType(playerType) {
        this.playerType = playerType;
    }

    // 设置主题，不传参则默认深色主题
    setTheme(value = THEME.BLACK) {
        this.theme = value;
    }

    /**
     * 获取当前主题
     */
    getTheme() {
        return this.theme;
    }

    /**
     * 获取是否有无权限申请功能
     * @return {Boolean} 返回是否有申请功能，true为有，false为没有
     */
    getHasApplyAuth() {
        return this.hasApplyAuth;
    }

    /**
     * 设置有无申请权限
     * @param {Boolean} hasApplyAuth - 是否有申请权限功能
     */
    setHasApplyAuth(hasApplyAuth) {
        this.hasApplyAuth = hasApplyAuth;
    }

    // 更新 播放器对象的基本数据
    updateBaseParams(indexOrPlayerInfos, baseParams) {
        if (typeof baseParams === 'undefined' && typeof indexOrPlayerInfos !== 'number') {
            this.initPlayInfos();
            indexOrPlayerInfos.forEach((c, i) => {
                this.updatePlayInfos(i, c);
            })
            return;
        }
        this.playInfos[indexOrPlayerInfos] = Object.assign(this.getPlayInfos(indexOrPlayerInfos), baseParams);
        // 根据indexCode设置是否是空窗口
        this.setEmptyWnd(indexOrPlayerInfos, !!!this.getIndexCode(indexOrPlayerInfos));
    }

    /**
     * 当前屏幕中有多少个点位
     * @return {Number} 个数
     */
    howMuchPointInCurrentScreen() {
        const howMuchScreen = this.getCurrentScreen();
        const activedScreen = this.getAllNotEmptyWnd().length;
        return howMuchScreen < activedScreen ? howMuchScreen : activedScreen;
    }

    // 获取当前页面，展示的点位的最后一个点位的下标值
    getCurrentPageLastPointIndex() {
        const {pageNo, size} = this.getPagination();
        const screen = this.getCurrentScreen();
        const currenPagePoints = this.getCurrentPagePoint() || [];
        // 计算当前页的总点数
        let totalPoints = (pageNo - 1) * screen + currenPagePoints.length;
        // 如果当前页是第一页
        if (pageNo === 1) {
            return Math.min(totalPoints, screen) - 1;
        }
        // 如果当前页是最后一页
        if (pageNo === size) {
            return totalPoints - 1;
        }
        // 如果当前页不是第一页也不是最后一页
        return (pageNo - 1) * screen + screen - 1;
    }

    /**
     * 缓冲中共有多少点位
     */
    howMuchPoint() {
        return (this.cachePoints && this.cachePoints.length) || 0;
    }

    /**
     * 初始化分页数据。
     * @param {Array} points - 不传参,则自动更新分页信息；传参，则按照参数更新分页。
     */
    initPagination(points) {
        let value = [];
        if (typeof points === 'undefined') {
            value = this.getCachePoints();
        } else {
            value = points;
        }
        const currentScreen = this.getCurrentScreen();
        const pageNo = value.length === 0 ? 1 : 1;
        const total = value.length;
        const currentPageFirstIndexCode = value.length === 0 ? null : value[0] ? value[0].indexCode : undefined;
        const currentPageNum = currentScreen > value.length ? value.length === 0 ? 1 : value.length : currentScreen;
        const size = Math.ceil(value.length / currentScreen);

        if (value.length === 0) {
            this.resetPagination();
        } else {
            this.setPagination({
                pageNo,
                total,
                currentPageFirstIndexCode,
                currentPageNum,
                size
            });
        }
    }

    // 重置页码信息
    resetPagination() {
        const _copy = deepClone(GLOBAL_PARAMS.pagination);
        this.setPagination(_copy);
    }

    // 设置分页信息
    setPagination(keyOrObj, obj) {
        if (typeof obj === 'undefined' && typeof keyOrObj !== 'number') {
            this.pagination = Object.assign(this.pagination, keyOrObj);
        } else {
            this.pagination[keyOrObj] = obj;
        }
    }

    // 获取分页信息
    getPagination(key) {
        if (typeof key === 'undefined') {
            return this.pagination;
        } else {
            return this.pagination[key];
        }
    }

    // 根据indexCode获取点位所处页码
    getPageNoByIndexCode(indexCode) {
        const {size, pageNo} = this.getPagination();
        const cache = this.getCachePoints();
        const len = this.getCurrentScreen();
        const index = cache.findIndex(c => c.indexCode === indexCode);
        if (index >= 0) {
            const indexPlus = index + 1;
            if (indexPlus > len) {
                const jumpNo = Math.ceil(indexPlus / len) || 1;
                return jumpNo > size ? size : jumpNo;
            } else {
                return 1;
            }
        }
        return pageNo; // 未找到则返回当前页码
    }

    // 跳转到第几页
    goPage(jumpPageNo, callback, fail) {
        const {size} = this.getPagination();
        if (jumpPageNo > size) {
            fail && fail();
            return;
        }
        const cache = this.getCachePoints();
        const len = this.getCurrentScreen();
        const startIndex = (jumpPageNo - 1) * len; // 第一页的开始index
        const points = cache.slice(startIndex, startIndex + len);
        this.setPagination('pageNo', jumpPageNo);
        this.setPagination('currentPageFirstIndexCode', cache[startIndex].indexCode);
        callback && callback(points);
    }

    // 跳转到第一页
    goFirstPage(callback) {
        const first = this.getFirstPagePoint();
        if (first && first.length) {
            this.setPagination('pageNo', 1);
            this.setPagination('currentPageFirstIndexCode', first[0].indexCode);
            callback && callback(first);
        }
    }

    // 跳转到后一页
    goNextPage(callback) {
        const next = this.getNextPagePoint();
        if (next && next.length) {
            this.setPagination('pageNo', this.getPagination('pageNo') + 1);
            this.setPagination('currentPageFirstIndexCode', next[0].indexCode);
            callback && callback(next);
        }
    }

    // 跳转到前一页
    goPrePage(callback) {
        const pre = this.getPrePagePoint();
        if (pre && pre.length) {
            this.setPagination('pageNo', this.getPagination('pageNo') - 1);
            this.setPagination('currentPageFirstIndexCode', pre[0].indexCode);
            callback && callback(pre);
        }
    }

    // 获取第一页的点位
    getFirstPagePoint() {
        try {
            const cache = this.getCachePoints();
            const len = this.getCurrentScreen();
            const startIndex = 0; // 第一页的开始index
            return cache.slice(startIndex, len);
        } catch (e) {
            warnLog('[getFirstPagePoint]', e)
            return null;
        }
    }

    // 获取上一页的点位
    getPrePagePoint() {
        try {
            const {currentPageFirstIndexCode, pageNo} = this.getPagination();
            if (pageNo > 1) {
                const cache = this.getCachePoints();
                const currentIndex = cache.findIndex(c => c.indexCode === currentPageFirstIndexCode);
                const len = this.getCurrentScreen();
                const startIndex = currentIndex - len; // 前一页的开始index
                return cache.slice(startIndex, startIndex + len);
            }
            return null
        } catch (e) {
            warnLog('[getPrePagePoint]', e)
            return null;
        }
    }

    // 获取下一页的点位
    getNextPagePoint() {
        try {
            const {currentPageFirstIndexCode, pageNo, size} = this.getPagination();
            if (pageNo < size) {
                const cache = this.getCachePoints();
                const currentIndex = cache.findIndex(c => c.indexCode === currentPageFirstIndexCode);
                const len = this.getCurrentScreen();
                const startIndex = currentIndex + len; // 下一页的开始index
                return cache.slice(startIndex, startIndex + len);
            }
            return null
        } catch (e) {
            warnLog('[getNextPagePoint]', e)
            return null;
        }
    }

    // 获取当前页应该展示的点位集合
    getCurrentPagePoint() {
        const cache = this.getCachePoints();
        const indexCodes = cache.map(c => c.indexCode);
        const screen = this.getCurrentScreen();
        const {currentPageFirstIndexCode} = this.getPagination();
        const startIndex = indexCodes.findIndex(c => c === currentPageFirstIndexCode);
        return cache.slice(startIndex, startIndex + screen);
    }

    // 重置playInfo
    resetPlayInfos(index) {
        try {
            const playInfo = Object.assign(BASE_PARAMS, {
                [this.extraKey]: Object.assign(PLAYER_EXTRA_PARAMS, {
                    index: index, // i和外部的HTML中遍历index in 9保持一致
                    ref: `${this.getRefPre()}${index}`
                })
            });
            this.setPlayInfos(index, deepClone(playInfo));
        } catch (e) {
            warnLog('[resetPlayInfos]', e);
        }
    }

    $getPlayerRef(index) {
        try {
            return this.playInfos[index][this.extraKey].ref;
        } catch (e) {
            warnLog('[$getPlayerRef][error]', e);
        }
    }

    $extra(index) {
        return this.playInfos[index][this.extraKey];
    }

    // 获取缓冲的点位数据
    getCachePoints() {
        return this.cachePoints;
    }

    // 清除缓冲的点位数据
    clearCachePoints() {
        this.cachePoints = [];
    }

    // 根据indexCode从缓冲中获取数据
    getCachePointByIndexCode(indexCode) {
        const cache = this.getCachePoints();
        const index = cache.findIndex(c => c.indexCode === indexCode);
        if (index >= 0) return cache[index];
        else return null;
    }

    // 设置缓冲的点位数据
    // 设置分页
    // 初始化playInfos
    setCachePoints(value = []) {
        try {
            this.initPagination(value);
            // 设置缓冲点位
            this.cachePoints = value && deepClone(value) || [];

            logger('[setCachePoints]', deepClone(this));
        } catch (e) {
            warnLog('[setCachePoints]', this, e);
        }
    }

    // 通过key设置缓冲
    setCachePointsByKey(key, value) {
        if (this.cachePoints && isNotEmpty(key) && isNotEmpty(value)) {
            this.cachePoints = this.cachePoints.map((c) => {
                c[key] = value;
                return c;
            });
        }
    }

    // 根据indexCode设置缓冲点
    // 覆盖原则
    setCachePointsByIndexCode(indexCode, point) {
        if (this.cachePoints && Array.isArray(this.cachePoints)) {
            this.cachePoints = this.cachePoints.map((c) => {
                if (c.indexCode === indexCode) {
                    let tempObj = {...c} || {}; // 创建一个临时对象来保存原始的c对象
                    return assignObj(tempObj, point); // 将point添加到临时对象中
                }
                return c;
            });
        }
    }

    // 向缓冲中添加一个点位
    addCachePoint(objOrArr) {
        const temp = Array.isArray(objOrArr) ? objOrArr : [objOrArr];
        let data = this.cachePoints.concat(temp);
        this.setCachePoints(data);
    }

    // 在指定下标处插入
    addCachePointByIndex(index, obj) {
        const len = this.cachePoints.length;
        if (len === 0) {
            this.addCachePoint(obj);
        } else {
            if (index < len) {
                this.cachePoints[index] = obj;
            } else {
                for (let i = len; i <= index; i++) {
                    if (i === index) {
                        this.cachePoints.push(obj);
                    } else {
                        this.cachePoints.push({
                            ...BASE_PARAMS,
                            [this.h5ParamsKey]: H5_PARAMS, // 兼容H5参数
                            [this.extraKey]: {
                                ...PLAYER_EXTRA_PARAMS,
                                index: i, // i和外部的HTML中遍历index in 9保持一致
                                ref: `${this.getRefPre()}${i}`
                            }
                        });
                    }
                }
            }
        }
        this.initPagination();
    }

    // 通过indexCode从缓冲数据中删除一条
    // 删除中做了两个处理，1、删除后设置到缓冲中；2、更新分页信息
    removeCachePoint(indexCode) {
        const old = deepClone(this.cachePoints);
        const oldIndexCodes = old.map(c => c.indexCode);
        const position = oldIndexCodes.indexOf(indexCode); // 删除的点所在的下标位置
        const {
            pageNo,
            size,
            currentPageFirstIndexCode,
            currentPageNum,
        } = this.getPagination();
        // 通过字段indexCode,从数组this.cachePoints中删除一项
        this.cachePoints = this.cachePoints.filter(point => point.indexCode !== indexCode);
        if (this.cachePoints.length === 0) {
            this.resetPagination();
        } else {
            if (indexCode === currentPageFirstIndexCode) {
                if (position === 0) {
                    this.resetPagination();
                } else if (position === old.length - 1) { // 若恰好最后一个
                    this.setPagination({
                        pageNo: (pageNo - 1) >= 1 ? (pageNo - 1) : 1,
                        size: size - 1,
                        currentPageNum: this.getCurrentScreen()
                    })
                }
            } else {
                this.setPagination({
                    currentPageNum: currentPageNum - 1
                })
            }
            this.setPagination({
                total: this.cachePoints && this.cachePoints.length,
            })
        }
    }

    setSelfStatus(value) {
        this.selfStatus = value;
    }

    getSelfStatus() {
        return this.selfStatus;
    }

    // 全局的按钮是否是回放
    isGlobalPlayback() {
        return this.getGlobalStatus() === PLAYER_MODE_MAP.PLAYBACK.value;
    }

    // 全局的按钮是否是预览
    isGlobalPreview() {
        return this.getGlobalStatus() === PLAYER_MODE_MAP.PREVIEW.value;
    }

    // 设置全局播放状态为预览
    setGlobalStatusPreview() {
        this.setGlobalStatus(PLAYER_MODE_MAP.PREVIEW.value);
    }

    // 设置全局播放状态为回放
    setGlobalStatusPlayback() {
        this.setGlobalStatus(PLAYER_MODE_MAP.PLAYBACK.value);
    }

    // 设置全局状态
    // 同步到缓冲数据中（分页切换中使用）
    setGlobalStatus(status) {
        this.globalStatus = status;
        const cache = this.getCachePoints();
        const newCache = cache.map((c) => ({...c, status}));
        this.setCachePoints(newCache);
    }

    getGlobalStatus() {
        return this.globalStatus;
    }

    getRefPre() {
        return this.refPre;
    }

    getPlayInfos() {
        return this.playInfos;
    }

    /**
     * 获取合理的级联字段
     * @param {String|Number} cascadeCode - 级联字段
     * @return {Number} 是否级联， 0 本机；1 级联
     */
    getLegalCascadeCode(cascadeCode) {
        // 0本级 1级联
        return isNotEmpty(cascadeCode) ? ([0, 1, '0', '1'].includes(cascadeCode) ? cascadeCode : 1) : 0;
    }

    // 获取播放对象（对外提供）
    // 对外提供拷贝数据，以免外部改变影响内部对象
    getPlayInfosForOuterByIndex(index) {
        try {
            let temp = deepClone(this.playInfos[index]);
            delete temp._extra;
            return temp;
        } catch (e) {
            warnLog('[getPlayInfosForOuterByIndex]', e)
            return null;
        }
    }

    // 获取播放对象，拷贝
    // index的值不同于缓冲数据中的下标，此处的index，和其他方法传入的index一样，表示的是页面中渲染的数据的下标
    getPlayInfosByIndex(index) {
        try {
            return deepClone(this.playInfos[index]);
        } catch (e) {
            warnLog('[getPlayInfosByIndex]', e)
            return null;
        }
    }

    // 获取在播放DOM列表中有效的数据
    // indexCode有值的数据
    getPlayInfosOfEffective() {
        try {
            const _playInfos = deepClone(this.playInfos);
            return _playInfos && _playInfos.filter(c => isNotEmpty(c.indexCode)) || [];
        } catch (e) {
            infoLog('[getPlayInfosOfEffective]', e);
            return [];
        }
    }

    // 更新缓冲数据
    updateCache(arr) {
        arr && Array.isArray(arr) && arr.forEach((c) => {
            isNotEmpty(c.indexCode) && this.setCachePointsByIndexCode(c.indexCode, c);
        })
    }

    // 更新播放对象
    // 仅仅更新当前屏的点位数据
    // 精准更新，适用于外部调用
    updatePlayInfosByIndexCode(playInfos) {
        try {
            if (Array.isArray(playInfos)) {
                // 当前屏数据 合并对象
                Array.from(new Array(this.getMaxScreen()).fill('')).forEach((_, i) => {
                    const indexCode = this.getIndexCode(i); // 当前窗口的indexCode
                    const aimIndex = playInfos.findIndex(c => c.indexCode === indexCode); // 是否在传入的数据中
                    if (aimIndex >= 0) { // 若命中
                        Object.keys(playInfos[aimIndex]).forEach((k) => {
                            this.setPlayInfos(i, k, playInfos[aimIndex][k]);
                        });
                    }
                });
            } else {
                errorLog('[only support Array type][you enter a error type]', playInfos);
            }
        } catch (e) {
            warnLog('[updatePlayInfosByIndexCode][playInfos]', playInfos, e)
        }
    }

    // 更新播放对象
    // 仅仅更新当前屏的点位数据
    // 适用于内部使用，在调用播放时使用，内部更新原则是按序index的，并不是按照indexCode
    updatePlayInfos(indexOrObj, obj) {
        try {
            if (typeof obj === 'undefined' && Array.isArray(indexOrObj)) {
                // 当前分屏下，初始化窗口数据
                Array.from(new Array(this.getMaxScreen()).fill('')).forEach((_, i) => {
                    if (i < indexOrObj.length) {
                        this.resetWndStatus(i);
                        Object.keys(indexOrObj[i]).forEach((k) => {
                            this.setPlayInfos(i, k, indexOrObj[i][k]);
                        });
                    } else {
                        this.resetPlayInfos(i); // 重置所有字段
                    }
                    this.setEmptyWnd(i, !isNotEmpty(this.getIndexCode(i)));
                    this.setStatus(i, this.getGlobalStatus()); // 不能重置预览回放状态
                });
            } else {
                Object.keys(obj).forEach((k) => {
                    this.setPlayInfos(indexOrObj, k, obj[k]);
                });
                this.setEmptyWnd(indexOrObj, !!!this.getIndexCode(indexOrObj));
            }
        } catch (e) {
            warnLog('[updatePlayInfos][indexOrObj, obj]', indexOrObj, obj, e)
        }
    }

    // 设置缓冲中的key
    setCachePlayInfosByIndexCode(indexCode, keyOrObj, value) {
        const index = this.cachePoints.findIndex(c => c.indexCode === indexCode);
        this.cachePoints[index][keyOrObj] = value;
    }

    // 设置播放对象
    // 同时设置_extra
    setPlayInfos(index, keyOrObj, value) {
        try {
            if (typeof keyOrObj === 'undefined' && typeof value === 'undefined' && Array.isArray(index)) {
                if (this.playInfos && Array.isArray(this.playInfos) && this.playInfos.length === index.length) {
                    index.forEach((c, i) => {
                        if (isObject(c)) {
                            Object.keys(c).forEach((ck) => {
                                if (this.getExtraParamsKey() === ck) this.setExtraFromExtraParams(i, c[ck]);
                                else if (this.getExtraKey() === ck) this.setExtraFromExtraParams(i, c[ck]);
                                else if (this.getH5ParamsKey() === ck) this.setH5Params(i, c[ck]);
                                else if (this.getCapabilitySetKey() === ck) this.setCapabilityByReqData(i, c[ck]);
                                else this.playInfos[i][ck] = c[ck];
                            });
                        }
                    });
                } else {
                    // 历史不存在playInfos时，直接赋值
                    this.playInfos = index;
                }
            } else if (typeof value === 'undefined' && isObject(keyOrObj)) {
                Object.keys(keyOrObj).forEach((k) => {
                    if (this.getExtraParamsKey() === k) this.setExtraFromExtraParams(index, keyOrObj[k]);
                    else if (this.getExtraKey() === k) this.setExtraFromExtraParams(index, keyOrObj[k]);
                    else if (this.getH5ParamsKey() === k) this.setH5Params(index, keyOrObj[k]);
                    else if (this.getCapabilitySetKey() === k) this.setCapabilityByReqData(index, keyOrObj[k]);
                    else this.playInfos[index][k] = keyOrObj[k];
                });
                this.setEmptyWnd(index, !!!this.getIndexCode(index));
            } else {
                if (this.getExtraParamsKey() === keyOrObj) this.setExtraFromExtraParams(index, value);
                else if (this.getExtraKey() === keyOrObj) this.setExtraFromExtraParams(index, value);
                else if (this.getH5ParamsKey() === keyOrObj) this.setH5Params(index, value);
                else if (this.getCapabilitySetKey() === keyOrObj) this.setCapabilityByReqData(index, value);
                else this.playInfos[index][keyOrObj] = value;
                // 根据外部扩展参数设置内部参数
                this.setEmptyWnd(index, !!!this.getIndexCode(index));
            }
        } catch (e) {
            warnLog('[setPlayInfos][index, keyOrObj, value]', index, keyOrObj, value, e)
        }
    }

    /**
     * 通过字段extraParams设置_extra数据，仅支持对象深度为2的对象分析。
     * @param {Number} index - 窗口下标
     * @param {String} extraParams - extraParams对象值
     * @return {String}
     * @author lixiaodong31 2024/3/15
     * @version 1.0.0
     * @description 设置规则：1、value值类型为Boolean、Array、String，直接赋值2、value值类型为Object，继续分析下层，对应赋值3、value值类型为null、undefined，则不赋值。
     */
    setExtraFromExtraParams(index, extraParams) {
        if (typeof index !== 'undefined' && isObject(extraParams)) {
            // 如果extraParams是对象类型，继续分析下层
            for (let k in extraParams) {
                if (typeof extraParams[k] === 'undefined' || extraParams[k] === null || !this.isExtraKey(k)) {
                    // 如果extraParams是undefined或null，不进行任何操作
                    return;
                }
                // 如果extraParams不是对象，检查它是否是Boolean、Array、String类型
                // 如果是，直接赋值给_extra
                if (typeof extraParams[k] === 'boolean' ||
                    (Array.isArray(extraParams[k]) && !isObject(extraParams[k])) ||
                    typeof extraParams[k] === 'string') {
                    this.setExtra(index, k, extraParams[k]);
                } else if (isObject(extraParams[k])) {
                    const old = this.getExtra(index, k);
                    if (isObject(old)) this.setExtra(index, k, Object.assign(this.getExtra(index, k), extraParams[k]));
                    else this.setExtra(index, k, extraParams[k]);
                }
            }
        }
    }

    // 是否是_extra内部字段(受保护字段除外)
    isExtraKey(key) {
        let keys = [];
        // 受保护字段
        const protectKeys = ['index', 'emptyWnd', 'playerReady'];
        const _extraKeys = Object.keys(PLAYER_EXTRA_PARAMS);
        keys = _extraKeys;
        _extraKeys.forEach((k) => {
            if (isObject(PLAYER_EXTRA_PARAMS[k])) keys = keys.concat(Object.keys(PLAYER_EXTRA_PARAMS[k]));
        });
        return keys.includes(key) && !protectKeys.includes(key);
    }

    // 获取自动轮询开关
    getLoop() {
        return this.loop;
    }

    // 设置自动轮询开关
    setLoop(value) {
        this.loop = value;
        this.update();
    }

    // 设置用户ID
    setUserId(value) {
        this.userId = value;
        this.update();
    }

    // 获取用户ID
    getUserId() {
        return this.userId;
    }

    // 设置播放器页面当前模式
    setMode(value = MODE.NORMAL) {
        this.mode = value;
        this.update();
    }

    // 获取播放器页面当前模式
    getMode() {
        return this.mode;
    }

    // 设置播放器插件是否存在
    setCcExists(value) {
        this.ccExists = value;
        this.update();
    }

    // 获取播放器插件是否存在
    getCcExists() {
        return this.ccExists;
    }

    // 设置分屏数据
    setScreenMap(value) {
        this.screenMap = value;
        this.update();
    }

    // 获取分屏数据
    getScreenMap() {
        return this.screenMap;
    }

    // 获取当前可以展示的分屏数据
    getScreens() {
        const index = this.screenMap.findIndex(c => c.screenNum === this.getMaxScreen());
        return this.screenMap.slice(0, index + 1);
    }

    // 获取当前工具栏中展示的分屏数据
    getToolbarScreens() {
        return this.screenMap.filter(c => c.showInToolbar === true);
    }

    // 设置关闭所有开关项
    setCloseAll(value) {
        this.closeAll = value;
        this.update();
    }

    // 获取关闭所有开关项
    getCloseAll() {
        return this.closeAll;
    }

    // 设置浓缩播放开关项
    setHasConcentrate(value) {
        this.hasConcentrate = value;
        this.update();
    }

    // 获取浓缩播放开关项
    getHasConcentrate() {
        return this.hasConcentrate;
    }

    // 设置是否全屏
    setFullScreen(value) {
        this.fullScreen = value;
        this.update();
    }

    // 获取是否全屏
    getFullScreen() {
        return this.fullScreen;
    }

    // 根据list数据，分析最佳的分屏数
    // 注意：前提范围是在基础屏中分析最佳屏
    getFitScreenByList(list) {
        const screenMap = this.getToolbarScreens(); // 默认从工具栏中常用分屏中选择最佳屏
        const screen = screenMap.map(c => c.screenNum).sort((a, b) => a - b);
        const maxScreenNum = Math.max(...screen);
        const fitScreenIndex = screen.findIndex(c => c >= list.length);
        if (fitScreenIndex !== -1) {
            return screen[fitScreenIndex];
        } else if (list.length + 1 > maxScreenNum) {
            return maxScreenNum;
        }
    }

    // 记录上一次历史分屏情况
    setHistoryScreen(value) {
        this.historyScreen = value;
    }

    // 获取历史分屏
    getHistoryScreen() {
        return this.historyScreen;
    }

    // 设置当前分屏数。
    // 分屏一旦变化，分页信息将被初始化开始页码是1。
    // id有值，则从所有分屏数据中查询处理
    // id没有，则从工具栏中少数基本屏中查询处理（兼容没有异形屏的情景）
    setCurrentScreen(value, id) {
        const cache = this.getCachePoints();
        if (typeof id !== 'undefined') {
            const item = this.getScreenObjById(id);
            const {screenNum} = item;
            this.setCurrentDiffScreenId(id);
            this.currentScreen = screenNum;
        } else {
            const all = this.getToolbarScreens();
            const item1 = all.find(c => c.screenNum === value);
            this.setCurrentDiffScreenId(item1.id);
            this.currentScreen = value;
        }
        if (cache.length > 0) {
            this.setPagination({
                size: Math.ceil(cache.length / value),
                pageNo: 1, // 从第1页重新开始计算分页
                currentPageNum: cache.length > value ? value : cache.length,
                currentPageFirstIndexCode: cache[0].indexCode
            })
        }

        this.update();
    }

    // 获取当前分屏数
    getCurrentScreen() {
        return this.currentScreen;
    }

    // 设置当前分屏ID 强绑定于currentScreen的设置
    setCurrentDiffScreenId(id) {
        this.currentDiffScreenId = id;
    }

    // 获取当前分屏ID
    getCurrentDiffScreenId() {
        return this.currentDiffScreenId;
    }

    // 获取当前选中异形屏对象
    getCurrentScreenObj() {
        return this.getScreenMap().find((c) => c.id === this.getCurrentDiffScreenId());
    }

    // 根据id获取分屏元素
    getScreenObjById(id) {
        return this.getScreenMap().find((c) => c.id === id);
    }

    // 根据screenNum获取分屏元素
    getScreenObjByScreenNum(screenNum) {
        return this.getScreenMap().find((c) => c.screenNum === screenNum);
    }

    // 当前是都有选中窗口
    hasSelectedWnd() {
        return this.getSelectedWnd() !== null;
    }

    // 设置当前选中窗格
    // 不传递则取消当前选中
    setSelectedWnd(index = null, value = null) {
        this.getPlayInfos().forEach((c) => {
            this.setWndStatus(c[this.extraKey]['index'], 'selected', false);
        })
        this.selectedWnd = index;
        this.selectedWndData = value;
        this.setHoverWnd(); // 取消hover
        this.update();
    }

    // 设置当前hover窗格
    // 不传递则取消当前选中
    setHoverWnd(value = null) {
        this.hoverWnd = value;
        this.update();
    }

    // 获取当前hover窗格
    getHoverWnd() {
        return this.hoverWnd;
    }

    // 获取权限严格模式，对播放窗格头部工具栏
    // true 判断能力集
    // false 不判断能力集
    getStrictAuthMode() {
        return this.strictAuthMode;
    }

    // 获取当前选中窗格,默认第一个窗格
    getSelectedWnd() {
        return this.selectedWnd || 0;
    }

    // 获取当前选中窗格数据
    getSelectedWndData() {
        return this.selectedWndData;
    }

    // 获取是否开启异形屏
    getShowMoreScreens() {
        return this.showMoreScreens;
    }

    // 设置权限严格模式，对播放窗格头部工具栏
    // true 判断能力集
    // false 不判断能力集
    setStrictAuthMode(strictAuthMode) {
        this.strictAuthMode = strictAuthMode;
    }

    // 设置是否开启异形屏
    setShowMoreScreens(value) {
        this.showMoreScreens = value;
        this.initScreenMap();
    }

    // 设置是否展示标题开关
    setShowTitle(value) {
        this.showTitle = value;
    }

    // 设置是否展示底部工具栏
    setShowToolBar(value) {
        this.showToolBar = value;
    }

    // 设置是否展示全局头部工具栏
    setShowHeader(value) {
        this.showHeader = value;
    }

    // 设置是否展示配置按钮
    setShowSetting(value) {
        this.showSetting = value;
    }

    // 设置是否展示编号开关
    setShowSequence(value) {
        this.showSequence = value;
    }

    // 设置是否展示算法分析模块开关
    setShowAlgorithmAnalysis(value) {
        this.showAlgorithmAnalysis = value;
    }

    // 设置是否展示标签标注模块开关
    setShowLabelTag(value) {
        this.showLabelTag = value;
    }

    // 获取tokens（构架226以上）
    getTokens(index, key) {
        const R = this.playInfos[index];
        const KEYS = Object.values(POINT_AUTH_MAP);
        if (KEYS.includes(key)) {
            return (R && R.tokens && R.tokens[key]) || null;
        } else {
            infoLog('[getTokens] key not support', index, key, 'support keys has ', POINT_AUTH_MAP);
            return null;
        }
    }

    // 获取标题开关项
    getShowTitle() {
        return this.showTitle;
    }

    // 设置是否展示底部工具栏
    getShowToolBar() {
        return this.showToolBar;
    }

    // 设置是否展示全局头部工具栏
    getShowHeader() {
        return this.showHeader;
    }

    // 获取是否展示算法分析模块开关值
    getShowAlgorithmAnalysis() {
        return this.showAlgorithmAnalysis;
    }

    // 获取是否展示标签标注模块开关值
    getShowLabelTag() {
        return this.showLabelTag;
    }

    // 获取是否展示事件上报按钮
    getShowEventReport() {
        return this.showEventReport;
    }

    // 获取是否展示图片标签
    getShowPictureTag() {
        return this.showPictureTag;
    }

    // 获取是否展示智能推荐
    getShowAiRecommend() {
        return this.showAiRecommend;
    }

    // 获取是否展示mini云台控制
    getOpenPtzWidthMini() {
        return this.openPtzWidthMini;
    }

    // 设置是否展示mini云台控制
    setOpenPtzWidthMini(value) {
        this.openPtzWidthMini = value;
    }

    // 设置是否展示事件上报按钮
    setShowEventReport(value) {
        this.showEventReport = value;
    }

    // 设置是否展示图片标签
    setShowPictureTag(value) {
        this.showPictureTag = value;
    }

    // 设置是否展示智能推荐
    setShowAiRecommend(value) {
        this.showAiRecommend = value;
    }

    // 设置是否展示配置按钮
    getShowSetting() {
        return this.showSetting;
    }

    // 是否可以展示标题常显
    canShowTitle(index) {
        return this.getShowTitle() && isNotEmpty(this.getTitle(index));
    }

    // 设置极简本地配置
    setCcLocalConfig(value) {
        this.ccLocalConfig = value;
    }

    // 获取极简本地配置
    getCcLocalConfig(key) {
        try {
            if (typeof key === 'undefined') {
                return this.ccLocalConfig;
            } else {
                return this.ccLocalConfig[key];
            }
        } catch (e) {
            errorLog('[getCcLocalConfig]', this.ccLocalConfig, e);
            return null;
        }
    }

    // 设置最大支持分屏数
    // 不建议频繁调用，开销大
    setMaxScreen(value) {
        this.maxScreen = value;
        this.initPlayInfos(); // 需要重新初始化
        this.update();
    }

    // 获取最大支持分屏数
    getMaxScreen() {
        return this.maxScreen;
    }

    // 设置试看时间
    setVideoTryTime(value) {
        this.videoTryTime = value;
        this.update();
    }

    // 获取是否需要检测插件助手
    getCheckTool() {
        return this.checkTool;
    }

    // 设置检测插件助手开关
    setCheckTool(value) {
        this.checkTool = value;
        this.update();
    }

    // 获取极简取流方式
    getReadStreamWay() {
        return this.readStreamWay;
    }

    // 设置极简取流方式
    setReadStreamWay(value) {
        this.readStreamWay = value;
        this.update();
    }

    // 设置能力集字段key
    setCapabilitySetKey(value) {
        this.capabilitySetKey = value;
    }

    // 获取试看时间
    getVideoTryTime() {
        return this.videoTryTime;
    }

    // 设置ToolBar组件参数之当前项
    setToolBarCurrent(value) {
        try {
            this.toolBar.current = value;
            this.update();
        } catch (e) {
            warnLog('[设置ToolBar组件参数之当前项][setToolBarCurrent]', e)
        }
    }

    // 通过value值设置toolbar当前选中值
    setToolBarCurrentValue(obj) {
        let item = LOOP_TIME_OPTIONS.find((c) => c.value === obj.value && c.unit === obj.unit);
        if (isNotEmpty(item)) {
            this.setToolBarCurrent(item);
        } else {
            this.setToolBarCurrent(obj);
        }
    }

    setToolBarOptions(data) {
        return this.toolBar.options = data;
    }

    addToolBarOptions(item) {
        const {valSecond} = item || {};
        const options = this.getToolBarOptions();
        const repeatFlag = options.some(c => c.valSecond === valSecond);
        if (repeatFlag) {
            warnLog('can not add repeat data!', item);
            return;
        }
        options.splice(options.length - 1, 0, {
            ...item,
            createOwn: item.hasOwnProperty('createOwn') ? item.createOwn : true
        });
        this.setToolBarOptions(options);
    }

    removeToolBarOptions(item) {
        const {valSecond} = item || {};
        const options = this.getToolBarOptions();
        const index = options.findIndex(c => c.valSecond === valSecond);
        if (index >= 0) {
            options.splice(index, 1);
        }
        this.setToolBarOptions(options);
    }

    // 获取时间间隔数组
    getToolBarOptions(key) {
        if (typeof key === 'undefined') {
            return this.toolBar.options;
        } else {
            return this.toolBar.options[key];
        }
    }

    // 获取ToolBar组件参数之当前项
    getToolBarCurrent() {
        try {
            return this.toolBar.current;
        } catch (e) {
            warnLog('[获取toolbar.current][getToolBarCurrent]', e)
            return null;
        }
    }

    // 检测轮询时间是否合规
    isLoopTimeValid(value, unit = 'second') {
        const {
            MINUTE_MIN,
            SECOND_MIN,
            SECOND_MAX,
            MINUTE_MAX,
        } = LOOP_TIME_CONSTANT;

        if (isInteger(value)) {
            if (unit === 'second') {
                return value >= SECOND_MIN && value <= SECOND_MAX;
            } else if (unit === 'min') {
                return value >= MINUTE_MIN && value <= MINUTE_MAX;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    // current向左
    getToolBarCurrentLeft() {
        try {
            const current = this.getToolBarCurrent();
            const options = this.getToolBarOptions();
            const index = options.findIndex(c => c.value === current.value);
            const leftIndex = index > 0 ? index - 1 : index;
            return this.getToolBarOptions(leftIndex);
        } catch (e) {
            warnLog('[current向左][getToolBarCurrentLeft]', e)
            return null;
        }
    }

    // current向右
    getToolBarCurrentRight() {
        try {
            const current = this.getToolBarCurrent();
            const options = this.getToolBarOptions().filter(c => c.txt.indexOf('自定义轮巡') < 0);
            const max = options.length - 1;
            const index = options.findIndex(c => c.value === current.value);
            const rightIndex = index < max ? index + 1 : max;
            return this.getToolBarOptions(rightIndex);
        } catch (e) {
            warnLog('[current向右][getToolBarCurrentRight]', e)
            return null;
        }
    }

    /**
     * 是否是回放
     * @param {Number} index - 窗口下标
     * @return {Boolean} 返回布尔值
     * @author lixiaodong31 2024/3/15
     * @version 1.0.0
     */
    isPlayback(index) {
        return this.getStatus(index) === PLAYER_MODE_MAP.PLAYBACK.value
    }

    /**
     * 是否是预览
     * @param {Number} index - 窗口下标
     * @return {Boolean} 返回布尔值
     * @author lixiaodong31 2024/3/15
     * @version 1.0.0
     */
    isPreview(index) {
        return this.getStatus(index) === PLAYER_MODE_MAP.PREVIEW.value
    }

    /**
     * 是否正在回放中
     * @param {Number} index - 窗口下标
     * @return {Boolean} 返回布尔值
     * @author lixiaodong31 2024/3/15
     * @version 1.0.0
     */
    isPlaybackNow(index) {
        return this.getStatus(index) === PLAYER_MODE_MAP.PLAYBACK.value;
    }

    /**
     * 是否是本级
     * @param {Number} index - 窗口下标
     * @return {Boolean} 返回布尔值
     * @author lixiaodong31 2024/3/15
     * @version 1.0.0
     */
    isBenJi(index) {
        return String(this.getCascadeType(index)) === String(CASCADE_TYPE.benji.value);
    }

    /**
     * 是否是枪机
     * @param {Number} index - 窗口下标
     * @return {Boolean} 返回布尔值
     * @author lixiaodong31 2024/3/15
     * @version 1.0.0
     */
    isQiangJi(index) {
        return this.getCameraType(index) === CAMERA_TYPE.qiangji.value;
    }

    /**
     * 是否是球机。除了枪机外，半球、球机、云台枪机均属于球机
     * @param {Number} index - 窗口下标
     * @return {Boolean} 返回布尔值
     * @author lixiaodong31 2024/3/15
     * @version 1.0.0
     */
    isQiuJi(index) {
        return this.getCameraType(index) !== CAMERA_TYPE.qiangji.value;
    }

    // 设置级联类型
    setCascadeType(index, value) {
        try {
            this.playInfos[index].cascadeType = value;
            this.update();
        } catch (e) {
            warnLog('[setCascade]', e);
        }
    }

    // 获取点位删除状态,默认非删除状态
    getIsDelete(index) {
        try {
            return this.playInfos[index].hasOwnProperty('isDelete') ? this.playInfos[index].isDelete : false;
        } catch (e) {
            warnLog('[getIsDelete]', e);
            return false;
        }
    }

    // 设置点位删除状态
    setIsDelete(index, value) {
        try {
            this.playInfos[index].isDelete = value;
            this.update();
        } catch (e) {
            warnLog('[setIsDelete]', e);
        }
    }

    // 获取级联类型
    getCascadeType(index) {
        try {
            return this.playInfos[index].cascadeType;
        } catch (e) {
            warnLog('[getCascade]', e)
        }
    }

    // 设置点位类型
    setCameraType(index, value) {
        try {
            this.playInfos[index].cameraType = value;
            this.update();
        } catch (e) {
            warnLog('[setCameraType]', e)
        }
    }

    // 获取点位类型
    getCameraType(index) {
        try {
            return this.playInfos[index].cameraType;
        } catch (e) {
            warnLog('[getCameraType]', e)
        }
    }

    // 设置当前播放状态
    setStatus(index, value) {
        try {
            this.playInfos[index]['status'] = value;
            const indexCode = this.getIndexCode(index);
            this.setCachePointsByIndexCode(indexCode, {status: value});
            this.update();
        } catch (e) {
            warnLog('[setStatus]', e)
        }
    }

    // 获取序号值
    getSequence(index) {
        try {
            return this.playInfos[index]['sequence'];
        } catch (e) {
            warnLog('[getSequence]', e);
            return null;
        }
    }

    // 获取窗口编号开关
    getShowSequence() {
        return this.showSequence;
    }

    // 获取序号HTML
    getSequenceHtml(index) {
        try {
            return this.playInfos[index]['sequenceHtml'];
        } catch (e) {
            warnLog('[getSequenceHtml]', e);
            return null;
        }
    }

    // 设置序号值
    setSequence(index, value) {
        try {
            this.playInfos[index]['sequence'] = value;
            this.update();
        } catch (e) {
            warnLog('[setSequence]', e)
        }
    }

    // 设置序号HTML
    setSequenceHtml(index, value) {
        try {
            this.playInfos[index]['sequenceHtml'] = value;
            this.update();
        } catch (e) {
            warnLog('[setSequenceHtml]', e)
        }
    }

    // 是否出错了
    isErrorStatus(index) {
        try {
            return this.playInfos[index]['status'] === PLAYER_MODE_MAP.ERROR.value;
        } catch (e) {
            warnLog('[isErrorStatus]', e)
            return null;
        }
    }

    // 当前是否是回放
    isPlaybackStatus(index) {
        try {
            return this.playInfos[index]['status'] === PLAYER_MODE_MAP.PLAYBACK.value;
        } catch (e) {
            warnLog('[isPlaybackStatus]', e)
            return null;
        }
    }

    // 当前是否是预览
    isPreviewStatus(index) {
        try {
            return this.playInfos[index]['status'] === PLAYER_MODE_MAP.PREVIEW.value;
        } catch (e) {
            warnLog('[isPreviewStatus]', e)
            return null;
        }
    }

    // 当前是否是回放
    isPlaybackStatusByIndexCode(indexCode) {
        try {
            const index = this.playInfos.findIndex(c => c.indexCode === indexCode);
            return this.playInfos[index]['status'] === PLAYER_MODE_MAP.PLAYBACK.value;
        } catch (e) {
            warnLog('[isPlaybackStatus]', e)
            return null;
        }
    }

    // 当前是否是预览
    isPreviewStatusByIndexCode(indexCode) {
        try {
            const index = this.playInfos.findIndex(c => c.indexCode === indexCode);
            return this.playInfos[index]['status'] === PLAYER_MODE_MAP.PREVIEW.value;
        } catch (e) {
            warnLog('[isPreviewStatus]', e)
            return null;
        }
    }

    // 是否是空窗口
    isEmptyWnd(index) {
        try {
            return this.playInfos[index][this.extraKey]['emptyWnd'];
        } catch (e) {
            warnLog('[isEmptyWnd]', e)
            return null;
        }
    }

    // 是不是空点且空窗口
    isEmptyWndAndEmptyIndexCode(index) {
        const indexCode = this.getIndexCode(index);
        return this.isEmptyWnd(index) && !isNotEmpty(indexCode);
    }

    // 获取非空窗口
    getAllNotEmptyWnd() {
        return this.playInfos.filter(c => c[this.extraKey].emptyWnd === false);
    }

    // 获取能力集，数据来源于capabilitySet或capability字段
    getCapabilitySet(index) {
        try {
            let capabilitySet = this.playInfos[index]['capabilitySet'] || this.playInfos[index]['capability'];
            if (capabilitySet && capabilitySet.indexOf('@') >= 0) {
                return capabilitySet.split('@').filter(c => !!c);
            }
            return [];
        } catch (e) {
            warnLog('[getCapabilitySet]', e)
            return [];
        }
    }

    // 设置能力集
    setCapabilitySet(index, value) {
        try {
            let _value = [];
            // 要求能力集格式为@分隔的字符串
            if (value.indexOf('@') >= 0) {
                _value = value.split('@').filter(c => !!c);
            }
            if (Array.isArray(value)) _value = value;
            this.playInfos[index]['capabilitySet'] = _value;
            this.update();
        } catch (e) {
            warnLog('[setCapabilitySet]', e)
            return null;
        }
    }

    // 设置_extra扩展字段
    setExtra(index, key, value) {
        try {
            this.playInfos[index][this.extraKey][key] = value;
        } catch (e) {
            warnLog('[setExtra][index, key, value]', index, key, value, e);
        }
    }

    // 设置_extra扩展字段
    getExtra(index, key) {
        try {
            return this.playInfos[index][this.extraKey][key];
        } catch (e) {
            warnLog('[getExtra][index, key]', index, key, e);
        }
    }

    // 设置附加扩展字段
    setExtraParams(index, value) {
        this.playInfos[index].extraParams = value;
    }

    // 获取附加扩展字段
    getExtraParams(index) {
        return this.playInfos[index].extraParams;
    }

    // 获取当前窗口控制窗口标记值
    getEmptyWnd(index) {
        try {
            return this.playInfos[index][this.extraKey]['emptyWnd'];
        } catch (e) {
            warnLog('[getEmptyWnd]', e)
            return null;
        }
    }

    // 设置当前的窗口为空窗口
    setEmptyWnd(index, value) {
        try {
            this.playInfos[index][this.extraKey]['emptyWnd'] = value;
            this.update();
        } catch (e) {
            warnLog('[setEmptyWnd]', e)
            return null;
        }
    }

    // 初始化所有为空窗口
    initEmptyWnd() {
        this.getPlayInfos().forEach((playInfo, i) => {
            this.setEmptyWnd(i, true);
        })
    }

    // 获取当前播放状态
    getStatus(index) {
        try {
            return this.playInfos[index]['status'];
        } catch (e) {
            warnLog('[getStatus]', e)
            return null;
        }
    }

    // 获取当前播放状态中文名
    getStatusZn(index) {
        try {
            const list = Object.values(PLAYER_MODE_MAP);
            const res = list.find(c => this.playInfos[index]['status'] === c.value);
            return res && res.label;
        } catch (e) {
            warnLog('[getStatusZn]', e)
            return null;
        }
    }

    // 设置标题
    setTitle(index, value) {
        try {
            this.playInfos[index]['title'] = value;
            this.update();
        } catch (e) {
            warnLog('[setTitle]', e)
        }
    }

    // 获取标题
    getTitle(index) {
        try {
            if (typeof index !== 'undefined' && index !== null && index !== '') {
                return this.playInfos[index]['title'];
            } else {
                return null;
            }
        } catch (e) {
            warnLog('[getTitle]', e)
            return null;
        }
    }

    // 设置点位编码
    setIndexCode(index, value) {
        try {
            this.playInfos[index]['indexCode'] = value;
            this.update();
        } catch (e) {
            warnLog('[setIndexCode]', e)
        }
    }

    // 获取点位编码
    getIndexCode(index) {
        try {
            return this.playInfos[index]['indexCode'];
        } catch (e) {
            warnLog('[getIndexCode]', e)
            return null;
        }
    }

    // 设置播放器是否就绪
    setPlayerReady(index, value) {
        try {
            this.playInfos[index][this.extraKey]['playerReady'] = value;
            this.update();
        } catch (e) {
            warnLog('[setPlayerReady]', e)
        }
    }

    // 获取播放器是否就绪
    getPlayerReady(index) {
        try {
            const s = this.getWndStatus(index, 'status');
            if (this.isEmptyWnd(index)) {
                return true;
            } else {
                return PLAYER_STATUS_MAP.DOPLAYED !== s;
            }
        } catch (e) {
            warnLog('[getPlayerReady]', e)
            return null;
        }
    }

    // 再次请求过了吗
    isAlreadyPlaybackAgain(index) {
        try {
            return this.playInfos[index][this.extraKey]['isPlaybackAgain'] === true;
        } catch (e) {
            warnLog('[getIsPlaybackAgain]', e)
            return false;
        }
    }

    // 获取回放是否重新请求过
    getIsPlaybackAgain(index) {
        try {
            return this.playInfos[index][this.extraKey]['isPlaybackAgain'];
        } catch (e) {
            warnLog('[getIsPlaybackAgain]', e)
            return false;
        }
    }

    // 设置是否是已经重新请求过回放
    setIsPlaybackAgain(index, value) {
        try {
            this.playInfos[index][this.extraKey]['isPlaybackAgain'] = value
        } catch (e) {
            warnLog('[getIsPlaybackAgain]', e)
            return false;
        }
    }

    // 获取点位记录的权限
    getPointAuth(index, resolve) {
        const hasAllAuth = this.playInfos[index][this.extraKey]['hasAllAuth']
        const hasAuth = this.playInfos[index][this.extraKey]['hasAuth']
        resolve && resolve(hasAllAuth, hasAuth)
    }

    // 设置点位拥有所有权限
    setHasAllAuth(index, value) {
        try {
            this.playInfos[index][this.extraKey]['hasAllAuth'] = value;
            this.update();
        } catch (e) {
            warnLog('[setHasAuth]', e)
        }
    }

    // 获取点位拥有所有权限
    getHasAllAuth(index) {
        try {
            return this.playInfos[index][this.extraKey]['hasAllAuth'];
        } catch (e) {
            warnLog('[getHasAuth]', e)
            return null;
        }
    }

    // 设置点位权限
    setHasAuth(index, value) {
        try {
            this.playInfos[index][this.extraKey]['hasAuth'] = value;
            this.update();
        } catch (e) {
            warnLog('[setHasAuth]', e)
        }
    }

    // 获取点位权限
    getHasAuth(index) {
        try {
            return this.playInfos[index][this.extraKey]['hasAuth'];
        } catch (e) {
            warnLog('[getHasAuth]', e)
            return null;
        }
    }

    // 是否有能力集
    hasCapability(index, capability) {
        return this.getCapability(index).some(c => c === capability);
    }

    // 根据后端返回的数据设置点位能力集
    // reqStrData格式为: 比如"@event_frequent_person@face_contrast_trigger@heatmap@"
    setCapabilityByReqData(index, reqStrData, sign = '@') {
        try {
            const r = reqStrData && reqStrData.split(sign);
            if (r) {
                this.setCapability(index, r.filter(c => !!c));
            }
        } catch (e) {
            warnLog('[setCapability]', e)
        }
    }

    // 设置点位能力集
    setCapability(index, value) {
        try {
            this.playInfos[index][this.extraKey]['capability'] = value;
            this.update();
        } catch (e) {
            warnLog('[setCapability]', e)
        }
    }

    // 获取点位能力集
    getCapability(index) {
        try {
            return this.playInfos[index][this.extraKey]['capability'];
        } catch (e) {
            warnLog('[getCapability]', e)
            return null;
        }
    }

    // 设置缩略图
    setThumbnail(index, value) {
        try {
            this.playInfos[index][this.extraKey]['thumbnail'] = value;
            this.update();
        } catch (e) {
            warnLog('[setThumbnail]', e)
        }
    }

    // 获取缩略图
    getThumbnail(index) {
        try {
            return this.playInfos[index][this.extraKey]['thumbnail'];
        } catch (e) {
            warnLog('[getThumbnail]', e)
            return null;
        }
    }

    // 播放器控件之切换status
    switchActionStatus(index) {
        try {
            const current = this.getStatus(index);
            const indexCode = this.getIndexCode(index);
            this.setStatus(index, current === PLAYER_MODE_MAP.PREVIEW.value ? PLAYER_MODE_MAP.PLAYBACK.value : PLAYER_MODE_MAP.PREVIEW.value);
            this.setCachePointsByIndexCode(indexCode, {status: this.getStatus(index)})
        } catch (e) {
            warnLog('[switchActionStatus]', index, e);
        }
    }

    // 初始化播放器的控件状态
    initAction() {
        this.getPlayInfos().forEach((playInfo, i) => {
            this.resetAction(i, false, false);
        });
        this.update();
    }

    // 重置action的激活状态
    resetActionActive(indexOrList) {
        const activeActions = Object.keys(ACTION).filter(c => c.indexOf('_ABILITY') < 0 && c.indexOf('_AUTH') < 0);
        if (typeof indexOrList === 'undefined') {
            this.getPlayInfos().forEach((playInfo, i) => {
                activeActions.forEach((k) => {
                    this.setAction(i, ACTION[k], false);
                });
            });
        } else {
            if (Array.isArray(indexOrList)) {
                indexOrList.forEach((playInfo, i) => {
                    activeActions.forEach((k) => {
                        this.setAction(i, ACTION[k], false);
                    });
                });
            } else {
                activeActions.forEach((k) => {
                    this.setAction(indexOrList, ACTION[k], false);
                });
            }
        }
    }

    // 批量重置action
    resetAction(index, value = false, updateFlag = true) {
        try {
            Object.keys(this.getAction(index)).forEach((k) => {
                this.setAction(index, k, value, false);
            });
            updateFlag && this.update();
        } catch (e) {
            warnLog('[index][value]', index, value, e);
        }
    }

    // 设置播放器控件
    setAction(index, keyOrObj, value, updateFlag = true) {
        try {
            if (typeof value === 'undefined' && typeof keyOrObj !== 'string') {
                this.playInfos[index][this.extraKey]['action'] = Object.assign(this.playInfos[index][this.extraKey]['action'], keyOrObj);
            } else {
                let action = deepClone(this.getAction(index));
                Object.assign(action, { [keyOrObj]: value });
                // 目前只能设置3层，暂未知原因。
                // this.playInfos[index][this.extraKey]['action'][keyOrObj] 错误写法，原因未知
                this.playInfos[index][this.extraKey]['action'] = action;
            }
            updateFlag && this.update();
        } catch (e) {
            warnLog('[index][key][value]', index, keyOrObj, value, e);
        }
    }

    // 通过key数组，批量设置播放器控件
    setActionByKeys(index, keys, value) {
        try {
            if (Array.isArray(keys)) {
                keys.forEach((k) => {
                    this.setAction(index, k, value, false);
                });
            } else {
                this.setAction(index, keys, value, false);
            }
            this.update();
        } catch (e) {
            warnLog('[setActionByKeys][index][key][value]', index, keys, value, e);
        }
    }

    // 获取action中非auth的字段集
    getActionOfBtnPress() {
        return Object.keys(ACTION).filter(c => c.indexOf('_AUTH') < 0).map(k => ACTION[k]);
    }

    // 获取播放器控件
    getAction(index, key) {
        try {
            if (typeof key === 'undefined') {
                return this.playInfos[index][this.extraKey]['action'];
            } else {
                return this.playInfos[index][this.extraKey]['action'][key];
            }
        } catch (e) {
            warnLog('[getAction][index][key]', index, key, e);
            return null;
        }
    }

    // 获取窗格对象
    getWndStatus(index, key) {
        try {
            if (typeof index === 'undefined' && typeof key === 'undefined') {
                return this.playInfos.map(c => {
                    return c[this.extraKey]['wndStatus'];
                });
            } else if (typeof key === 'undefined') {
                return this.playInfos[index][this.extraKey]['wndStatus'];
            } else {
                return this.playInfos[index][this.extraKey]['wndStatus'][key];
            }
        } catch (e) {
            warnLog('[getWndStatus][index][key]', index, key, e);
            return null;
        }
    }

    // 重置窗口状态
    resetWndStatus(index) {
        try {
            this.setExtra(index, 'wndStatus', deepClone(PLAYER_EXTRA_PARAMS.wndStatus));
        } catch (e) {
            warnLog('[resetWndStatus]', e);
        }
    }

    // 设置窗格对象
    setWndStatus(index, keyOrObj, value) {
        try {
            if (typeof value === 'undefined' && typeof keyOrObj !== 'string') {
                this.playInfos[index][this.extraKey]['wndStatus'] = Object.assign(this.playInfos[index][this.extraKey]['wndStatus'], keyOrObj);
            } else {
                let wndStatus = deepClone(this.getWndStatus(index));
                Object.assign(wndStatus, { [keyOrObj]: value });
                this.playInfos[index][this.extraKey]['wndStatus'] = wndStatus;
            }
            this.update();
        } catch (e) {
            warnLog('[setWndStatus]', index, keyOrObj, value, e);
        }
    }

    // 获取浓缩播放数据
    getConcentrate(index, key) {
        try {
            if (typeof key === 'undefined') {
                return deepClone(this.playInfos[index][this.extraKey]['concentrate']);
            } else {
                return this.playInfos[index][this.extraKey]['concentrate'][key];
            }
        } catch (e) {
            warnLog('[getConcentrate][index][key]', index, key, e);
            return null;
        }
    }

    // 设置浓缩播放数据
    setConcentrate(index, objOrKey, value) {
        try {
            if (typeof value === 'undefined' && typeof objOrKey !== 'string') {
                this.playInfos[index][this.extraKey]['concentrate'] = Object.assign(this.playInfos[index][this.extraKey]['concentrate'], objOrKey);
            } else {
                let concentrate = deepClone(this.getWndStatus(index));
                Object.assign(concentrate, { [objOrKey]: value });
                this.playInfos[index][this.extraKey]['concentrate'] = concentrate;
            }
            this.update();
        } catch (e) {
            warnLog('[setConcentrate][index]', index, e);
        }
    }

    // 通过点位indexCode设置浓缩播放数据
    setConcentrateByIndexCode(indexCode, objOrKey, value) {
        let params = {}; // 最终使用的参数，避免过多无用参数，只获取内部使用参数
        const K = Object.keys(PLAYER_EXTRA_PARAMS.concentrate);
        const playInfos = this.getPlayInfos();
        const index = playInfos.findIndex(c => indexCode === c.indexCode);
        if (typeof value === 'undefined' && typeof objOrKey !== 'string') {
            K.forEach((k) => {
                params[k] = objOrKey[k];
            });
        } else {
            params[objOrKey] = value;
        }
        this.setConcentrate(index, params);
    }

    // 清空浓缩播放定时器
    // 传参index则定向清理下标为index的，不传参则全部清理
    clearConcentrateInterval(index) {
        if (typeof index === 'undefined') {
            this.playInfos.forEach((c) => {
                const temp = c[this.extraKey]
                temp && temp.hasOwnProperty('intervalId') && clearInterval(temp.intervalId);
            })
        } else {
            const temp = this.playInfos[index][this.extraKey];
            temp && temp.hasOwnProperty('intervalId') && clearInterval(temp.intervalId);
        }
    }

    /**
     * 获取剩余试看次数
     * @return {String} 返回lastMinTimes的键名
     */
    getLastMinTimes() {
        return this.lastMinTimes;
    }

    /**
     * 获取播放器内部外加参数Key
     * @return {String} 返回extraKey的键名
     */
    getExtraKey() {
        return this.extraKey;
    }

    /**
     * 获取播放器外部外加参数Key
     * @return {String} 返回extraParamsKey的键名
     */
    getExtraParamsKey() {
        return this.extraParamsKey;
    }

    /**
     * 获取H5播放器参数Key
     * @return {String} 返回h5ParamsKey的键名
     */
    getH5ParamsKey() {
        return this.h5ParamsKey;
    }

    /**
     * 获取能力集参数Key
     * @return {String} 返回capabilitySetKey的键名
     */
    getCapabilitySetKey() {
        return this.capabilitySetKey;
    }

    /**
     * 设置H5预览参数集合，用于发送请求时，选定哪些参数会被发送
     * @param {Array} value - queryH5PreviewParamKeys，决定最终H5预览接口参数获取哪些字段
     */
    setQueryH5PreviewParamKeys(value) {
        this.queryH5PreviewParamKeys = value;
    }

    /**
     * 设置H5回放参数集合，用于发送请求时，选定哪些参数会被发送
     * @param {Array} value - queryH5PlaybackParamKeys，决定最终H5回放接口参数获取哪些字段
     */
    setQueryH5PlaybackParamKeys(value) {
        this.queryH5PlaybackParamKeys = value;
    }

    /**
     * 获取H5预览参数集
     * @return {Array} queryH5PreviewParamKeys 返回预览参数Key值集合
     */
    getQueryH5PreviewParamKeys() {
        return this.queryH5PreviewParamKeys;
    }

    /**
     * 获取H5回放参数集
     * @return {Array} queryH5PlaybackParamKeys 返回回放参数Key值集合
     */
    getQueryH5PlaybackParamKeys() {
        return this.queryH5PlaybackParamKeys;
    }

    /**
     * 设置h5参数
     * @param {Number} index - 窗口下标
     * @param {Object|String} keyOrObj - 对象或者键
     * @param {Object} value - 字符串
     */
    setH5Params(index, keyOrObj, value) {
        if (typeof value === 'undefined' && typeof keyOrObj !== 'string') {
            this.playInfos[index][this.getH5ParamsKey()] = Object.assign(this.getH5Params(index), keyOrObj);
        } else {
            this.playInfos[index][this.getH5ParamsKey()][keyOrObj] = value;
        }
    }

    /**
     * 获取H5回放查询参数
     * @param {Number} index - 窗口下标
     * @return {Object} 返回H5回放查询参数对象
     */
    getH5PlaybackApiParams(index) {
        let p = {};
        const K = this.getQueryH5PlaybackParamKeys();
        const params = this.getH5Params(index);
        Object.keys(params).forEach((k) => {
            if (K.includes(k)) {
                p[k] = params[k];
            }
        });
        infoLog('you enter params is', params, 'h5 playback api all params keys has ', K, 'finally params is ', p, ' by all params filter H5Params');
        return p;
    }

    /**
     * 获取H5预览查询参数
     * @param {Number} index - 窗口下标
     * @return {Object} 返回H5预览查询参数对象
     */
    getH5PreviewApiParams(index) {
        let p = {};
        const K = this.getQueryH5PreviewParamKeys();
        const params = this.getH5Params(index);
        Object.keys(params).forEach((k) => {
            if (K.includes(k)) {
                p[k] = params[k];
            }
        });
        infoLog('you enter params is', params, 'h5 preview api all params keys has ', K, 'finally params is ', p, ' by all params filter H5Params');
        return p;
    }

    /**
     * 当前是取流失败了吗
     * @param {Number} index - 窗口下标
     * @return {Boolean} 是否是H5窗口加载流失败，true为失败。
     */
    isH5Fail(index) {
        const fail = this.getH5FailData(index);
        return fail && isNotEmpty(fail.code) && ![0, '0'].includes(fail.code);
    }

    /**
     * 获取当前H5窗口的错误信息
     * @param {Number} index - 窗口下标
     * @return {Object} 返回h5FailData对象
     */
    getH5FailData(index) {
        const isH5 = this.isH5Player();
        const isPreview = this.isPreview(index);
        const key = isPreview ? 'previewFail' : 'playbackFail';
        if (isH5) {
            return this.getH5Params(index, key);
        }
        return null;
    }

    /**
     * 获取h5参数
     * @param {Number} index - 窗口下标
     * @param {String} key - 键
     * @return {Object} 返回获取h5参数键的值
     */
    getH5Params(index, key) {
        try {
            if (typeof key === 'undefined') {
                return deepClone(this.playInfos[index][this.getH5ParamsKey()]);
            } else {
                return deepClone(this.playInfos[index][this.getH5ParamsKey()][key]);
            }
        } catch (e) {
            infoLog('[getH5Params]', e);
            return deepClone(H5_PARAMS);
        }
    }

    /**
     * 获取H5环境是否就绪布尔值
     * @return {Boolean} 布尔值，H5播放器环境信息是否就绪。
     */
    getH5EnvReady() {
        return this.h5EnvReady;
    }

    /**
     * 设置h5环境是否就绪
     * @param {Boolean} value - H5播放器环境信息是否就绪
     */
    setH5EnvReady(value) {
        this.h5EnvReady = value;
    }

}
