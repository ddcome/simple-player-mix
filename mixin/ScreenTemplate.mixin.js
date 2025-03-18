import {allCompTemplate} from './../screens/index';

export const ScreenTemplateMixin = {
    components: {...allCompTemplate},
    methods: {
        // 获取当前屏幕模板组件
        getScreenTemplateComp() {
            const temp = this.simplePlayerData.getCurrentScreenObj();
            const {component: comp} = temp || {};
            return comp;
        },
    }
}
