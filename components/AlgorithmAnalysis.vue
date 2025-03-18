<template>
    <div class="algorithm-analysis">
        <div class="right-btns">
            <div class="circle-btn" @click.stop="analysisHandle">
                算法分析
            </div>
        </div>
    </div>
</template>

<script>
import {getSimplePlayerData} from "./../lib";
import {errorLog} from "./../util/logger";
import {EVENT_TYPE} from "./../lib/params.lib";

export default {
    data() {
        return {
            isConcentrate: false,
        };
    },
    computed: {
        simplePlayerData() {
            return getSimplePlayerData();
        },
    },
    methods: {
        analysisHandle() {
            try {
                this.$parent.$parent.eventEmit(EVENT_TYPE.BATCH_ALGORITHM_ANALYSIS);
            } catch (e) {
                errorLog('[analysisHandle]', e);
            }
        }
    },
};
</script>

<style lang="scss" scoped>
$background1: rgba(255, 255, 255, 0.08);
$color1: rgba(255, 255, 255, 0.9);
.algorithm-analysis {
    position: relative;
    z-index: 1;

    .right-btns {
        height: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        .circle-btn {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            background: $background1;
            color: rgb(30, 140, 230);
            border-radius: 15px;
            width: 100px;
            height: 32px;
            line-height: 32px;
            margin-right: 10px;

            &:hover {
                background: rgba(255, 255, 255, 0.15);
            }
        }

        .click-active,
        .click-active:hover {
            background: rgba(255, 255, 255, 0.15);
        }

        .open-active,
        .open-active:hover {
            background: rgba(255, 255, 255, 0.15);
        }
    }
}
</style>
