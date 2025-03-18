<template>
    <div
        class="loading-layer"
        :key="key"
        v-if="visible"
        hikcc_cover="opaque">
        <img v-if="url" class="outer-img" :src="url" alt="" onerror="this.style.display='none'"/>
        <default-camera-img v-else/>
        <el-load-icon class="player-loading-icon"/>
    </div>
</template>
<script>
import {CommonMixin} from "./mixin";
import DefaultCameraImg from "./../components/DefaultCameraImg";
import {tranSecureUrl} from "./../util";
import {getSimplePlayerData} from "./../lib";

/**
 * @function
 * @description loading遮罩层
 * @return {String}
 * @author lixiaodong31 2023/9/8
 * @version 1.0.0
 * @example
 */
export default {
    mixins: [CommonMixin],
    components: {DefaultCameraImg},
    data() {
        return {
            key: 1,
            url: '',
        }
    },
    computed: {
        simplePlayerData() {
            return getSimplePlayerData();
        }
    },
    created() {
        this.init();
    },
    methods: {
        init() {
            const isReady = this.simplePlayerData.getPlayerReady(this.index);
            const isEmpty = this.simplePlayerData.isEmptyWnd(this.index);
            const f = this.simplePlayerData.isH5Fail(this.index);
            this.initUrl();
            if (isReady || isEmpty) this.close();
            else this.open();
            this.key = new Date().getTime();
            // if (f) this.close();
        },
        initUrl() {
            const url = this.simplePlayerData.getThumbnail(this.index);
            this.url = url ? tranSecureUrl(url) : '';
        }
    }
}
</script>
<style lang="scss" scoped>
@import "style";

.loading-layer {
    position: relative;
    @extend .full-screen;
    display: flex;
    justify-content: center;
    align-items: center;

    .outer-img {
        width: 100%;
        height: 100%;
        display: block;
        background-color: #000;
        opacity: 0.7;
    }

    .player-loading-icon {
        font-size: 48px;
        position: absolute;
        z-index: 100;
        margin-top: -30px;
        top: 50%;
    }
}
</style>
