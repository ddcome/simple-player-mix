import {isNotEmpty} from "./../util";
import {errorLog, infoLog, warnLog} from "./../util/logger";

/**
* @function
* @description 接口配置MAP
*
* - QUERY_H5_PREVIEW_API - 查询H5预览Url
* - QUERY_H5_PLAYBACK_API - 查询H5回放Url
* - QUERY_ALGORITHMS_API - 查询算法接口
* - QUERY_SWITCH_STATUS_API - 切换浓缩播放状态接口
* - SAVE_SWITCH_STATUS_API - 保存浓缩播放切换接口
* - QUERY_PLAYBACK_PARAM_API - 查询浓缩播放回放参数
* - QUERY_VIDEO_LABEL_API - 查询录像片段数据
* - QUERY_PREVIEW_AUTH_API - 查询预览权限数据接口
* - QUERY_PLAYBACK_AUTH_API - 查询回放权限数据接口
* - QUERY_ALGORITHM_OPTION_API - 查询单个点位的算法分析选项接口
* @author lixiaodong31 2023/12/4
* @version 1.0.0
* @example
*/
export const API_METHOD_MAP = {
    QUERY_H5_PREVIEW_API: 'queryH5PreviewApi',
    QUERY_H5_PLAYBACK_API: 'queryH5PlaybackApi',
    QUERY_ALGORITHMS_API: 'queryAlgorithmsApi',
    QUERY_SWITCH_STATUS_API: 'querySwitchStatusApi',
    SAVE_SWITCH_STATUS_API: 'saveSwitchStatusApi',
    QUERY_PLAYBACK_PARAM_API: 'queryPlaybackParamApi',
    QUERY_VIDEO_LABEL_API: 'queryVideoByLabelApi',
    QUERY_PREVIEW_AUTH_API: 'queryPreviewAuthApi',
    QUERY_PLAYBACK_AUTH_API: 'queryPlaybackAuthApi',
    QUERY_ALGORITHM_OPTION_API: 'queryAlgorithmOptionApi',
}


/**
 * @function
 * @description 播放器中依赖得接口属性注册器
 * @author lixiaodong31 2023/10/17
 * @version 1.0.0
 * @example
 */
export const ApiPropsMixin = {
    props: {
        // 播放器中涉及到接口请求的配置项
        apiMethods: {
            type: Object,
            default() {
                return null;
            }
        }
    },
    watch: {
        apiMethods: {
            handler(value) {
                if (isNotEmpty(value)) {
                    this.initApiMethods(value);
                }
            },
            deep: true,
            immediate: true
        }
    },
    mounted() {
        infoLog('[ApiPropsMixin] load all api, methods has ', this.apiMethods);
    },
    methods: {
        // 获取播放器外部定义的接口
        getApi(key) {
            if (Object.values(API_METHOD_MAP).includes(key)) {
                if (isNotEmpty(this.apiMethods[key])) {
                    return this.apiMethods[key];
                } else {
                    warnLog('props api-methods`s item value must is Promise Object type.', 'but current value is wrong, ', key, this.apiMethods[key]);
                    return null;
                }
            } else {
                errorLog('you need to config props api-methods, simple-player-mix h5 player need it, and you must config right KEY, KEY has ', Object.values(API_METHOD_MAP));
                return null;
            }
        },
        // 检测是否定义了api钩子函数
        hasApi(keys) {
            if (isNotEmpty(this.apiMethods)) {
                if (Array.isArray(keys)) return keys.every(c => isNotEmpty(this.apiMethods[c]));
                else return isNotEmpty(this.apiMethods[keys]);
            }
            return false;
        },
        initApiMethods(apiMethods) {
            const innerApi = Object.values(API_METHOD_MAP);
            Object.keys(apiMethods).forEach((apiName) => {
                if (innerApi.includes(apiName)) {

                }
            });
        }
    }
}
