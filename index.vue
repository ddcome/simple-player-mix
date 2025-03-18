<template>
    <div class="simple-player-mix-outer">
        <component
            ref="componentRef"
            :is="comp"
            :apiMethods="apiMethods"
            :config="config"
            :receive="receive"
        />
    </div>
</template>

<script>
import CcPlayer from './cc';
import H5Player from './h5';
import {clearSimplePlayerData, getSimplePlayerData} from "./lib";
import {PLAYER_TYPE} from "./lib/params.lib";
import {errorLog, infoLog} from "./util/logger";

export default {
    components: {
        CcPlayer,
        H5Player
    },
    props: {
        // 播放器中涉及到接口请求的配置项
        apiMethods: {
            type: Object,
            default() {
                return null;
            }
        },
        playerType: {
            type: String,
            default: PLAYER_TYPE.CLIENT_CONTAINER
        },
        config: {
            type: Object,
            default() {
                return {};
            }
        },
        receive: {
            type: Function,
            default() {
                return null;
            }
        }
    },
    watch: {
        playerType: {
            handler(value) {
                if ([PLAYER_TYPE.H5_PLAYER, PLAYER_TYPE.CLIENT_CONTAINER].includes(value)) {
                    this.simplePlayerData = getSimplePlayerData();
                    this.simplePlayerData.setPlayerType(value);
                    this.init();
                } else {
                    this.comp = null;
                    errorLog(`prop playerType error, playerType must is ${PLAYER_TYPE.CLIENT_CONTAINER} or ${PLAYER_TYPE.H5_PLAYER}`);
                }
            },
            immediate: true
        }
    },
    data() {
        return {
            simplePlayerData: null,
            comp: CcPlayer,
        };
    },
    beforeDestroy() {
        clearSimplePlayerData();
    },
    methods: {
        init() {
            this.simplePlayerData = getSimplePlayerData();
            const pt = this.simplePlayerData.getPlayerType();
            switch (pt) {
                case PLAYER_TYPE.CLIENT_CONTAINER:
                    this.comp = CcPlayer;
                    infoLog('current player is client-container');
                    break;
                case PLAYER_TYPE.H5_PLAYER:
                    this.comp = H5Player;
                    infoLog('current player is h5-player');
                    break;
            }
        },
        get() {
            return this.$refs.componentRef;
        },
        doCcConfig(...args) {
            this.get().doCcConfig(...args);
        },
        doScreenAuto(...args) {
            this.get().doScreenAuto(...args);
        },
        doChangeSelectedWnd(...args) {
            this.get().doChangeSelectedWnd(...args);
        },
        doHoverWnd(...args) {
            this.get().doHoverWnd(...args);
        },
        doAutoLoop(...args) {
            this.get().doAutoLoop(...args);
        },
        doSetLoopTime(...args) {
            this.get().doSetLoopTime(...args);
        },
        doReusablePlay(...args) {
            this.get().doReusablePlay(...args);
        },
        doAnchorPoint(...args) {
            this.get().doAnchorPoint(...args);
        },
        doPlay(...args) {
            this.get().doPlay(...args);
        },
        doClear(...args) {
            this.get().doClear(...args);
        },
        doPlayByConfig(...args) {
            this.get().doPlayByConfig(...args);
        },
        doReplaceBatchPlay(...args) {
            this.get().doReplaceBatchPlay(...args);
        },
        doAddAuth(...args) {
            this.get().doAddAuth(...args);
        },
        doPlayback(...args) {
            this.get().doPlayback(...args);
        },
        doPlaybackByConfig(...args) {
            this.get().doPlaybackByConfig(...args);
        },
        doAddPlay(...args) {
            this.get().doAddPlay(...args);
        },
        doReplacePlay(...args) {
            this.get().doReplacePlay(...args);
        },
        doAddCache(...args) {
            this.get().doAddCache(...args);
        },
        doResize(...args) {
            this.get().doResize(...args);
        },
        doSwitch(...args) {
            this.get().doSwitch(...args);
        }
    }
}
</script>
