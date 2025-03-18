/**
 * @function
 * @description 播放器盒子自适应和全屏功能
 * @author lixiaodong31 2023/8/15
 * @version 1.0.0
 * @example
 */
import {errorLog, infoLog, logger} from "./../util/logger";

export const PlayerStyleMixin = {
        mounted() {
            // 注册resizes事件，以及初始化
            this.initWindowOnresize();
        },
        beforeDestroy() {
            this.destroyAllListenerEvent();
        },
        methods: {
            // 更新播放器盒子的高度
            updateSimplePlayerWrapperHeight() {
                try {
                    const HDOM = document.getElementsByClassName('vpph-outer'); // 头
                    const FDOM = document.getElementsByClassName('tool-bar-outer'); // 尾
                    const OUTER = document.getElementsByClassName('simple-player-wrapper'); // 整个高度
                    const H = HDOM && HDOM[0] ? HDOM[0].offsetHeight : 0;
                    const F = FDOM && FDOM[0] ? FDOM[0].offsetHeight : 0;
                    const OTHER_PARTS_HEIGHT = H + F;
                    OUTER && (this.wrapHeight = OUTER[0].offsetHeight - OTHER_PARTS_HEIGHT); // 最终设置播放器区域高度
                } catch (e) {
                    errorLog('[update player div style][updateSimplePlayerWrapperHeight]', e);
                }
            },
            initWindowOnresize() {
                this.updateSimplePlayerWrapperHeight();
                window.addEventListener('keydown', this.afterEvent, true); // F11处理
                window.onresize = () => {
                    this.afterEvent();
                };
            },
            // 响应事件
            afterEvent() {
                if (!this.checkFull()) {
                    // 不为全屏时将 fullScreenStatus 置false
                    this.simplePlayerData.setFullScreen(false);
                }
                this.updateSimplePlayerWrapperHeight();
            },
            // 销毁所有注册事件
            destroyAllListenerEvent() {
                window.removeEventListener('keydown', this.afterEvent);
                window.onresize = null;
            },
            // 判断是否全屏
            checkFull() {
                let isFull =
                    document.fullscreenElement ||
                    document.webkitIsFullScreen ||
                    document.webkitRequestFullScreen ||
                    document.mozRequestFullScreen ||
                    document.msRequestFullscreen;
                if (isFull === undefined) isFull = false;
                return isFull;
            },
            changeScreen() {
                const isFullScreen = this.simplePlayerData.getFullScreen();
                if (document.fullscreenElement && isFullScreen) {
                    this.exitFullscreen().then(() => {
                        this.updateSimplePlayerWrapperHeight();
                    });
                    this.simplePlayerData.setFullScreen(false)
                } else if (!isFullScreen) {
                    this.fullScreen().then(() => {
                        this.updateSimplePlayerWrapperHeight();
                    });
                    this.simplePlayerData.setFullScreen(true);
                }
            },
            fullScreen() {
                const spWrapper = document.getElementsByClassName('simple-player-wrapper')[0];
                infoLog('fullScreen spWrapper', spWrapper);
                if (spWrapper.requestFullscreen) {
                    return spWrapper.requestFullscreen();
                } else if (spWrapper.webkitRequestFullScreen) {
                    return spWrapper.webkitRequestFullScreen();
                } else if (spWrapper.mozRequestFullScreen) {
                    return spWrapper.mozRequestFullScreen();
                } else {
                    return spWrapper.msRequestFullscreen();
                }
            },
            async exitFullscreen() {
                try {
                    if (document.exitFullscreen) {
                        await document.exitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        await document.mozCancelFullScreen();
                    } else if (document.webkitExitFullscreen) {
                        await document.webkitExitFullscreen();
                    } else if (document.msExitFullscreen) {
                        await document.msExitFullscreen();
                    } else {
                        throw new Error('No supported method to exit fullscreen');
                    }
                } catch (err) {
                    errorLog('Error exiting fullscreen: ', err);
                }
            }
        }
    }
;
