const SpFooterMixin = {
    data() {
        return {
            speedPanelExpand: false, //设置倍速默认隐藏
            childFuncBtnDisableNew: false, //true为倍速功能禁止
            isPauseNew: false,
        };
    },
    props: {
        numIdState: {
            type: Object,
            default() {
                return {
                    fontSize: '12px',
                    show: false,
                    numId: ''
                };
            }
        },
        JTSpeedState: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        handleFooterChange(params, index) {
            const { key, value, speed, speedType } = params;
            switch (key) {
                case 'backFrame':
                    this.mBackFrame(index);
                    break;
                case 'pause':
                    this.mPause(index, params);
                    break;
                case 'forwardFrame':
                    this.mForwardFrame(index);
                    break;
                case 'JTSpeedSetting':
                    this.JTmSetSpeed(value, speed, index, speedType);
                    break;
            }
        },
        // 单帧前进
        mForwardFrame(index) {
            this.callFrameNext(index);
            this.pauseHandle({
                index,
                pauseStatus: true,
                delayShow: true
            });
        },
        // 单帧后退
        mBackFrame(index) {
            this.callFramePre(index);
            this.pauseHandle({
                index,
                pauseStatus: true,
                delayShow: true
            });
        },
        // 暂停、恢复播放
        mPause(index, params) {
            const {value} = params;
            this.callPauseOrContinue(index, () => {
                this.pauseHandle({
                    index,
                    pauseStatus: value,
                    delayShow: true
                });
            }, params);
        },
        // 倍速播放事件
        JTmSetSpeed(value, speed, index, speedType) {
            this.speedPanelExpand = value;
            let params = {};
            params.iPlayBackSpeed = this.simplePlayerData.getWndStatus(index, 'speed');
            params.bShowSpeedPlayWnd = value; /* 是否需要展示速度选择框 */
            this.callPlayBySpeed(index, params, value, speed, speedType);
        }
    }
};

export { SpFooterMixin };
