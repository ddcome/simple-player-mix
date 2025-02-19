import {loadScript} from "./../util";
import {infoLog, logger} from "./../util/logger";
window['simplePlayerMixComponentId'] = 'bsquare-data';
logger('H5 component path is ', window.simplePlayerMixComponentId);

export function setComponentPath(componentId, callback) {
    window.simplePlayerMixComponentId = componentId;
    infoLog('[setComponentPath]', componentId);
    callback && callback();
}

export function getLoadJsPluginPath() {
    let url = '/static/jsPlugin/';
    if (process.env.NODE_ENV !== 'development') url = `/${window.simplePlayerMixComponentId}${url}`;
    return url
}

export const H5LoadScript = {
    install(Vue) {
        if (!window.JSPlugin) {
            let url = `${getLoadJsPluginPath()}h5player.min.js`;
            loadScript(url).then(() => {
                infoLog('[JS H5 加载完毕]', window.JSPlugin);
            });
        } else {
            infoLog('[JS H5 加载完毕]', window.JSPlugin);
        }
    }
};
