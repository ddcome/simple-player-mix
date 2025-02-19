// 日志前缀
export const PRE_LOG_IP = '[simple-player-mix]';
// 是否是研发环境
const IS_DEV_ENV = process.env.NODE_ENV === 'development';
// 研发调试模式
let debugMode = true;
/**
 * @function
 * @description 日志颜色样式
 * @author lixiaodong31 2023/9/21
 * @version 1.0.0
 * @example
 */
export const LOG_STYLE = 'color: black; font-size: 12px; font-weight: bold;'
export const LOG_WARN_STYLE = 'color: orange; font-size: 12px; font-weight: bold;'
export const LOG_ERROR_STYLE = 'color: red; font-size: 12px; font-weight: bold;'
export const LOG_STYLE_PURPLE = 'color: purple; font-size: 12px; font-weight: bold;'

/**
* @function
* @description 设置调试模式
* @param {Boolean} debug - 调试开关
* @author lixiaodong31 2023/11/21
*/
export function setDebugMode(debug = true) {
    debugMode = debug;
}

/**
* @function
* @description 普通日志
* @author lixiaodong31 2023/11/1
* @version 1.0.0
* @example
*/
export function logger() {
    if (!IS_DEV_ENV) return;
    if (!debugMode) return;
    let args = Array.prototype.slice.call(arguments);
    args.unshift(LOG_STYLE);
    args.unshift(`%c${PRE_LOG_IP}`);
    console.log.apply(console, args);
}

/**
 * @function
 * @description 警告
 * @author lixiaodong31 2023/11/1
 * @version 1.0.0
 * @example
 */
export function warnLog() {
    if (!IS_DEV_ENV) return;
    if (!debugMode) return;
    let args = Array.prototype.slice.call(arguments);
    args.unshift(LOG_WARN_STYLE);
    args.unshift(`%c${PRE_LOG_IP}`);
    console.warn.apply(console, args);
}

/**
 * @function
 * @description 信息
 * @author lixiaodong31 2023/11/1
 * @version 1.0.0
 * @example
 */
export function infoLog() {
    if (!IS_DEV_ENV) return;
    if (!debugMode) return;
    let args = Array.prototype.slice.call(arguments);
    args.unshift(LOG_WARN_STYLE);
    args.unshift(`%c${PRE_LOG_IP}`);
    console.info.apply(console, args);
}

/**
 * @function
 * @description 错误
 * @author lixiaodong31 2023/11/1
 * @version 1.0.0
 * @example
 */
export function errorLog() {
    let args = Array.prototype.slice.call(arguments);
    args.unshift(LOG_ERROR_STYLE);
    args.unshift(`%c${PRE_LOG_IP}`);
    console.error.apply(console, args);
}
