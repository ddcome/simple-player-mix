/**
 * @function
 * @description H5播放器组件 对外开放方法。
 * 对于播放器组件，提供哪些功能？
 * 1、播放某几个点位
 * 2、替换某几个窗口
 * 3、关闭某几个点位播放
 * 4、改变分屏
 * @author lixiaodong31 2023/9/22
 * @version 1.0.0
 * @example
 */
export const OpenApiForH5Mixin = {
    methods: {
        /**
         * @function
         * @description 设置播放器配置
         * @param {Object} param - 播放器CommonConfig参数
         */
        doCcConfig() {
            // this.initJSPlugin();
        },
        /**
         * @function
         * @description 根据点位，自动适应分屏
         */
        doScreenAuto(pointInfos) {
            const num = this.simplePlayerData.getFitScreenByList(pointInfos);
            // 设置当前分屏数
            this.simplePlayerData.setCurrentScreen(num);
            this.updateH5PlayerSize && this.updateH5PlayerSize();
        }
    }
}
