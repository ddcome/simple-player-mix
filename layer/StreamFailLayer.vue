<template>
    <div class="stream-fail-layer" v-if="visible" hikcc_cover="opaque">
        <p class="one-line p-fail-title"><svg-i :size="16" color="rgba(255, 255, 255, 0.85)" hover-color="#fff" icon="fail"/> <span>取流失败</span></p>
        <p class="one-line p-fail-code">
            错误码: {{ errorCodeText() }}
            <span @click.stop="copy(errorCodeText())"><svg-i color="#eee" hover-color="#fff" icon="copy"/></span>
        </p>
        <p>
            <el-button type="default" :radius="true" icon="h-icon-refresh" @click="refresh">刷新重试</el-button>
        </p>
    </div>
</template>
<script>
import SvgI from './../components/SvgI';
import {CommonMixin} from "./mixin";
import {getSimplePlayerData} from "./../lib";
import {copyText} from "./../util";
import {EVENT_TYPE} from "./../lib/params.lib";

/**
 * @function
 * @description 取流失败
 * @return {String}
 * @author lixiaodong31 2023/9/8
 * @version 1.0.0
 * @example
 */
export default {
    components: { SvgI },
    mixins: [CommonMixin],
    data() {
        return {};
    },
    computed: {
        simplePlayerData() {
            return getSimplePlayerData();
        },
        failData() {
            return getSimplePlayerData().getH5FailData(this.index);
        }
    },
    methods: {
        refresh() {
            this.layerChange(EVENT_TYPE.REFRESH, {index: this.index});
        },
        copy(txt) {
            copyText(txt).then();
        },
        errorMsgText() {
            return this.failData && this.failData.msg;
        },
        errorCodeText() {
            return this.failData && this.failData.code;
        },
        init() {
            const f = this.simplePlayerData.isH5Fail(this.index);
            if (f) this.open();
            else this.close();
        }
    }
}
</script>
<style lang="scss" scoped>
@import "style";

.stream-fail-layer {
    @extend .full-screen;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

p {
    @extend .common-word;
    font-family: Microsoft YaHei UI;
    ::v-deep .el-button--default {
        padding: 0 15px 0 10px;
        margin-top: 10px;
        background: rgb(58, 59, 64);
        color: rgba(255, 255, 255, 0.5);
        border-color: rgba(255, 255, 255, 0.5);
        &:hover {
            color: rgba(255, 255, 255, 0.85) !important;
            background: rgb(58, 59, 64) !important;
        }
    }
}

.el-button {
    @extend .common-button;
}
.one-line {
    display: flex;
    flex-direction: row !important;
    height: 30px !important;
    align-items: center !important;
}
.p-fail-title {
    color: rgba(255, 255, 255, 0.85);
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    span {
        margin-left: 8px;
    }
}
.p-fail-code {
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    ::v-deep .svg-outer {
        position: relative;
        top: -1px;
    }
}
</style>
