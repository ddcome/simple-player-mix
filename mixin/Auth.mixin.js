import {PLAYER_STATUS_MAP} from "./../lib/params.lib";
import {API_METHOD_MAP} from "./../mixin/ApiProps.mixin";
import {hasObjectKeys} from "./../util";
import {ALL_LAYER_REF} from "./../components/PlayerLayer";
import {warnLog} from "./../util/logger";

export const AuthMixin = {
    methods: {
        // 检测回放权限
        checkPointAuthOfPlayback(playList, callback) {
            for (let i = 0; i < playList.length; i++) {
                if (this.simplePlayerData.isEmptyWndAndEmptyIndexCode(i)) {
                    warnLog('indexCode、wnd is empty ~');
                    continue;
                }
                const {
                    playbackAuth,
                    remainPlaybackCount,
                } = this.simplePlayerData.getWndStatus(i);
                this.setPlayerHandlerLock(i);
                const canPlay = (playbackAuth || remainPlaybackCount >= 0);
                if (!canPlay) this.simplePlayerData.setWndStatus(i, 'status', PLAYER_STATUS_MAP.PAUSE);
                callback && callback(i, canPlay);
            }
        },
        // 检测预览权限
        checkPointAuthOfPreview(playList, callback) {
            for (let i = 0; i < playList.length; i++) {
                if (this.simplePlayerData.isEmptyWndAndEmptyIndexCode(i)) {
                    warnLog('indexCode、wnd is empty ~');
                    continue;
                }
                const {
                    previewAuth,
                    remainPreviewCount
                } = this.simplePlayerData.getWndStatus(i);
                this.setPlayerHandlerLock(i);
                const canPlay = (previewAuth || remainPreviewCount >= 0);
                if (!canPlay) this.simplePlayerData.setWndStatus(i, 'status', PLAYER_STATUS_MAP.PAUSE);
                callback && callback(i, canPlay);
            }
        },
        // 检测预览、回放权限
        checkPointAuth(playList, callback) {
            const next = (i) => {
                const {
                    previewAuth,
                    remainPreviewCount,
                    playbackAuth,
                    remainPlaybackCount,
                } = this.simplePlayerData.getWndStatus(i);
                const isPreview = this.simplePlayerData.isPreviewStatus(i);
                const canPlay = isPreview ? (previewAuth || remainPreviewCount >= 0) : (playbackAuth || remainPlaybackCount >= 0);
                if (!canPlay) this.simplePlayerData.setWndStatus(i, 'status', PLAYER_STATUS_MAP.PAUSE);
                callback && callback(i, canPlay);
            };
            for (let i = 0; i < playList.length; i++) {
                if (this.simplePlayerData.isEmptyWndAndEmptyIndexCode(i)) {
                    warnLog('indexCode、wnd is empty ~');
                    continue;
                }
                this.setPlayerHandlerLock(i);
                next(i);
            }
        },
        // 检测某个点权限
        checkOnePointAuth(index, point, callback) {
            if (this.simplePlayerData.isEmptyWndAndEmptyIndexCode(index)) {
                warnLog('indexCode、wnd is empty ~');
                return;
            }
            const {
                previewAuth,
                remainPreviewCount,
                playbackAuth,
                remainPlaybackCount,
            } = this.simplePlayerData.getWndStatus(index);
            this.setPlayerHandlerLock(index);
            const isPreview = this.simplePlayerData.isPreviewStatus(index);
            const canPlay = isPreview ? (previewAuth || remainPreviewCount >= 0) : (playbackAuth || remainPlaybackCount >= 0);
            if (!canPlay) this.simplePlayerData.setWndStatus(index, 'status', PLAYER_STATUS_MAP.PAUSE);
            callback && callback(canPlay);
        },
        // 检测某个点权限(通过实时调用API获取)
        checkOnePointAuthApi(index, point, callback) {
            if (this.simplePlayerData.isEmptyWndAndEmptyIndexCode(index)) {
                warnLog('indexCode、wnd is empty ~');
                return;
            }
            const next = () => {
                const {
                    previewAuth,
                    remainPreviewCount,
                    playbackAuth,
                    remainPlaybackCount,
                } = this.simplePlayerData.getWndStatus(index);
                const isPreview = this.simplePlayerData.isPreviewStatus(index);
                const canPlay = isPreview ? (previewAuth || remainPreviewCount >= 0) : (playbackAuth || remainPlaybackCount >= 0);
                if (!canPlay) this.simplePlayerData.setWndStatus(index, 'status', PLAYER_STATUS_MAP.PAUSE);
                callback && callback(canPlay);
            };
            this.setPlayerHandlerLock(index);
            const isPreview = this.simplePlayerData.isPreviewStatus(index);
            if (isPreview) {
                this.getApi(API_METHOD_MAP.QUERY_PREVIEW_AUTH_API)(point).then((r2) => {
                    if(hasObjectKeys(r2, ['previewAuth', 'remainPreviewCount'])) {
                        this.simplePlayerData.setWndStatus(index, r2);
                        next(index);
                    } else {
                        this.openAuthFailLayer(index);
                    }
                }).catch(() => {
                    this.openAuthFailLayer(index);
                });
            } else {
                this.getApi(API_METHOD_MAP.QUERY_PLAYBACK_AUTH_API)(point).then((r1) => {
                    if(hasObjectKeys(r1, ['playbackAuth', 'remainPlaybackCount'])) {
                        this.simplePlayerData.setWndStatus(index, r1);
                        next(index);
                    } else {
                        this.openAuthFailLayer(index);
                    }
                }).catch(() => {
                    this.openAuthFailLayer(index);
                });
            }
        },
        // 检测预览、回放权限(通过实时调用API获取)
        checkPointAuthApi(playList, callback) {
            const next = (i) => {
                const {
                    previewAuth,
                    remainPreviewCount,
                    playbackAuth,
                    remainPlaybackCount,
                } = this.simplePlayerData.getWndStatus(i);
                const isPreview = this.simplePlayerData.isPreviewStatus(i);
                const canPlay = isPreview ? (previewAuth || remainPreviewCount >= 0) : (playbackAuth || remainPlaybackCount >= 0);
                if (!canPlay) this.simplePlayerData.setWndStatus(i, 'status', PLAYER_STATUS_MAP.PAUSE);
                callback && callback(i, canPlay);
            };
            for (let i = 0; i < playList.length; i++) {
                if (this.simplePlayerData.isEmptyWndAndEmptyIndexCode(i)) {
                    warnLog('indexCode、wnd is empty ~');
                    continue;
                }
                this.setPlayerHandlerLock(i);
                const isPreview = this.simplePlayerData.isPreviewStatus(i);
                if (isPreview) {
                    this.getApi(API_METHOD_MAP.QUERY_PREVIEW_AUTH_API)(playList[i]).then((r2) => {
                        if(hasObjectKeys(r2, ['previewAuth', 'remainPreviewCount'])) {
                            this.simplePlayerData.setWndStatus(i, r2);
                            next(i);
                        } else {
                            this.openAuthFailLayer(i);
                        }
                    }).catch(() => {
                        this.openAuthFailLayer(i);
                    });
                } else {
                    this.getApi(API_METHOD_MAP.QUERY_PLAYBACK_AUTH_API)(playList[i]).then((r1) => {
                        if(hasObjectKeys(r1, ['playbackAuth', 'remainPlaybackCount'])) {
                            this.simplePlayerData.setWndStatus(i, r1);
                            next(i);
                        } else {
                            this.openAuthFailLayer(i);
                        }
                    }).catch(() => {
                        this.openAuthFailLayer(i);
                    });
                }
            }
        },
        // 检测回放权限(通过实时调用API获取)
        checkPointAuthOfPlaybackApi(playList, callback) {
            for (let i = 0; i < playList.length; i++) {
                if (this.simplePlayerData.isEmptyWndAndEmptyIndexCode(i)) {
                    warnLog('indexCode、wnd is empty ~');
                    continue;
                }
                this.getApi(API_METHOD_MAP.QUERY_PLAYBACK_AUTH_API)(playList[i]).then((r) => {
                    if(hasObjectKeys(r, ['playbackAuth', 'remainPlaybackCount'])) {
                        const {playbackAuth, remainPlaybackCount} = r;
                        this.simplePlayerData.setWndStatus(i, r);
                        this.setPlayerHandlerLock(i);
                        const canPlay = (playbackAuth || remainPlaybackCount >= 0);
                        if (!canPlay) this.simplePlayerData.setWndStatus(i, 'status', PLAYER_STATUS_MAP.PAUSE);
                        callback && callback(i, canPlay);
                    } else {
                        this.openAuthFailLayer(i);
                    }
                }).catch(() => {
                    this.openAuthFailLayer(i);
                });
            }
        },
        // 检测预览权限(通过实时调用API获取)
        checkPointAuthOfPreviewApi(playList, callback) {
            for (let i = 0; i < playList.length; i++) {
                if (this.simplePlayerData.isEmptyWndAndEmptyIndexCode(i)) {
                    warnLog('indexCode、wnd is empty ~');
                    continue;
                }
                this.getApi(API_METHOD_MAP.QUERY_PREVIEW_AUTH_API)(playList[i]).then((r) => {
                    if(hasObjectKeys(r, ['previewAuth', 'remainPreviewCount'])) {
                        const {previewAuth, remainPreviewCount} = r;
                        this.simplePlayerData.setWndStatus(i, r);
                        this.setPlayerHandlerLock(i);
                        const canPlay = (previewAuth || remainPreviewCount >= 0);
                        if (!canPlay) this.simplePlayerData.setWndStatus(i, 'status', PLAYER_STATUS_MAP.PAUSE);
                        callback && callback(i, canPlay);
                    } else {
                        this.openAuthFailLayer(i);
                    }
                }).catch(() => {
                    this.openAuthFailLayer(i);
                });
            }
        },
        // 检测窗口播放状态，有权限则恢复播放，无权限则断流
        checkScreenPlay(playList, callback) {
            for (let i = 0; i < playList.length; i++) {
                const status = this.simplePlayerData.getWndStatus(i, 'status');
                const {
                    previewAuth,
                    remainPreviewCount,
                    playbackAuth,
                    remainPlaybackCount,
                } = this.simplePlayerData.getWndStatus(i);
                this.setPlayerHandlerLock(i);
                if (this.simplePlayerData.isPreviewStatus(i)) {
                    if ((previewAuth || remainPreviewCount >= 0) && status !== PLAYER_STATUS_MAP.PLAYING) this.callStartPlay(i);
                    if ((previewAuth === false || remainPreviewCount < 0) && status === PLAYER_STATUS_MAP.PLAYING) this.callStopPlay(i);
                } else if (this.simplePlayerData.isPlaybackStatus(i)) {
                    if ((playbackAuth || remainPlaybackCount >= 0) && status !== PLAYER_STATUS_MAP.PLAYING) this.callStartPlayback(i);
                    if ((playbackAuth === false || remainPlaybackCount < 0) && status === PLAYER_STATUS_MAP.PLAYING) this.callStopPlayback(i);
                }
                callback && callback();
            }
        },
        openAuthFailLayer(index) {
            this.$nextTick(() => {
                const refName = `playerLayerRef${index}`;
                this.$refs[refName] && this.$refs[refName][0] && this.$refs[refName][0].openLayer(ALL_LAYER_REF.READ_AUTH_FAIL_LAYER_REF);
            });
        }
    }
}
