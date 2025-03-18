<template>
    <div class="global-layer">
        <cover-dialog
            ref="coverDialogRef"
            :wrap-width="600"
            :wrap-height="372"
            show-close
            title="截图（保存路径C:\capture）"
        />
        <DateDialog ref="dateDialogRef" @change="ddChange" />
    </div>
</template>

<script>
import CoverDialog from './CoverDialog';
import DateDialog from "./DateDialog";

/**
* @object
* @description 全局层MAP对象
* @return {String}
* @author lixiaodong31 2023/9/20
* @version 1.0.0
* @example
*/
export const GLOBAL_LAYER_MAP = {
    COVER_DIALOG: 'CoverDialog',
    DATE_DIALOG: 'DateDialog'
}

/**
* @function
* @description 全局层
* @return {String}
* @author lixiaodong31 2023/9/20
* @version 1.0.0
* @example
*/
export default {
    components: {CoverDialog, DateDialog},
    data() {
        return {
        }
    },
    methods: {
        ddChange(selectedWnd, params) {
            this.$parent.callChangePlaybackTime(selectedWnd, params);
        },
        open(type) {
            switch (type) {
                case GLOBAL_LAYER_MAP.DATE_DIALOG:
                    this.$refs.dateDialogRef.open();
                    break;
                case GLOBAL_LAYER_MAP.COVER_DIALOG:
                    this.$refs.coverDialogRef.open();
                    break;
            }
        },
        close(type) {
            switch (type) {
                case GLOBAL_LAYER_MAP.DATE_DIALOG:
                    this.$refs.dateDialogRef.close();
                    break;
                case GLOBAL_LAYER_MAP.COVER_DIALOG:
                    this.$refs.coverDialogRef.close();
                    break;
            }
        }
    }
}
</script>
