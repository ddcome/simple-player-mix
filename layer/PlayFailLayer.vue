<template>
    <div class="player-fail-layer" v-if="visible" hikcc_cover="opaque">
        <h-empty>
            <template #img>
                <img src="./../assets/camera_outline.png" alt="">
                <h4>播放器加载失败</h4>
                <p>
                    请手动<a href="HikCC://">拉起播放器</a>进程并刷新页面。
                    <el-button type="link" @click="reloadPage">刷新</el-button>
                </p>
            </template>
        </h-empty>
    </div>
</template>
<script>
import {CommonMixin} from "./mixin";

/**
* @function
* @description 遮罩层组件
* @return {String}
* @author lixiaodong31 2023/9/8
* @version 1.0.0
* @example
*/
export default {
    mixins: [CommonMixin],
    data() {
        return {
        }
    },
    methods: {
        reloadPage() {
            window.location.reload();
        },
    }
}
</script>
<style lang="scss" scoped>
.player-fail-layer {
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    align-items: center;
    background: rgb(0, 0, 0);
    font-size: 14px;

    img {
        width: 160px !important;
        height: 160px !important;
    }

    h4 {
        color: rgba(255, 255, 255, 0.9);
        font-size: 20px;
        font-weight: 400;
        line-height: 32px;
    }
    p {
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
        text-align: center;
    }
    a {
        color: #1260e6;
    }
}
</style>
