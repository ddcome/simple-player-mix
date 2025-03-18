import moment from 'moment';
import {API_METHOD_MAP} from "./ApiProps.mixin";
import {errorLog, warnLog} from "./../util/logger";
import {SPEED, SPEED_KEY} from "./../lib/params.lib";
import {deepClone} from "./../util";

/**
 * @function 浓缩播放
 * @description 浓缩播放模块强依赖playInfos数据中_concentrate
 * 浓缩播放方案：
 * 浓缩播放开启后，首先要求用户选择事件，前提条件是选定事件的情况下，根据时间段去查询浓缩片段；
 * 获取到录像片段后，调用播放器CC的回放2方法，触发播放；
 * 开始播放时，启动轮询，每1秒去查询当前帧时间点，和获取的浓缩片段比较，决定是否需要切换跳帧方案；
 * 跳帧方案有：
 * 1、只播放录像片段，遇到非录像片段时，则跳帧到下一个录像片段
 * 2、非录像片段16倍速播放，录像片段则正常播放
 * 关于播放最终是哪一个跳帧方案，这个取决于设备平台校时是否准确。
 * 准确的判断标准：第一次播放帧的位置是否是第一段录像片段的开始时间。
 * @return {String}
 * @author lixiaodong31 2023/8/14
 * @version 1.0.0
 * @example
 */
export const ConcentrateMixin = {
    data() {
        return {};
    },
    beforeDestroy() {
        this.destroyAllInterval();
    },
    methods: {
        // 获取数组间隔收尾，组合成新数组
        getArrayGap(_arr) {
            const arr = deepClone(_arr);
            if (!(Array.isArray(arr) && arr.length > 0)) return [];
            const resLen = arr.length - 1;
            let res = new Array(resLen).fill({
                startStamp: 0,
                start: '',
                endStamp: 0,
                end: ''
            });
            return res.map((c, i) => ({
                startStamp: arr[i]['endTimeStamp'],
                start: arr[i]['endTime'],
                endStamp: arr[i + 1]['beginTimeStamp'],
                end: arr[i + 1]['beginTime']
            }));
        },
        // 获取数组间隔收尾，组合成新数组
        getArrayGapSimple(arr) {
            if (!(Array.isArray(arr) && arr.length > 0)) return [];
            const resLen = arr.length - 1;
            return Array.from({length: resLen}, (v, i) => ({
                startStamp: arr[i]['endTimeStamp'],
                start: arr[i]['endTime'],
                endStamp: arr[i + 1]['beginTimeStamp'],
                end: arr[i + 1]['beginTime']
            }));
        },
        // 是否命中浓缩时间段
        // 如果命中则返回下一段视频的开始时间
        // 如果未命中，则返回null
        // 1、检测是否在录像片段首段前
        // 2、检测是否在录像片段尾段后
        // 3、检测录像片段间隔段内
        // 4、检测是否在录像片段间
        getNextPlayTime({index, currentOSDTime, list}, resolve) {
            try {
                // 检查非法参数
                if (typeof list === 'undefined' || !Array.isArray(list) || list.length === 0) resolve(null);
                const {beginTime, beginTimeStamp} = list[0];
                const {endTimeStamp} = list[list.length - 1];
                const gapArr = this.getArrayGapSimple(list);
                const gap = gapArr.find(c => c.startStamp < currentOSDTime && currentOSDTime < c.endStamp);
                const isInner = list.some(c => currentOSDTime <= c.endTimeStamp && currentOSDTime >= c.beginTimeStamp);
                if (currentOSDTime < beginTimeStamp) {
                    resolve(beginTime, 1);
                } else if (currentOSDTime > endTimeStamp) {
                    resolve(null, 2);
                } else if (isInner) {
                    resolve(null, 3);
                } else if (!!gap) {
                    resolve(gap.end, 4);
                } else {
                    resolve(null, 5);
                }
            } catch (e) {
                warnLog('when getNextPlayTime run, has error ', e);
            }
        },
        addStampForList(list) {
            if (Array.isArray(list))
                return JSON.parse(
                    JSON.stringify(
                        list.map(c => {
                            return {
                                beginTime: c.beginTime,
                                endTime: c.endTime,
                                beginTimeStamp: moment(c.beginTime).unix() * 1000,
                                endTimeStamp: moment(c.endTime).unix() * 1000
                            };
                        })
                    )
                );
            else return [];
        },
        // 检测当前时间准确性
        checkPlayerTime(index, list, OSDTime) {
            if (!(Array.isArray(list) && list.length > 0)) return false;
            const {beginTimeStamp} = list[0];
            return OSDTime === beginTimeStamp;

        },
        // 浓缩回放之跳帧方式
        playByNongsuo(index, firstTime = true) {
            const list = this.addStampForList(this.simplePlayerData.getConcentrate(index, 'list'));
            clearInterval(this.simplePlayerData.getConcentrate(index, 'intervalId'));
            this.simplePlayerData.setConcentrate(index, {
                doSpeed16PlayTimes: 0,
                doSpeedPlayTimes: 0,
            });
            // 轮询查询当前播放帧时间点
            let _id = setInterval(() => {
                try {
                    this.callGetOSDTime(index).then(res => {
                        if (res && res.OSDTime > 0) {
                            const currentOSDTime = res.OSDTime * 1000;
                            // 检测时间准确性
                            let isTimeRight = false;
                            if (firstTime) {
                                isTimeRight = this.checkPlayerTime(index, list, currentOSDTime);
                                firstTime = false; // 锁死
                            }
                            this.getNextPlayTime({index, currentOSDTime, list}, (time, type) => {
                                if (isTimeRight) {
                                    this.playByNongsuoMode(index, time);
                                } else {
                                    this.playByNongsuoMode2(index, time);
                                }
                            });
                        }
                    });
                } catch (e) {
                    infoLog('[playByNongsuo]', e);
                    clearInterval(_id);
                }
            }, 1000);
            this.simplePlayerData.setConcentrate(index, 'intervalId', _id);
        },
        // 仅仅播放浓缩录像片段
        playByNongsuoMode(index, time) {
            // 返回该跳转到的时间点
            if (time) {
                this.callSeekTime({strSeekTime: time});
            }
        },
        // 浓缩回放
        // 按照命中快进16否则正常播放的方式
        playByNongsuoMode2(index, time) {
            const p = this.simplePlayerData.getConcentrate(index);
            // 返回该跳转到的时间点
            // 若有值，则说明当前在非浓缩片段
            // 若无值，则说明当前在浓缩片段中
            if (!!time) {
                if (p.doSpeed16PlayTimes <= 1) {
                    this.callPlayBySpeed(index, {
                        bShowSpeedPlayWnd: false,
                        iPlayBackSpeed: SPEED[SPEED_KEY.S16]
                    });
                    this.simplePlayerData.setConcentrate(index, 'doSpeed16PlayTimes', p.doSpeed16PlayTimes + 1); // 执行speedPlay次数
                }
                this.simplePlayerData.setConcentrate(index, 'doSpeedPlayTimes', 0); // 执行speedPlay次数
            } else {
                if (p.doSpeedPlayTimes <= 1) {
                    this.callPlayBySpeed(index, {
                        bShowSpeedPlayWnd: false,
                        iPlayBackSpeed: SPEED[SPEED_KEY.S1]
                    });
                    this.simplePlayerData.setConcentrate(index, 'doSpeedPlayTimes', p.doSpeedPlayTimes + 1);
                }
                this.simplePlayerData.setConcentrate(index, 'doSpeed16PlayTimes', 0);
            }
        },
        // 销毁回放2中所有定时器
        destroyAllInterval() {
            const playInfos = this.simplePlayerData.getPlayInfos();
            playInfos.forEach((c, i) => {
                const _intervalId = this.simplePlayerData.getConcentrate(i, 'intervalId');
                _intervalId && clearInterval(_intervalId);
            });
        },
        // 查询回放2的入参
        queryPlayback2Info(params) {
            let res = {};
            return Promise.all([
                this.getApi(API_METHOD_MAP.QUERY_VIDEO_LABEL_API)(params),
                this.getApi(API_METHOD_MAP.QUERY_PLAYBACK_PARAM_API)(params)
            ]).then(([r1, r2]) => {
                if ([0, '0'].includes(r1.code) && [0, '0'].includes(r2.code)) {
                    res['list'] = r1.data; // 浓缩片段集合
                    res['startTime'] = moment(params.startTime).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
                    res['endTime'] = moment(params.endTime).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
                    res['url'] = r2.data.url; // 浓缩依赖的URL
                    res['streamDispatchMode'] = r2.data.streamDispatchMode; // 浓缩依赖的URL
                    return res;
                }
            });
        },
        // 开始执行浓缩播放
        startConcentrate(params) {
            try {
                const _playInfos = this.simplePlayerData.getPlayInfos();
                if (!(_playInfos && Array.isArray(_playInfos) && _playInfos.length > 0)) return;
                let playInfosCopy = deepClone(_playInfos);
                const next = (index) => {
                    if (this.callStartPlayback2) this.callStartPlayback2(index);
                    else errorLog('please define doPlayback method, if your vue file has not doPlayback method, Concentrate can not run normally ');
                };
                // 查询所有视频的浓缩播放数据
                for (let i = 0; i < playInfosCopy.length; i++) {
                    let item = playInfosCopy[i];
                    (async () => {
                        if (item && item.hasOwnProperty('indexCode') && item.indexCode) {
                            let res = await this.queryPlayback2Info(
                                Object.assign(params, {
                                    indexCode: item.indexCode
                                })
                            );
                            this.simplePlayerData.setConcentrateByIndexCode(item.indexCode, Object.assign(item, res));
                            next(i);
                        }
                    })(i);
                }
            } catch (e) {
                warnLog('start concentrate fail, check simplePlayerData object is right? has it defined?', e);
            }
        }
    }
};
