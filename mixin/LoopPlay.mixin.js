import {EVENT_TYPE, LOOP_TIME_OPTIONS} from "./../lib/params.lib";
import {throttle} from "./../util";

const LoopPlayMixin = {
    data() {
        return {
            percentageNum: 0,
            percentageSecond: 0,
            keyInterval: 0,
            loopIndex: 1,
            loopTimeOptions: LOOP_TIME_OPTIONS,
        };
    },
    computed: {
        loopFlag() {
            return this.simplePlayerData.getLoop();
        },
        PauseControlClass() {
            // 修改为打开预案就是轮播模式后，调整按钮的对应状态图标
            return this.loopFlag ? 'pause' : 'play';
        },
        disabledRightLoopTimeBtn() {
            return this.loopTimeOptions[this.loopTimeOptions.length - 1]
                .valSecond > 0
                ? this.loopIndex > this.loopTimeOptions.length - 1
                : this.loopIndex > this.loopTimeOptions.length - 2;
        }
    },
    beforeDestroy() {
        clearInterval(this.keyInterval);
    },
    methods: {
        async firstPageVideo() {
            this.simplePlayerData.goFirstPage(async (prePoints) => {
                if (prePoints && prePoints.length) {
                    this.simplePlayerData.updateBaseParams(prePoints);
                    // 此处调用父级，也就是播放器层的方法
                    await this.$parent._doReplaceBatchPlay(prePoints);
                    this.restartLoopAfterSetLoopTime();
                    // 抛出事件
                    this.$parent.eventEmit(EVENT_TYPE.FIRST_PAGE, {list: prePoints});
                }
            });
        },
        // 上一页视频
        prePageVideo: throttle(async function () {
            const {pageNo} = this.simplePlayerData.getPagination();
            if (pageNo > 1) {
                this.simplePlayerData.goPrePage(async (prePoints) => {
                    if (prePoints && prePoints.length) {
                        // 重置轮询进度条
                        if (this.loopFlag) {
                            this.resetTimeLooper();
                        }
                        // 此处调用父级，也就是播放器层的方法
                        await this.$parent._doReplaceBatchPlay(prePoints);
                        // 刷新选中
                        this.$parent.playerWndClick(this.simplePlayerData.getSelectedWnd());
                        // 抛出事件
                        this.$parent.eventEmit(EVENT_TYPE.PRE_PAGE, {list: prePoints});
                    }
                });
            }
        }),
        // 下一页视频
        nextPageVideo: throttle(async function () {
            const {pageNo, size} = this.simplePlayerData.getPagination();
            if (pageNo < size) {
                this.simplePlayerData.goNextPage(async (nextPoints) => {
                    if (nextPoints && nextPoints.length) {
                        // 重置轮询进度条
                        if (this.loopFlag) {
                            this.resetTimeLooper();
                        }
                        // 此处调用父级，也就是播放器层的方法
                        await this.$parent._doReplaceBatchPlay(nextPoints);
                        // 刷新选中
                        this.$parent.playerWndClick(this.simplePlayerData.getSelectedWnd());
                        // 抛出事件
                        this.$parent.eventEmit(EVENT_TYPE.NEXT_PAGE, {list: nextPoints});
                    }
                });
            }
        }),
        // 循环播放
        async loopPlay() {
            const {pageNo, size} = this.simplePlayerData.getPagination();
            // 抛出事件（跳页之前事件）
            this.$parent.eventEmit(EVENT_TYPE.BEFORE_GO_TO_PAGE);
            if (pageNo === size && size === 1) {
                // 不做任何处理
            } else if (pageNo < size) {
                await this.nextPageVideo();
            } else {
                await this.firstPageVideo();
            }
        },
        // lvptimeInterval秒单位数据
        timeLooper(lvptimeInterval, callback) {
            let secend = 0; // 毫秒
            let times = 0; // 每一轮轮询计数器
            this.resetTimeLooper();
            cancelAnimationFrame(this.keyInterval);
            const loopFun = () => {
                secend++;
                times++;
                // 60Hz为大多数屏幕刷新率，1秒60Hz
                if (secend % 60 === 0) {
                    // 实时秒数
                    this.percentageSecond++;
                }
                // 进度条触发时机
                if ((secend % (Math.round(lvptimeInterval * 60 / 100)) === 0)) {
                    this.percentageNum++;
                    if (this.percentageNum > 100 || times > lvptimeInterval * 60) {
                        times = 0;
                        this.clearTimeLooper();
                        // 抛出事件（单次轮询结束）
                        this.$parent.eventEmit(EVENT_TYPE.SINGLE_LOOP_END);
                        callback && callback();
                    }
                }
                this.keyInterval = requestAnimationFrame(loopFun);
            };
            this.keyInterval = requestAnimationFrame(loopFun); // 执行
        },
        resetTimeLooper() {
            this.percentageNum = 0;
            this.percentageSecond = 0;
        },
        clearTimeLooper() {
            this.percentageNum = 0;
            this.percentageSecond = 0;
            cancelAnimationFrame(this.keyInterval);
        },
        // 该方法已废弃（存在时间精度问题）
        clearTimeLooperOld() {
            this.percentageNum = 0;
            this.percentageSecond = 0;
            clearInterval(this.keyInterval);
        },
        handleIconLoopClick: throttle(function (key) {
            const curLoopTimeItem = this.simplePlayerData.getToolBarCurrent();
            const intervalTime = (curLoopTimeItem && curLoopTimeItem.valSecond) || 0;
            this.clearTimeLooper();

            switch (key) {
                case 'loop':
                    this.simplePlayerData.setLoop(!this.loopFlag);
                    //开始进行视频循环播放
                    if (this.simplePlayerData.getLoop()) {
                        this.timeLooper(intervalTime, () => {
                            this.loopPlay().then();
                            this.resetTimeLooper();
                            return true;
                        });
                    } else {
                        this.resetTimeLooper();
                    }
                    break;
                case 'timeSettingLeft':
                    this.simplePlayerData.setToolBarCurrent(this.simplePlayerData.getToolBarCurrentLeft());
                    this.restartLoopAfterSetLoopTime();
                    break;
                case 'timeSettingRight':
                    this.simplePlayerData.setToolBarCurrent(this.simplePlayerData.getToolBarCurrentRight());
                    this.restartLoopAfterSetLoopTime();
                    break;
                // 自定义轮巡时间间隔删除
                case 'deleteTheLastLoopTimeOption':
                    if (this.loopIndex === this.loopTimeOptions.length) {
                        this.loopIndex = 1;
                        this.simplePlayerData.setToolBarCurrent(this.simplePlayerData.getToolBarCurrentLeft());
                        this.restartLoopAfterSetLoopTime();
                    }
                    break;
            }

            this.$parent.eventEmit(EVENT_TYPE.TIME_INTERVAL_CHANGE, {
                currentOption: this.simplePlayerData.getToolBarCurrent(),
                selectedOption: this.simplePlayerData.getToolBarCurrent(),
                options: this.simplePlayerData.getToolBarOptions()
            });
        }),
        // 轮播时间变更后，停止再启动轮播行为
        restartLoopAfterSetLoopTime() {
            if (this.simplePlayerData.getLoop()) {
                this.clearTimeLooper();
                this.simplePlayerData.setLoop(false); // 先设置成false，后面调用时在设置成true
                let timer = setTimeout(() => {
                    this.handleIconLoopClick('loop');
                    clearTimeout(timer);
                }, 1000); // 原因是该方案有节流控制，所以要延时
            }
        },
        clickLoopTimeOption(loopTimeOption, idx) {
            if (this.simplePlayerData.getLoop()) {
                const {valSecond} = loopTimeOption;
                if (idx < this.loopTimeOptions.length - 1) {
                    this.loopIndex = idx + 1;
                    this.restartLoopAfterSetLoopTime();
                } else {
                    if (valSecond > 0) {
                        this.loopIndex = idx + 1;
                        this.restartLoopAfterSetLoopTime();
                    }
                }
            }
        },
        stopLoopPlay() {
            if (this.loopFlag) {
                this.handleIconLoopClick('loop');
            }
        },
        // 废弃方法
        // 该方法已废弃（存在时间精度问题）
        timeLooperOld(lvptimeInterval, callback) {
            let secend = 0; // 毫秒
            this.resetTimeLooper();
            // 每1毫秒会调用一次（这里的1毫秒并不是严格的1毫秒，实际要高于1毫秒）
            clearInterval(this.keyInterval);
            this.keyInterval = setInterval(() => {
                secend += 1;
                // 理想情况下，整秒触发时机
                if (secend % 1000 === 0) {
                    this.percentageSecond++;
                }
                // 进度条触发时机
                if (secend % (lvptimeInterval * 10) === 0) {
                    this.percentageNum++;
                    if (this.percentageNum > 100) {
                        this.clearTimeLooper();
                        let res = callback && callback();
                        if (res) this.timeLooper(lvptimeInterval, callback);
                    }
                }
            }, 1);
        },
    }
};

export {LoopPlayMixin};
