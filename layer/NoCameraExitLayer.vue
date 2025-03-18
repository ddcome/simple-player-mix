<template>
    <div class="no-camera-exit-layer" v-if="visible" hikcc_cover="opaque">
        <p v-if="showTitle()">{{ getTitle() }}</p>
        <p>设备不存在</p>
    </div>
</template>
<script>
import {CommonMixin} from "./mixin";
import {getSimplePlayerData} from "./../lib";
import {isNotEmpty} from "./../util";

/**
 * @function
 * @description 设备不存在
 * @return {String}
 * @author lixiaodong31 2024/3/4
 * @version 1.0.0
 * @example
 */
export default {
    mixins: [CommonMixin],
    data() {
        return {}
    },
    computed: {
        simplePlayerData() {
            return getSimplePlayerData();
        }
    },
    methods: {
        // 检测是否打开点位不存在
        init() {
            const isDelete = this.simplePlayerData.getIsDelete(this.index);
            if (isDelete) this.open();
            else this.close();
        },
        getTitle() {
            return this.simplePlayerData.getTitle(this.index)
        },
        showTitle() {
            const title = this.simplePlayerData.getTitle(this.index);
            if (isNotEmpty(title)) return false;
            return isNotEmpty(this.getTitle());
        }
    }
}
</script>
<style lang="scss" scoped>
@import "style";

.no-camera-exit-layer {
    @extend .full-screen;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background: #2c2d30;
}

p {
    @extend .common-word;
    color: #c1c1c2;
    font-weight: 400;
    font-size: 14px;
}
</style>
