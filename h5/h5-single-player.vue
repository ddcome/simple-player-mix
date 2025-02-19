<template>
    <div class="h5-player-container" ref="h5SinglePlayerRef">
        <div
            class="h5-player-inner"
            :id-debug="id"
            :id="id"
            :class="(showTimeLine() && isPlayBack)?'has-timeline-height': 'full-height'"
        ></div>
        <div class="timeline-outer" v-if="showTimeLine() && isPlayBack">
            <timeline
                ref="timelineRef"
                :id="`timeline_${id}`"
                :key="updateKey"
                class="timeline-bar-outer"
                :style="{ bottom: isPlayBack?'0': '30px' }"
                :defaultZoom="5"
                :timeSegments="timeSegments"
                :height="40"
                :width="containerWidth()"
                @current-time="currentTimeHandle"
                @dbl-click="timelineDblClick"
            />
            <div class="right-btns">
                <i class="h-icon-calendar" title="重新选择回放时间" @click="dateRange"></i>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable no-debugger */
import {IS_DEV} from "./../lib/params.lib";
import {localTimeToISOTime, isNotEmpty, throttle} from "./../util";
import Timeline from './Timeline.vue';
import moment from "moment";
import {infoLog} from "./../util/logger";
import {getLoadJsPluginPath} from "./h5-load-script";

/**
 * @function
 * @description H5单播放器组件
 * @author lixiaodong31 2023/10/19
 * @version 1.0.0
 * @example
 */
export default {
    components: {Timeline},
    props: {
        id: {
            type: String,
            default: 'h5-player-default'
        },
        // 是否在开始播放时自动定位
        autoSeek: {
            type: Boolean,
            default: true
        },
        // （回放后）是否开启时间运行
        autoTimeRun: {
            type: Boolean,
            default: true
        },
    },
    data() {
        return {
            // 由于底层播放器本身支持分屏，所以存在index，本组件默认均为0，因为配置底层组件最大分屏数是1
            index: 0,
            isPlayBack: false,
            isMobile: false,
            player: null,
            config: null,
            timeSegments: [],
            video: {},
            speed: 1,
            playingTime: new Date(moment().add(-1, 'd').format('YYYY-MM-DD 00:00:00')).getTime(),
            updateKey: 1, // 更新时间轴索引
            observer: null,
            currentTimeHandle: throttle(this.timelineChange, 100)
        };
    },
    watch: {
        isPlayBack() {
            this.updateResize();
        }
    },
    mounted() {
        this.initConfig();
        this.create();
        this.initResizeEvent();
        this.initListener();
        this.initErrorEvent();
    },
    beforeDestroy() {
        this.destroyResizeEvent();
        this.destroy();
        this.destroyListener();
    },
    methods: {
        dateRange() {
            this.$emit('date-range');
        },
        // 时间轴双击事件
        timelineDblClick(e, time) {
            this.seek(time);
        },
        // 销毁盒子宽高变化监听事件
        destroyListener() {
            if (this.observer) {
                this.observer.disconnect();
            }
        },
        // 监听盒子宽高变化
        initListener() {
            this.observer = new MutationObserver(this.containerSizeChanged);
            this.observer.observe(this.$refs.h5SinglePlayerRef, {
                attributes: true,
                childList: true,
                subtree: true,
                attributeOldValue: true,
                attributeFilter: ['style']
            });
        },
        initErrorEvent() {
            this.$nextTick(() => {
                this.player.JS_SetWindowControlCallback({
                    pluginErrorHandler: (index, iErrorCode, oError) => {  //插件错误回调
                        this.$emit('error', index, iErrorCode, oError);
                    },
                });
            });
        },
        // 盒子宽高变化处理
        containerSizeChanged(mutationsList) {
            for (let mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    this.updateKey = new Date().getTime();
                }
            }
        },
        containerWidth() {
            const inner = document.getElementById(this.id);
            return inner && inner.offsetWidth || 0;
        },
        timeRun(video) {
            this.timer = setTimeout(() => {
                this.getOSDTime(0).then(time => {
                    if (moment(time).isBefore(video._endTime)) {
                        time > 0 && this.setTimeline(time);
                        this.timeRun(video);
                    } else {
                        this.$emit('play-end', 0);
                    }
                })
            }, 1000 / this.speed);
        },
        timeStop() {
            clearTimeout(this.timer);
        },
        timelineReset() {
            this.timeSegments = []
            this.speed = 1
            const initTime = new Date(moment().add(-1, 'd').format('YYYY-MM-DD 00:00:00')).getTime()
            this.timelineChange(initTime)
            this.setTimeline(initTime)
        },
        timelineChange(time) {
            this.playingTime = time;
            this.$emit('time-change', time);
        },
        setTimeline(time) {
            this.$refs.timelineRef && this.$refs.timelineRef.setTimeToMiddle(time);
        },
        getPlayTime(timeSegments = []) {
            let beginTime
            let endTime
            let _beginTime
            let _endTime

            if (timeSegments.length > 0) {
                _beginTime = timeSegments[0].beginTime
                _endTime = timeSegments[timeSegments.length - 1].endTime

                if (this.timeLock3Days) {
                    _beginTime && (beginTime = localTimeToISOTime(moment(this.playingTime), true))
                    _endTime && (endTime = localTimeToISOTime(moment(this.playingTime).add(3, 'd').subtract(1, 's'), false))
                } else {
                    _beginTime && (beginTime = localTimeToISOTime(moment(_beginTime), true))
                    _endTime && (endTime = localTimeToISOTime(moment(_endTime), false))
                }
            }
            return {beginTime, endTime, _beginTime, _endTime}
        },
        showTimeLine() {
            return isNotEmpty(this.timeSegments) && Array.isArray(this.timeSegments) && this.timeSegments.length > 0;
        },
        destroyResizeEvent() {
            document.getElementById(this.id).removeEventListener('resize', this.updateResize);
        },
        initResizeEvent() {
            this.destroyResizeEvent();
            document.getElementById(this.id).addEventListener('resize', this.updateResize);
            this.updateResize();
        },
        updateResize() {
            this.$nextTick(() => {
                const d = this.$refs.h5SinglePlayerRef;
                const w = d.offsetWidth;
                const h = d.offsetHeight;
                this.resize(w, h);
            });
        },
        destroy() {
            this.destroyWorker();
        },
        getConfig() {
            return this.config;
        },
        setConfig(config) {
            this.config = Object.assign(this.config || {}, config);
        },
        getId() {
            return this.id;
        },
        getIndex() {
            return this.index;
        },
        initConfig() {
            // 语音对讲只支持https环境下使用wss的url
            this.setConfig({
                szId: this.getId(), // 保证容器ID唯一性 id 保证唯一性并使用英文字符为首字母
                szBasePath: getLoadJsPluginPath(), // 运行环境h5player.min.js存放的静态文件目录, 与h5player.min.js引用路径保持一致
                iMaxSplit: 1, // 可选参数 ；实例对象最大分屏数，默认最大分屏4*4
                iCurrentSplit: 1, // 可选参数 ；实例对象当前显示分屏数，不大于iMaxSplit ，默认1分屏
                openDebug: IS_DEV,
                // iWidth: 600, 可选参数；当容器div#play_window有固定宽高时，窗口大小将自适应容器宽高，可不传iWidth和iHeight；
                // iHeight: 400, 可选参数 ；
                oStyle: {  // 可选参数，窗口样式
                    border: '#4d4d4d',  // 可选参数 ； 未选中的边框颜色 ,
                    borderSelect: '#4d4d4d', // 可选参数 ；选中的边框颜色
                    background: '#4d4d4d' // 边框的背景色
                } // 可选参数
            });
        },
        create() {
            // eslint-disable-next-line no-undef
            this.player = new window.JSPlugin(this.getConfig());
        },
        play(playURL, params, index) {
            this.isPlayBack = false;
            const _params = Object.assign({playURL, mode: 0}, params);
            const _index = isNotEmpty(index) ? index : this.getIndex();
            return this.player.JS_Play(playURL, _params, _index);
        },
        /**
         * @function
         * @description 回放
         * @param {String} playURL 取流url
         * @param {Object} params 参数
         * @param {Object | String} beginTime 开始时间
         * @param {Object | String} endTime 结束时间
         * @param {Number} index 播放的窗口编号
         * @return {Promise}
         * @author lixiaodong31 2023/10/19
         * @example
         */
        playback(playURL, params, beginTime, endTime, index) {
            this.isPlayBack = true;
            infoLog('playURL, params, beginTime, endTime, index', playURL, params, beginTime, endTime, index);
            this.timeSegments = [{
                beginTime: new Date(beginTime).getTime(),
                endTime: new Date(endTime).getTime(),
                style: {
                    background: '#5881cf'
                },
                url: playURL
            }]; // 设置时间集
            const _params = Object.assign({playURL, mode: 0}, params, {timeSegments: this.timeSegments});

            // 处理回放时间（非回放时，beginTime和endTime为undefined）
            const tSeg = this.getPlayTime(this.timeSegments);
            this.video.beginTime = tSeg && tSeg.beginTime;
            this.video._beginTime = tSeg && tSeg._beginTime;
            this.video.endTime = tSeg && tSeg.endTime;
            this.video._endTime = tSeg && tSeg._endTime;

            const _index = isNotEmpty(index) ? index : this.getIndex();
            return this.player.JS_Play(playURL, _params, _index, beginTime, endTime).then(() => {
                this.autoTimeRun && this.timeRun(this.video);
                if (moment(this.playingTime).isBetween(this.video._beginTime, this.video._endTime) && this.autoSeek) {
                    this.seek(this.playingTime);
                }
            });
        },
        /**
         * @function
         * @description 重置宽高
         * @param {String} elWidth 宽度
         * @param {String} elHeight 高度
         * @author lixiaodong31 2023/10/19
         * @example
         */
        resize(elWidth, elHeight) {
            this.player.JS_Resize(elWidth, elHeight);
        },
        /**
         * @function
         * @description 手动设置选中的窗口
         * @param {Number} index 窗口索引（默认当前选中的窗口）
         * @return {Promise}
         * @author lixiaodong31 2023/10/19
         * @example
         */
        selectWnd(index) {
            const _index = isNotEmpty(index) ? index : this.getIndex();
            return this.player.JS_SelectWnd(_index);
        },
        /**
         * @function
         * @description 单个抓图
         * @param {Number} index 抓图视窗的序号
         * @param {Any} name 抓图保存的名称（默认当前时间戳）
         * @param {String} fileType 文件类型（BMP/JPEG）
         * @param {Function} callback 回调函数
         * @return {Promise}
         * @author lixiaodong31 2023/10/19
         * @example
         */
        capturePicture(callback, name = new Date().getTime(), fileType = 'JPEG', index) {
            const _index = isNotEmpty(index) ? index : this.getIndex();
            return this.player.JS_CapturePicture(_index, name, fileType, callback);
        },
        /**
         * @function
         * @description 单个关闭
         * @param {Number} index 窗口索引（默认当前选中的窗口）
         * @return {Promise}
         * @author lixiaodong31 2023/10/19
         * @example
         */
        stop(index) {
            const _index = isNotEmpty(index) ? index : this.getIndex();
            return this.player.JS_Stop(_index);
        },
        /**
         * @function
         * @description 关闭全部
         * @return {Promise}
         * @author lixiaodong31 2023/10/19
         * @example
         */
        stopRealPlayAll() {
            return this.player.JS_StopRealPlayAll();
        },
        /**
         * @function
         * @description 设置窗口分割
         * @param {Number} num 窗口分割基数
         * @return {Promise}
         * @author lixiaodong31 2023/10/19
         * @example
         */
        arrangeWindow(num) {
            return this.player.JS_ArrangeWindow(num);
        },
        /**
         * @function
         * @description 设置插件全屏
         * @param {Boolean} flag 开关
         * @return {Promise}
         * @author lixiaodong31 2023/10/19
         * @example
         */
        fullScreenDisplay(flag = true) {
            return this.player.JS_FullScreenDisplay(flag);
        },
        /**
         * @function
         * @description 关闭声音
         * @param {Number} index 窗口索引（默认当前选中的窗口）
         * @return {Promise}
         * @author lixiaodong31 2023/10/19
         * @example
         */
        closeSound(index) {
            const _index = isNotEmpty(index) ? index : this.getIndex();
            return this.player.JS_CloseSound(_index);
        },
        /**
         * @function
         * @description 开启声音
         * @param {Number} index 窗口索引（默认当前选中的窗口）
         * @return {Promise}
         * @author lixiaodong31 2023/10/19
         * @example
         */
        openSound(index) {
            const _index = isNotEmpty(index) ? index : this.getIndex();
            return this.player.JS_OpenSound(_index);
        },
        /**
         * @function
         * @description 录像定位
         * @param {any} beginTime 开始时间
         * @param {any} endTime 结束时间
         * @param {Number} index 窗口索引（默认当前选中的窗口）
         * @return {Promise}
         * @author lixiaodong31 2023/10/19
         * @example
         */
        seek(playingTime, index) {
            const _index = isNotEmpty(index) ? index : this.getIndex();
            let seekBeginTime;
            let seekEndTime;
            if (moment(playingTime).isAfter(this.video._endTime)) {
                return
            }
            if (moment(playingTime).isBefore(this.video._beginTime)) {
                seekBeginTime = this.video._beginTime;
            }
            const $beginTime = localTimeToISOTime(playingTime, true);
            seekEndTime = localTimeToISOTime(playingTime, true);
            return this.player.JS_Seek(_index, $beginTime, this.video.endTime);
        },
        /**
         * @function
         * @description 暂停
         * @param {Number} index 窗口索引（默认当前选中的窗口）
         * @return {Promise}
         * @author lixiaodong31 2023/10/19
         * @example
         */
        pause(index) {
            const _index = isNotEmpty(index) ? index : this.getIndex();
            return this.player.JS_Pause(_index);
        },
        /**
         * @function
         * @description 恢复
         * @param {Number} index 窗口索引（默认当前选中的窗口）
         * @return {Promise}
         * @author lixiaodong31 2023/10/19
         * @example
         */
        resume(index) {
            const _index = isNotEmpty(index) ? index : this.getIndex();
            return this.player.JS_Resume(_index);
        },
        /**
         * @function
         * @description 回放单帧进
         * @param {Number} index 窗口索引（默认当前选中的窗口）
         * @return {Promise}
         * @author lixiaodong31 2023/12/11
         * @version 1.0.0
         * @example
         */
        frameForward(index) {
            const _index = isNotEmpty(index) ? index : this.getIndex();
            return this.player.JS_FrameForward(_index);
        },
        /**
         * @function
         * @description 回放单帧退
         * @param {Number} index 窗口索引（默认当前选中的窗口）
         * @return {Promise}
         * @author lixiaodong31 2023/12/11
         * @version 1.0.0
         * @example
         */
        frameBack(index) {
            const _index = isNotEmpty(index) ? index : this.getIndex();
            return this.player.JS_FrameBack(_index);
        },
        /**
         * @function
         * @description 加速播放
         * @param {Number} index 窗口索引（默认当前选中的窗口）
         * @return {Promise}
         * @author lixiaodong31 2023/10/19
         * @example
         */
        fast(index) {
            const _index = isNotEmpty(index) ? index : this.getIndex();
            return this.player.JS_Fast(_index);
        },
        /**
         * @function
         * @description 减速播放
         * @param {Number} index 窗口索引（默认当前选中的窗口）
         * @return {Promise}
         * @author lixiaodong31 2023/10/19
         * @example
         */
        slow(index) {
            const _index = isNotEmpty(index) ? index : this.getIndex();
            return this.player.JS_Slow(_index);
        },
        /**
         * @function
         * @description 获取OSD时间
         * @param {Number} index 窗口索引（默认当前选中的窗口）
         * @return {Promise}
         * @author lixiaodong31 2023/10/19
         * @example
         */
        getOSDTime(index) {
            const _index = isNotEmpty(index) ? index : this.getIndex();
            return this.player.JS_GetOSDTime(_index);
        },
        /**
         * @function
         * @description 开始录像
         * @param {Number} index 窗口索引（默认当前选中的窗口）
         * @param {String} szFileName 录像文件名
         * @return {Promise}
         */
        startSave(szFileName, index) {
            const _index = isNotEmpty(index) ? index : this.getIndex();
            return this.player.JS_StartSave(_index, szFileName);
        },
        /**
         * @function
         * @description 停止录像
         * @param {Number} index 窗口索引（默认0）
         * @return {Promise}
         * @author lixiaodong31 2023/10/19
         * @example
         */
        stopSave(index) {
            const _index = isNotEmpty(index) ? index : this.getIndex();
            return this.player.JS_StopSave(_index);
        },
        /**
         * @function
         * @description 设置码流秘钥
         * @param {Number} index 窗口索引（默认当前选中的窗口）
         * @param {String} secretKey 加密秘钥
         * @return {Promise}
         * @author lixiaodong31 2023/10/19
         * @example
         */
        setSecretKey(secretKey, index) {
            const _index = isNotEmpty(index) ? index : this.getIndex();
            return this.player.JS_SetSecretKey(_index, secretKey);
        },
        /**
         * @function
         * @description 开始对讲
         * @param {String} szTalkUrl 对讲URL
         * @return {Promise}
         * @author lixiaodong31 2023/10/19
         * @example
         */
        startTalk(szTalkUrl) {
            return this.player.JS_StartTalk(szTalkUrl);
        },
        /**
         * @function
         * @description 停止对讲
         * @return {Promise}
         * @author lixiaodong31 2023/10/19
         * @example
         */
        stopTalk() {
            return this.player.JS_StopTalk();
        },
        /**
         * @function
         * @description 设置对讲音量
         * @param {Number} nVolume 音量大小（0-100）
         * @return {Promise}
         * @author lixiaodong31 2023/10/19
         * @example
         */
        talkSetVolume(nVolume) {
            return this.player.JS_TalkSetVolume(nVolume);
        },
        /**
         * @function
         * @description 获取对讲音量
         * @return {Promise}
         * @author lixiaodong31 2023/10/19
         * @example
         */
        talkGetVolume() {
            return this.player.JS_TalkGetVolume();
        },
        /**
         * @function
         * @description 电子放大
         * @param {Number} index 窗口索引（默认当前选中的窗口）
         * @author lixiaodong31 2023/10/19
         * @example
         */
        enableZoom(index) {
            const _index = isNotEmpty(index) ? index : this.getIndex();
            return this.player.JS_EnableZoom(_index);
        },
        /**
         * @function
         * @description 关闭电子放大
         * @param {Number} index 窗口索引（默认当前选中的窗口）
         * @author lixiaodong31 2023/10/19
         * @example
         */
        disableZoom(index) {
            const _index = isNotEmpty(index) ? index : this.getIndex();
            return this.player.JS_DisableZoom(_index);
        },
        /**
         * @function
         * @description 销毁资源
         * @return {Promise}
         * @author lixiaodong31 2023/10/19
         */
        destroyWorker() {
            this.player.JS_DestroyWorker();
        }
    }
};
</script>

<style lang="scss" scoped>
.h5-player-container, .h5-player-inner {
    position: relative;
    height: 100%;
    width: 100%;
}

.has-timeline-height {
    height: calc(100% - 40px) !important; // 窗口高 - 时间轴高 - 回放toolbar高
}

.full-height {
    height: 100% !important;
}

.timeline-outer {
    width: 100%;
    height: 40px;

    ::v-deep .timeline-bar-outer {
        position: absolute;
        bottom: 30px;
        height: 40px;
        width: calc(100% - 30px);
    }

    .right-btns {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 30px;
        height: 40px;
        background: #232427;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;

        .h-icon-calendar {
            cursor: pointer;
            font-size: 23px;
            color: #aaa;

            &:hover {
                color: #fff;
            }
        }
    }
}
</style>
