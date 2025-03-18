<template>
    <div
        class="speed-select"
        :style="{ width: isCc?'348px':'260px' }"
        :title="isCc?'':'H5不支持点击该选项，点击下方按钮调整倍数'"
        hikcc_cover="opaque"
        v-if="visible"
    >
        <ul class="speed-ul">
            <li
                v-for="(item, index) in options"
                :class="active === item?'active':''"
                :key="index"
                @click="liClick(item)"
            >
                {{ item }}
            </li>
        </ul>
    </div>
</template>

<script>
import {PLAYER_TYPE, SPEED, SPEED_FOR_H5} from "./../lib/params.lib";
import {reverseObject} from "./../util";
import {getSimplePlayerData} from "./../lib";

export const SPEED_TYPE = {
    SLOW: 'slow',
    FAST: 'fast',
    UNKNOWN: 'unknown'
}

export default {
    props: {
        index: {
            type: [Number, Object],
            default: null
        }
    },
    data() {
        return {
            visible: false,
            active: '1x',
            activeValue: 0,
            options: ['1x']
        };
    },
    computed: {
        simplePlayerData() {
            return getSimplePlayerData();
        },
        isCc() {
            return getSimplePlayerData().getPlayerType() === PLAYER_TYPE.CLIENT_CONTAINER;
        }
    },
    mounted() {
        this.init();
    },
    methods: {
        getSpeed() {
            let res;
            const pt = getSimplePlayerData().getPlayerType();
            switch (pt) {
                case PLAYER_TYPE.CLIENT_CONTAINER:
                    res = SPEED;
                    break;
                case PLAYER_TYPE.H5_PLAYER:
                    res = SPEED_FOR_H5;
                    break;
            }
            return res;
        },
        switchOpen() {
            if (this.visible) {
                this.close();
            } else {
                this.open();
            }
        },
        open() {
            this.visible = true;
        },
        close() {
            this.visible = false;
        },
        init() {
            this.options = Object.values(this.getSpeed()).sort((a, b) => a - b).map((c) => (reverseObject(this.getSpeed())[c]));
            const _speed = getSimplePlayerData().getWndStatus(this.index, 'speed');
            const item = reverseObject(this.getSpeed())[_speed];
            this.active = item;
            this.activeValue = this.getSpeed()[item];
        },
        goPre() {
            const index = this.options.findIndex(c => c === this.active);
            if (index - 1 >= 0) {
                this.changeActive(this.options[index - 1], SPEED_TYPE.SLOW);
            } else if (!this.isCc) {
                this.changeActive(this.options[index], SPEED_TYPE.SLOW);
            }
        },
        goNext() {
            const index = this.options.findIndex(c => c === this.active);
            if (index + 1 <= this.options.length - 1) {
                this.changeActive(this.options[index + 1], SPEED_TYPE.FAST);
            } else if (!this.isCc) {
                this.changeActive(this.options[index], SPEED_TYPE.FAST);
            }
        },
        // 改变选中项
        changeActive(item, type = SPEED_TYPE.UNKNOWN) {
            this.active = item;
            this.activeValue = this.getSpeed()[item];
            this.simplePlayerData.setWndStatus(this.index, 'speed', this.activeValue);
            this.$emit('change', item, type);
        },
        liClick(item) {
            if (this.isCc) {
                this.changeActive(item);
                this.close();
            }
        },
        getCurrent() {
            return this.activeValue;
        }
    }
}
</script>

<style lang="scss" scoped>
.speed-select {
    position: absolute;
    bottom: 30px;
    right: 10px;
    z-index: 1000;
    display: flex;
    flex-direction: row;
    background: #FFFFFF;
    border-radius: 2px;
    height: 36px;
    width: 348px;

    ul.speed-ul {
        width: 100%;
        display: flex;
        list-style: none;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 0;

        li {
            cursor: pointer;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.70);
            padding: 0 8px;
        }

        li.active {
            color: #2080F7;
        }
    }
}
</style>
