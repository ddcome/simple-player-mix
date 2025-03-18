import {setCommonConfig} from "./../lib/cc.lib";

/**
 * @function
 * @description 播放器组件 对外开放方法。
 * 对于播放器组件，提供哪些功能？
 * 1、播放某几个点位
 * 2、替换某几个窗口
 * 3、关闭某几个点位播放
 * 4、改变分屏
 * @author lixiaodong31 2023/9/22
 * @version 1.0.0
 * @example
 */
export const OpenApiForCcMixin = {
    methods: {
        /**
         * @function
         * @description 设置播放器配置
         * @param {Object} param - 播放器CommonConfig参数
         */
        doCcConfig(param) {
            setCommonConfig(param);
            // 缓冲配置项到播放器对象中，没有功能作用，方便排查问题使用
            this.simplePlayerData && this.simplePlayerData.setCommonConfig(param);
            // 获取是否需要检测插件助手
            const checkToolFlag = this.simplePlayerData.getCheckTool();
            // 触发一次检测插件助手
            if (!this.hasCheckedTool && checkToolFlag) {
                this.checkBtools();
            }
        },
        /**
         * @function
         * @description 根据点位，自动适应分屏
         */
        doScreenAuto(pointInfos) {
            const num = this.simplePlayerData.getFitScreenByList(pointInfos);
            // 设置当前分屏数
            this.simplePlayerData.setCurrentScreen(num);
        }
    }
}
