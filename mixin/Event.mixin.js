import {EVENT_TYPE, PLAYER_STATUS_MAP} from "./../lib/params.lib";
import {warnLog} from "./../util/logger";
import {isNotEmpty} from "./../util";

/**
 * @function
 * @description 播放器事件
 * @author lixiaodong31 2023/10/17
 * @version 1.0.0
 * @example
 */
export const EventMixin = {
    props: {
        receive: {
            type: Function,
            default() {
                return null;
            }
        }
    },
    mounted() {

    },
    methods: {
        eventEmit(type, params, callback) {
            // - type - 事件类型
            // - params - 事件抛出参数
            // - params - 一定包含selectWnd，screen，list，currentPage，pages
            // - params - 可能包含index，status，wnd，item等
            // - callback - 事件回调（针对部分场景）
            // - EVENT_TYPE - 类型字典数据（方便调用者获取所有事件类型）
            this.receive && this.receive(type, this.getStandardParams(params), callback, EVENT_TYPE);
        },
        /**
         * 获取统一的返回值。包含selectWnd,screen,list,currentPage,pages,index,status,wnd,item等
         * @param {Object} params - 参数
         * @return {Object} 标准事件参数
         * @author lixiaodong31 2024/3/22
         * @version 1.0.0
         */
        getStandardParams(params) {
            const currentPoints = this.simplePlayerData.getCurrentPagePoint();
            const currentPagePoints = currentPoints && Array.isArray(currentPoints) && currentPoints.filter(c => isNotEmpty(c.indexCode));
            let p = {
                selectWnd: this.simplePlayerData.getSelectedWnd(),
                screen: this.simplePlayerData.getCurrentScreen(),
                list: this.simplePlayerData.getPlayInfoCopy(),
                currentPage: this.simplePlayerData.getCurrentPagePoint(),
                pages: {
                    ...this.simplePlayerData.getPagination(),
                    currentPagePointsNum: currentPagePoints && currentPagePoints.length || 0,
                }
            };
            if (isNotEmpty(params)) {
                const {index} = params || {};
                if (isNotEmpty(index)) {
                    p = Object.assign(p, {
                        index,
                        status: this.simplePlayerData.getWndStatus(index),
                        wnd: this.simplePlayerData.getWndStatus(index),
                        item: this.simplePlayerData.getPlayInfosForOuterByIndex(index),
                    });
                }
                return Object.assign(p, params);
            }
            return p;
        },
        // 图层中的事件
        layerChangeHandle(type, params, callback) {
            // 处理播放器内部相关逻辑
            this.dealInnerEvent(type, params, callback);
            this.eventEmit(type, params, callback);
        },
        // 处理事件中涉及到内部的逻辑
        dealInnerEvent(type, params) {
            switch (type) {
                case EVENT_TYPE.APPLY_AUTH_OPENED: // 单次试看结束
                    warnLog(`listen event ${type}，do killing video stream! `);
                    const {index} = params;
                    if (this.simplePlayerData.isPlaybackNow(index)) {
                        this.callStopPlayback(index);
                    } else {
                        this.callStopPlay(index);
                    }
                    break;
                case EVENT_TYPE.REFRESH:
                    const {index: index1} = params;
                    this.simplePlayerData.setWndStatus(index1, PLAYER_STATUS_MAP.DOPLAYED);
                    if (this.simplePlayerData.isPlaybackNow(index1)) {
                        this.callStopPlay(index1); // 销毁历史窗口的流
                        this.callStartPlayback(index1);
                    } else {
                        this.callStopPlayback(index1); // 销毁历史窗口的流
                        this.callStartPlay(index1);
                    }
                    break;
            }
            // 刷新播放器foot
            this.updateFooterKey();
        },
    }
}
