import {EVENT_TYPE, LOOP_TIME_OPTIONS, PLAYER_MODE_MAP} from "./../lib/params.lib";
import {errorLog, infoLog, warnLog} from "./../util/logger";
import {isNotEmpty, secToMin} from "./../util";
import {API_METHOD_MAP} from "./../mixin/ApiProps.mixin";
import {pauseOrContinue} from "@/components/simple-player/lib/cc.lib";

/**
 * @function
 * @description 播放器组件 对外开放公共方法，不区分播放器类型。
 * @author lixiaodong31 2023/9/22
 * @version 1.0.0
 * @example
 */
export const OpenApiCommonMixin = {
    methods: {
        /**
         * @function
         * @description 设置轮询选中项
         * @param {Object} obj - 设置项
         * @version 1.0.0
         * @example
         */
        doSetLoopTime(obj) {
            try {
                if (this.simplePlayerData.isLoopTimeValid(obj.value, obj.unit)) {
                    const index = LOOP_TIME_OPTIONS.findIndex(c => c.value === obj.value && c.unit === obj.unit);
                    if (index >= 0) {
                        this.simplePlayerData.setToolBarCurrentValue(LOOP_TIME_OPTIONS[index]);
                    } else {
                        this.simplePlayerData.setToolBarCurrentValue(secToMin(obj));
                    }
                } else {
                    this.simplePlayerData.setToolBarCurrentValue(LOOP_TIME_OPTIONS[0]);
                }
                this.updateTimeInterval && this.updateTimeInterval(); // 主动更新时间选择器
            } catch (e) {
                errorLog('[doSetLoopTime]', e);
            }
        },
        /**
         * @function
         * @param pointInfo - 点位数据，必须包含indexCode
         * @description 改变选中窗格
         */
        doChangeSelectedWnd(pointInfo) {
            if (pointInfo && pointInfo.hasOwnProperty('indexCode') && pointInfo.indexCode) {
                const {indexCode} = pointInfo;
                const currentPagPoints = this.simplePlayerData.getCurrentPagePoint();
                const index = currentPagPoints.findIndex(c => c.indexCode === indexCode);
                const emptyWnd = this.simplePlayerData.getEmptyWnd(index);
                if (emptyWnd) { // 若数据状态是空窗口，则需要替换该窗口，走重新取流的路
                    this.doReplacePlay(pointInfo, index);
                    return;
                }
                if (index >= 0) this.playerWndClick(index);
                else warnLog('[doChangeSelectedWnd][this page has not this point][index, currentPagPoints, pointInfo]', index, currentPagPoints, pointInfo);
            } else {
                warnLog('[doChangeSelectedWnd][fail][pointInfo]', pointInfo);
            }
        },
        /**
         * @function
         * @param pointInfo - 点位数据，必须包含indexCode
         * @description 显示hover窗格
         */
        doHoverWnd(pointInfo) {
            if (pointInfo && pointInfo.hasOwnProperty('indexCode')) {
                const {indexCode} = pointInfo;
                const currentPagPoints = this.simplePlayerData.getCurrentPagePoint();
                const index = currentPagPoints.findIndex(c => c.indexCode === indexCode);
                if (index >= 0) this.playerWndHover(index);
                else this.playerWndHover(null);
            } else {
                warnLog('[doHoverWnd][fail][pointInfo]', pointInfo);
            }
        },
        /**
         * @function
         * @param loop - Boolean true是要打开，false要关闭，默认要打开
         * @description 启动自动轮询
         */
        doAutoLoop(loop = true) {
            this.simplePlayerData.setLoop(!loop);
            const size = this.simplePlayerData.getPagination('size');
            if (size > 1) {
                this.callAutoLoop();
            }
            this.eventEmit(EVENT_TYPE.FIRST_PAGE); // 默认抛出当前页
        },
        /**
         * @function
         * @description 可复用播放。添加一批点位，优先复用当前屏中的点，替换其他点
         */
        async doReusablePlay(points) {
            if (isNotEmpty(points) && Array.isArray(points) && points.length) {
                const screen = this.simplePlayerData.getCurrentScreen();
                const res = points.slice(0, screen);
                const currentPagePoints = this.simplePlayerData.getCurrentPagePoint();
                const resArr = res.map(c => c.indexCode);
                const diffArr = currentPagePoints.filter(c => !resArr.includes(c));
                const waitAddArr = res.filter(c => diffArr.includes(c.indexCode));
                let index = 0; // 记录游标
                if (diffArr.length) { // 存在不同点
                    for (const c of currentPagePoints) {
                        const i = currentPagePoints.indexOf(c); // 遍历窗格，保证按序
                        if (diffArr.includes(c.indexCode)) {
                            await this.doReplacePlay(waitAddArr[index], i);
                            index++;
                        }
                    }
                } else {
                    infoLog('[doReusablePlay][current no need replace any point]');
                    res && res[0] && this.doChangeSelectedWnd(res[0]);
                }
            } else {
                errorLog('[doReusablePlay][fail][points]', points);
            }
        },
        /**
         * @function
         * @description 锚定点位
         * @param {Object} point - 点位对象
         * @version 1.0.0
         * @example
         */
        doAnchorPoint(point) {
            const {indexCode} = point;
            const pageNo = this.simplePlayerData.getPageNoByIndexCode(indexCode);
            infoLog('jump page no is', pageNo);
            this.simplePlayerData.goPage(pageNo, async (nextPoints) => {
                if (nextPoints && nextPoints.length) {
                    // 此处调用父级，也就是播放器层的方法
                    await this._doReplaceBatchPlay(nextPoints);
                    // 切换到锚点定位选中项
                    this.doChangeSelectedWnd(point);
                    // 抛出事件
                    this.eventEmit(EVENT_TYPE.GO_PAGE, {list: nextPoints});
                }
            }, () => {
                infoLog('point is exits in this page, point data is ', point);
                // 切换到锚点定位选中项
                this.doChangeSelectedWnd(point);
            });
        },
        doClear() {
            this.closeAllHandle();
            this.simplePlayerData.setCachePoints();
            this.simplePlayerData.init();
            this.fleshConfig(); // init之后先要刷新配置项
            infoLog('doClear ing...');
        },
        /**
         * 暂停或继续播放
         * @param index
         * @param callback
         * @param params
         */
        doPauseOrContinue(index, callback, params) {
            this.pauseOrContinue(index, callback, params);
        },
        /**
         * @function
         * @description 以config的方式开始播放(预览)
         * @param {Array} pointInfos - 点位数据
         * @param {Object} config - 播放参数配置项（轮播时间、几分屏）{ screen, loopTime }
         * @example
         * - 1、缓冲外部传入的基本数据
         * - 2、生成播放器所要加载的数据
         * - 3、设置点位数据到播放器对象中
         * - 4、初始化权限部分(可自定义设置)
         * - 5、开始播放
         * @example 该方法可以做到指定4分屏，轮播时间为20秒的方式开始播放
         */
        async doPlayByConfig(pointInfos, config) {
            // 缓冲外部传入的点位
            if (typeof pointInfos !== 'undefined') this.simplePlayerData.setCachePoints(pointInfos);
            const cachePoints = this.simplePlayerData.getCachePoints();
            // 获取当前分屏数、轮播间隔，并设置.
            const {screen, loopTime} = config;
            if (isNotEmpty(screen)) this.simplePlayerData.setCurrentScreen(screen);
            else this.doScreenAuto(cachePoints);
            if (isNotEmpty(loopTime)) this.doSetLoopTime(loopTime);
            // 设置即将要展示的点位
            const current = this.simplePlayerData.getCurrentPagePoint();
            this.simplePlayerData.updatePlayInfos(current);
            this.simplePlayerData.setGlobalStatusPreview();
            const apiReq = this.hasApi(API_METHOD_MAP.QUERY_PREVIEW_AUTH_API) ? this.checkPointAuthOfPreviewApi : this.checkPointAuthOfPreview;
            apiReq(current, (index, canPlay) => {
                // 是否属于删除数据
                const isDelete = this.simplePlayerData.getIsDelete(index);
                // 对于有权限且非删除数据的，则播放
                if (!isDelete && canPlay) this.callStartPlay(index);
                this.fleshLayer(index);
                this.eventEmit(EVENT_TYPE.BATCH_PREVIEW, {index});
                if (index === 0) this.playerWndClick(index); // 默认选中第一个窗口
            });
        },
        /**
         * @function
         * @description 开始播放(预览),不传参则默认刷新
         *
         * - 1、缓冲外部传入的基本数据
         * - 2、生成播放器所要加载的数据
         * - 3、设置点位数据到播放器对象中
         * - 4、初始化权限部分(可自定义设置)
         * - 5、开始播放
         */
        async doPlay(pointInfos) {
            // 缓冲外部传入的点位
            if (typeof pointInfos !== 'undefined') {
                this.simplePlayerData.setCachePoints(pointInfos.map(c => ({
                    ...c,
                    status: PLAYER_MODE_MAP.PREVIEW.value
                })));
            }
            const cachePoints = this.simplePlayerData.getCachePoints();
            // 获取当前自适应分屏数，并设置.
            // 当前仅当非刷新下，才会自动分屏
            if (typeof pointInfos !== 'undefined') this.doScreenAuto(cachePoints);
            // 设置即将要展示的点位
            const current = this.simplePlayerData.getCurrentPagePoint();
            this.simplePlayerData.updatePlayInfos(current);
            this.simplePlayerData.setGlobalStatusPreview();
            const apiReq = this.hasApi(API_METHOD_MAP.QUERY_PREVIEW_AUTH_API) ? this.checkPointAuthOfPreviewApi : this.checkPointAuthOfPreview;
            apiReq(current, (index, canPlay) => {
                // 是否属于删除数据
                const isDelete = this.simplePlayerData.getIsDelete(index);
                // 对于有权限且非删除数据的，则播放
                if (!isDelete && canPlay) this.callStartPlay(index);
                this.fleshLayer(index);
                this.eventEmit(EVENT_TYPE.BATCH_PREVIEW, {index});
                if (index === 0) this.playerWndClick(index); // 默认选中第一个窗口
            });
        },
        // 不改变缓冲的基础上，批量替换播放
        doReplaceBatchPlay(pointInfos) {
            this._doReplaceBatchPlay(pointInfos)
        },
        /**
         * @function
         * @description 赋值权限
         * @param {Array} pointInfos - 点位数据
         * @example
         */
        doAddAuth(pointInfos) {
            // 1、更新到缓冲数据中（全量）
            this.simplePlayerData.updateCache(pointInfos);
            // 2、更新到当前屏中（全量）
            this.simplePlayerData.updatePlayInfosByIndexCode(pointInfos);
            // 3、检测各个窗口播放状态，并处理（当前屏）
            const current = this.simplePlayerData.getCurrentPagePoint();
            // TODO 需要验证这个代码存在的必要性
            // this.checkScreenPlay(current, () => {
            //     // 4、刷新
            //     this.fleshLayersByScreen();
            // });
        },
        /**
        * 按照配置项回放
        * @param {Object} pointInfos - 点位数据
        * @param {Object} config - 配置项
        * @author lixiaodong31 2024/9/30
        * @version 1.0.0
        */
        async doPlaybackByConfig(pointInfos, config) {
            // 缓冲外部传入的点位
            if (typeof pointInfos !== 'undefined') {
                this.simplePlayerData.setCachePoints(pointInfos.map(c => ({
                    ...c,
                    status: PLAYER_MODE_MAP.PLAYBACK.value
                })));
            }
            const cachePoints = this.simplePlayerData.getCachePoints();
            // 获取当前分屏数、轮播间隔，并设置.
            const {screen, loopTime} = config;
            if (isNotEmpty(screen)) this.simplePlayerData.setCurrentScreen(screen);
            else this.doScreenAuto(cachePoints);
            if (isNotEmpty(loopTime)) this.doSetLoopTime(loopTime);
            // 设置即将要展示的点位
            const current = this.simplePlayerData.getCurrentPagePoint();
            this.simplePlayerData.updatePlayInfos(current);
            this.simplePlayerData.setGlobalStatusPlayback();
            const apiReq = this.hasApi(API_METHOD_MAP.QUERY_PLAYBACK_AUTH_API) ? this.checkPointAuthOfPlaybackApi : this.checkPointAuthOfPlayback;
            apiReq(current, (index, canPlay) => {
                // 是否属于删除数据
                const isDelete = this.simplePlayerData.getIsDelete(index);
                // 对于有权限且非删除数据的，则播放
                if (!isDelete && canPlay) this.callStartPlayback(index);
                this.fleshLayer(index);
                this.eventEmit(EVENT_TYPE.BATCH_PLAYBACK, {index});
                if (index === 0) this.playerWndClick(index); // 默认选中第一个窗口
            });
        },
        /**
         * @function
         * @description 批量回放,不传参则默认刷新
         */
        async doPlayback(pointInfos) {
            // 缓冲外部传入的点位
            if (typeof pointInfos !== 'undefined') {
                this.simplePlayerData.setCachePoints(pointInfos.map(c => ({
                    ...c,
                    status: PLAYER_MODE_MAP.PLAYBACK.value
                })));
            }
            const cachePoints = this.simplePlayerData.getCachePoints();
            // 获取当前自适应分屏数，并设置
            if (typeof pointInfos !== 'undefined') this.doScreenAuto(cachePoints);
            // 设置即将要展示的点位
            const current = this.simplePlayerData.getCurrentPagePoint();
            this.simplePlayerData.updatePlayInfos(current);
            this.simplePlayerData.setGlobalStatusPlayback();
            const apiReq = this.hasApi(API_METHOD_MAP.QUERY_PLAYBACK_AUTH_API) ? this.checkPointAuthOfPlaybackApi : this.checkPointAuthOfPlayback;
            apiReq(current, (index, canPlay) => {
                // 是否属于删除数据
                const isDelete = this.simplePlayerData.getIsDelete(index);
                // 对于有权限且非删除数据的，则播放
                if (!isDelete && canPlay) this.callStartPlayback(index);
                this.fleshLayer(index);
                this.eventEmit(EVENT_TYPE.BATCH_PLAYBACK, {index});
                if (index === 0) this.playerWndClick(index); // 默认选中第一个窗口
            });
        },
        /**
         * @function
         * @description 播放一个点位(预览或者回放)
         * 添加是在一个空窗口上添加一个点位。
         */
        async doAddPlay(pointInfo, _index) {
            const findIndex = this.simplePlayerData.getCachePoints().findIndex(c => c.indexCode === pointInfo.indexCode);
            // 存在点位，则替换
            if (findIndex >= 0) {
                // 替换到当前_index窗口播放
                await this.doReplacePlay(pointInfo, _index);
            } else { // 不存在，则添加
                this.simplePlayerData.addCachePoint(pointInfo);
                // 设置即将要展示的点位
                const current = this.simplePlayerData.getCurrentPagePoint();
                this.simplePlayerData.updatePlayInfos(current);
                const apiReq = this.hasApi([
                    API_METHOD_MAP.QUERY_PLAYBACK_AUTH_API,
                    API_METHOD_MAP.QUERY_PREVIEW_AUTH_API,
                ]) ? this.checkPointAuthApi : this.checkPointAuth;
                apiReq(current, (index, canPlay) => {
                    this.windowClick(this.selectedWnd);
                    // 是否属于删除数据
                    const isDelete = this.simplePlayerData.getIsDelete(index);
                    // 对于有权限且非删除数据的，则播放
                    if (this.simplePlayerData.isPreviewStatus(index)) {
                        if (!isDelete && canPlay) this.callStartPlay(index);
                        this.eventEmit(EVENT_TYPE.SINGLE_PREVIEW, {index});
                    } else {
                        if (!isDelete && canPlay) this.callStartPlayback(index);
                        this.eventEmit(EVENT_TYPE.SINGLE_PLAYBACK, {index});
                    }
                    this.fleshLayer(index);
                });
            }
        },
        /**
         * @function
         * @description 替换到当前选中（无选中则指定_index替换）窗口
         * - 替换原则：
         * - 1）不允许在同一屏下添加重复点（如果添加重复点则锚点到该点处）
         * - 2）替换到某个窗口前，一定会先从缓冲中读取，无则新增缓冲数据
         * - 3）无缓冲存在情况下，添加点位会丢失历史的权限信息
         */
        async doReplacePlay(pointInfo, _index, playStatus) {
            // 目标窗口下标
            const index = isNotEmpty(_index) ? _index : this.simplePlayerData.getSelectedWnd();
            // 当前选中窗口是否是空窗口
            const isEmptyWnd = this.simplePlayerData.isEmptyWnd(index);
            // 优先缓冲中匹配，无则新增
            let cache = this.simplePlayerData.getCachePointByIndexCode(pointInfo.indexCode);
            if (isEmptyWnd && isNotEmpty(cache)) {
                // 这种情况不做任何处理，属于清屏后又添加点位情况
            } else if (isNotEmpty(cache) && typeof _index === 'undefined') {
                this.doAnchorPoint(pointInfo);
                return; // 无指定下标且缓冲中存在该数据，则锚点定位，不替换参考注释【原则1】
            } else if (!isNotEmpty(cache)) {
                this.simplePlayerData.addCachePointByIndex(index, pointInfo);
                cache = pointInfo;
            }
            this.callClearPlayer(index);
            this.simplePlayerData.updatePlayInfos(index, cache);
            const next = (index, _status, canPlay) => {
                // 是否属于删除数据
                const isDelete = this.simplePlayerData.getIsDelete(index);
                // 对于有权限且非删除数据的，则播放
                if (PLAYER_MODE_MAP.PREVIEW.value === _status) {
                    if (!isDelete && canPlay) this.callStartPlay(index);
                    this.eventEmit(EVENT_TYPE.SINGLE_PREVIEW, {index});
                }
                if (PLAYER_MODE_MAP.PLAYBACK.value === _status) {
                    if (!isDelete && canPlay) this.callStartPlayback(index);
                    this.eventEmit(EVENT_TYPE.SINGLE_PLAYBACK, {index});
                }
                this.fleshLayer(index);
            }
            const apiReq = this.hasApi([
                API_METHOD_MAP.QUERY_PLAYBACK_AUTH_API,
                API_METHOD_MAP.QUERY_PREVIEW_AUTH_API,
            ]) ? this.checkOnePointAuthApi : this.checkOnePointAuth;
            apiReq(index, pointInfo, (canPlay) => {
                this.windowClick(this.selectedWnd);
                if (isNotEmpty(playStatus)) {
                    next(index, playStatus, canPlay);
                    // 优先外部指定的方式预览或者回放
                    return;
                }
                // 对于有权限的则播放
                next(index, this.simplePlayerData.getStatus(index), canPlay);
            });
        },
        /**
         * 添加数据到缓冲
         * @param {Array | Object} arr - 点位数据
         * @author lixiaodong31 2024/9/4
         * @version 1.0.0
         */
        doAddCache(arr) {
            this.simplePlayerData.addCachePoint(arr);
        },
        /**
        * 更新刷新界面布局宽高重绘
        * @author lixiaodong31 2024/9/25
        * @version 1.0.0
        */
        doResize() {
            this.updateSimplePlayerWrapperHeight && this.updateSimplePlayerWrapperHeight();
            const isH5 = this.simplePlayerData.isH5Player();
            if (isH5) {
                this.updateH5PlayerSize && this.updateH5PlayerSize();
            }
        },
        /**
        * 切换预览回放
        * @param {String} type - 预览回放标识
        * @author lixiaodong31 2024/11/25
        * @version 1.0.0
        */
        doSwitch(type = 'preview') {
            if (type === 'preview') {
                this.simplePlayerData.setGlobalStatusPreview();
            } else {
                this.simplePlayerData.setGlobalStatusPlayback();
            }
            this.playStatusChangeHandle && this.playStatusChangeHandle();
        }
    }
}
