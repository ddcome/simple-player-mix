import {SimplePlayerData} from "./player.lib";
import {warnLog} from "./../util/logger";

let simplePlayerData = new SimplePlayerData();

/**
* @function
* @description 销毁播放器对象
* @author lixiaodong31 2023/12/14
* @version 1.0.0
* @example
*/
export function clearSimplePlayerData() {
    try {
        simplePlayerData.setCachePoints([]); // 重置缓冲数据
        simplePlayerData = null; // 销毁对象
    } catch(e) {
        warnLog('destroy player object error, you destroy the null player object', simplePlayerData);
    }
}

/**
* @function
* @description 初始化播放器对象
* @author lixiaodong31 2023/12/14
* @version 1.0.0
* @example
*/
export function getSimplePlayerData() {
    if (simplePlayerData === null) {
        simplePlayerData = new SimplePlayerData();
    }
    return simplePlayerData;
}
