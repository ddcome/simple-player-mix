import moment from 'moment';
import {infoLog} from "./logger";
import _ from "lodash";

// 节流
export const throttle = (func, delay = 1000) => {
    let lastCall = 0;
    return function (...args) {
        const now = new Date().getTime();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        return func.apply(this, args);
    }
}

// 防抖函数
export const debounce = (fn, delay = 1000) => {
    let timer = null;
    let firstTime = true;
    return function () {
        const args = [...arguments];
        if (firstTime) {
            firstTime = false;
            fn.apply(this, args);
        } else {
            timer !== null && clearTimeout(timer);
            timer = setTimeout(() => {
                fn.apply(this, args);
                firstTime = true;
            }, delay);
        }
    };
}

/**
 * @function
 * @description 格式分
 * @return {String}
 * @author lixiaodong31 by chatGPT 2023/9/19
 * @version 1.0.0
 * @example
 */
export function formatSecond(value) {
    if (value < 0 || value >= 24 * 60 * 60) {
        return null;
    }
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

/**
 * @function
 * @description 获取水印颜色
 * @return {String}
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 */
export function numStrToRgb(numStr) {
    const colorMap = {
        '1': '#000000',  // 黑
        '2': '#ffffff',  // 白
        '3': '#808080',  // 灰
        '4': '#ff0000',  // 红
        '5': '#0000ff',  // 蓝
        '6': '#ffff00',  // 黄
    };
    return colorMap[numStr] || colorMap['4'];  // 默认为红色
}

/**
 *  转化为代理地址
 * @param url
 * @returns {string|*}
 */
export function tranSecureUrl(url = '') {
    if ((typeof url == 'string') && (url.constructor === String) && (url.indexOf('https:') === -1) && (process.env.NODE_ENV !== 'development')) {
        const secureUrl = btoa(url);
        return "/ngx/proxy?i=" + secureUrl;
    } else {
        return url
    }
}

/**
 * @function
 * @description 标准UTC格式-->时区表示法
 * @return {String}
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 */
export function parseUTC(date) {
    let tz = date.getTimezoneOffset();
    let tzHour = date.getHours();
    let tzMinute = date.getMinutes();
    date.setHours(tzHour, tzMinute - tz);
    let dateStr = date.toISOString();

    let p = date.toString().match(/(\+\d{4})/);
    let tzStr = p[0];
    tzStr = tzStr.slice(0, 3) + ':' + tzStr.slice(3);
    dateStr = dateStr.replace('Z', tzStr);
    return dateStr;
}

/**
 * @function
 * @description 是否是对象
 * @author lixiaodong31 2023/10/13
 * @version 1.0.0
 * @example
 */
export function isObject(obj) {
    return obj instanceof Object && !Array.isArray(obj);
}

/**
 * @function
 * @description
 * @author lixiaodong31 2023/10/16
 * @version 1.0.0
 * @example
 */
export function decimalsToFractional0(a, b = 1) {
    let f = a * 100; // 分子
    let m = b * 100; // 分母
    let min = Math.min(f, m); // 较小的
    for (let i = min; i > 1; i--) {
        if (!(f % i) && !(m % i)) {
            f = f / i;
            m = m / i;
            min = Math.min(f, m);
        }
    }
    return `${f}/${m}`;
}

/**
 * @function
 * @description 判断是否是IE浏览器
 * @author lixiaodong31 2023/10/16
 * @version 1.0.0
 * @example
 */
export function isIE() {
    return !!window.ActiveXObject || 'ActiveXObject' in window;
}

/**
 * @function
 * @description 检测空值
 * @author lixiaodong31 2023/10/17
 * @version 1.0.0
 * @example
 */
export function isNotEmpty(obj) {
    return obj !== null && obj !== undefined && obj !== '';
}

/**
 * @function
 * @description 是否是整数
 * @param {String} value - 被检测值
 * @return {Boolean}
 * @author lixiaodong31 2024/3/10
 * @version 1.0.0
 * @example
 */
export function isInteger(value) {
    return isNotEmpty(value) && value % 1 === 0;
}


/**
 * @function
 * @description 获取H5取流协议
 * @author lixiaodong31 2023/10/19
 * @version 1.0.0
 * @example
 */
export function getH5Protocol() {
    return window.location.protocol.replace(':', '') === 'https' ? 'wss' : 'ws'
}

/**
 * @function
 * @description 获取对象中部分属性
 * @author lixiaodong31 2023/10/19
 * @version 1.0.0
 * @example
 */
export function objectPick(obj, keys) {
    const _obj = {};
    for (const key in obj) {
        if (keys.includes(key)) {
            _obj[key] = obj[key];
        }
    }
    return _obj;
}

/**
 * @function
 * @description 动态加载js
 * @author lixiaodong31 2023/10/19
 * @version 1.0.0
 * @example
 */
export function loadScript(src) {
    return new Promise((resolve) => {
        let scriptEl = document.createElement("script");
        scriptEl.type = "text/javascript";
        scriptEl.src = src;
        scriptEl.onload = () => {
            resolve();
        };
        document.body.appendChild(scriptEl);
    });
}

/**
 * @function
 * @description 合并对象,仅仅支持deep为1的对象
 * @param {Object} oldValue - 字符串
 * @param {Object} newValue - 字符串
 * @return {Object} 合并后的对象
 * @author lixiaodong31 2023/11/10
 * @version 1.0.0
 * @example
 */
export function assignObj(oldValue, newValue) {
    newValue && Object.keys(newValue).forEach((k) => {
        const value = newValue[k];
        if (typeof value === 'undefined' || value === null) {
            oldValue[k] = value;
        } else if (Array.isArray(value)) {
            oldValue[k] = value;
        } else if (isObject(value)) {
            if (isNotEmpty(oldValue[k])) oldValue[k] = Object.assign(oldValue[k], value);
            else oldValue[k] = value;
        } else {
            oldValue[k] = value;
        }
    });
    return oldValue;
}


/**
 * @description: 根据传入月份，返回具体的dst时间变化点
 * @author: zhangxin14
 * @since: 2018-10-24 16:02:19
 */
const findDstDate = (year, month) => {
    const baseDate = new Date(Date.UTC(year, month, 0, 0, 0, 0, 0))
    let changeMinute = -1
    const baseOffset = (-1 * baseDate.getTimezoneOffset()) / 60

    for (let day = 0; day < 31; day++) {
        let tmpDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
        let tmpOffset = (-1 * tmpDate.getTimezoneOffset()) / 60

        if (tmpOffset !== baseOffset) {
            let minutes = 0

            tmpDate = new Date(Date.UTC(year, month, day - 1, 0, 0, 0, 0))
            tmpOffset = (-1 * tmpDate.getTimezoneOffset()) / 60

            while (changeMinute === -1) {
                tmpDate = new Date(Date.UTC(year, month, day - 1, 0, minutes, 0, 0))
                tmpOffset = (-1 * tmpDate.getTimezoneOffset()) / 60

                if (tmpOffset !== baseOffset) {
                    changeMinute = minutes
                    break
                } else {
                    minutes++
                }
            }
            return new Date(
                Date.UTC(year, month, day - 1, 0, minutes - 1, 59, 0)
            ).getTime()
        }
    }
}


/**
 * @description: 计算夏令时的时间偏移量
 * @author: zhangxin14
 * @since: 2018-12-03 15:23:13
 */
export function computedDstShiftTime(dstEndTime) {
    // 出夏令时的临界时间点，比如 1:59:59
    const outDstHours = new Date(dstEndTime).getHours()
    const outDstMinutes = new Date(dstEndTime).getMinutes()
    // 在出夏令时的临界时间点加 1秒，得到是出夏令时后的标准时间（2:00:00这个时间点实际是不存在）
    const stdHours = new Date(dstEndTime + 1000).getHours()
    const stdMinutes = new Date(dstEndTime + 1000).getMinutes()
    // 用夏令时临界时间点减去出夏令时后的标准时间，得到两者实际的时间偏移量
    // 额外加1分钟是因为零界点的时间是59分，防止少一分钟
    return (
        (outDstHours * 60 + outDstMinutes + 1 - stdHours * 60 - stdMinutes) *
        60 *
        1000
    )
}


/**
 * @description: 根据传入月份，返回具体的dst时间变化点
 * @author: zhangxin14
 * @since: 2018-10-24 16:02:19
 */
export function dstDateRange(time) {
    let year = new Date(moment(time).valueOf()).getFullYear()
    let dstStartMonth = 0
    let dstEndMonth = 0
    let lastOffset = 99
    if (year < 1000) year += 1900
    for (let i = 0; i < 12; i++) {
        const newDate = new Date(Date.UTC(year, i, 0, 0, 0, 0, 0))
        const tz = (-1 * newDate.getTimezoneOffset()) / 60
        if (tz > lastOffset) dstStartMonth = i - 1
        if (tz < lastOffset) dstEndMonth = i - 1
        lastOffset = tz
    }
    const dstStartTime = findDstDate(year, dstStartMonth)
    const dstEndTime = findDstDate(year, dstEndMonth)
    return !dstStartTime && !dstEndTime ? null : {dstStartTime, dstEndTime}
}


/**
 * @description: 本地时间转化为iso时间
 * @param: localTime {String | Date | Number} 本地时间
 * @param: isForward {Boolean} 尽量靠前后标记，布尔类型，true表示向前，false表示向后,仅在本地时间处于离开夏令时的重叠区间时有效
 * @returns iso时间
 * @author: zhangxin14
 * @since: 2018-10-23 11:13:27
 */
export function localTimeToISOTime(localTime, isForward = false) {
    if (!localTime) return moment().toISOString(true)
    // 如果当前时区不存在夏令时，则直接返回iso时间
    if (!dstDateRange(localTime)) return moment(localTime).toISOString(true)
    // 时间盲区只有在出夏令时存在
    const {dstEndTime} = dstDateRange(localTime)
    // 时间盲区是出夏令时时的时间向前拔一定的偏移时间
    // 计算夏令时偏移的时间量，一般来说都是1个小时，但是也存在特殊情况
    const overlapTime = [
        dstEndTime - computedDstShiftTime(dstEndTime),
        dstEndTime
    ]
    const localTimeMilliSeconds = moment(localTime).valueOf()
    if (
        localTimeMilliSeconds > overlapTime[0] &&
        localTimeMilliSeconds <= overlapTime[1]
    ) {
        // 如果选择的时间在时间盲区之间
        // 如果在dst内，时差偏移量需要矫正会标准时差
        const timeOffset = moment().utcOffset() + (moment().isDST() ? -60 : 0)
        return moment(localTime)
            .utcOffset(
                timeOffset +
                (isForward ? computedDstShiftTime(dstEndTime) / 60 / 1000 : 0),
                true
            )
            .toISOString(true)
    } else {
        return moment(localTime).toISOString(true)
    }
}

/**
 * @function
 * @description 检测是都是Promise对象
 * @author lixiaodong31 2023/12/5
 * @version 1.0.0
 * @example
 */
export function isPromise(obj) {
    return isNotEmpty(obj) && Object.prototype.toString.call(obj) === '[object Promise]';
}


/**
 * @function
 * @description 反转对象的key和value值
 * @author lixiaodong31 2023/12/1
 * @version 1.0.0
 * @example
 */
export function reverseObject(obj) {
    let reversedObj = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            reversedObj[obj[key]] = key;
        }
    }
    return reversedObj;
};

/**
 * @function
 * @description 置顶播放器上层弹窗
 * @param {String} className - 类名
 * @author lixiaodong31 2024/1/26
 * @version 1.0.0
 * @example
 */
export function addHikccCover(className) {
    // 处理弹框和播放器层级问题
    let _id = setTimeout(() => {
        const ds = document.getElementsByClassName(className);
        ds &&
        Array.from(ds).forEach(c => {
            c.setAttribute('hikcc_cover', 'opaque');
        });
        clearTimeout(_id);
    }, 10);
}

/**
 * 检测对象中有没有keys
 * @param {String} obj - 被检测对象
 * @param {Array} keys - 键名数组
 * @return {String}
 * @author lixiaodong31 2024/3/21
 * @version 1.0.0
 */
export function hasObjectKeys(obj, keys) {
    try {
        if (isNotEmpty(obj)) {
            return keys.every(k => isNotEmpty(obj[k]));
        }
        return false;
    } catch (e) {
        return false;
    }
}

/**
 *
 * @param {Number} seconds - 秒数
 * @return {String}
 * @author lixiaodong31 2024/3/22
 * @version 1.0.0
 */
export function secondsToM(seconds) {
    const TXT = {S: '秒', M: '分'};
    if (seconds >= 60 && seconds % 60 === 0) {
        return `${seconds / 60}${TXT.M}`;
    } else {
        return `${seconds}${TXT.S}`;
    }
}

/**
 * 播放器时间间隔转换器
 * @param {Object} obj - 播放器时间间隔数据格式
 * @return {Object} 返回播放器时间
 * @author lixiaodong31 2024/4/2
 * @version 1.0.0
 */
export function secToMin(obj) {
    let o = {};
    if (obj.value % 60 === 0 && obj.unit === 'second') {
        o = {
            txt: `${obj.value / 60}分钟`,
            valSecond: obj.value,
            value: obj.value / 60,
            unit: '分钟'
        }
    } else {
        o = {
            txt: `${obj.value}${obj.unit === 'second' ? '秒' : '分钟'}`,
            valSecond: obj.unit === 'second' ? obj.value : obj.value * 60,
            value: obj.value,
            unit: obj.unit === 'second' ? '秒' : '分钟'
        }
    }
    return o;
}

// 检测浏览器地址栏是否安装了证书
export function checkHttpsSafe(ip, success, fail) {
    try {
        let socket = new WebSocket(`wss://${ip}`);

        socket.onopen = () => {
            infoLog('Client certificate is installed.');
            success && success();
        };

        socket.onerror = () => {
            infoLog('Client certificate is not installed or error occurred.');
            // 检查event.message或者错误的详细信息来确定是否是因为证书问题
            fail && fail();
        };
        socket.onopen(null);
    } catch (e) {
        infoLog('WebSocket is not supported.');
        fail && fail();
    }
}

/**
 * 是否是研发环境
 * @return {Boolean}
 * @author lixiaodong31 2024/5/28
 * @version 1.0.0
 */
export function isDev() {
    return process.env.NODE_ENV === 'development';
}

/**
 * 深拷贝
 * @param {Object} st - 被拷贝对象
 * @return {Object} 拷贝对象
 * @author lixiaodong31 2024/7/24
 * @version 1.0.0
 */
export function deepClone(obj) {
    return _.cloneDeep(obj);
}

/**
 * 是否是空
 * @param {Object} value - 字符串
 * @return {Boolean}
 * @author lixiaodong31 2024/8/13
 * @version 1.0.0
 */
export function isEmpty(value) {
    return typeof value === 'undefined' || value === null || value === '';
}

export function copyText(text) {
    return new Promise((resolve, reject) => {
        // text是复制文本
        // 创建input元素
        const el = document.createElement('input');
        // 给input元素赋值需要复制的文本
        el.setAttribute('value', text);
        // 将input元素插入页面
        document.body.appendChild(el);
        // 选中input元素的文本
        el.select();
        // 复制内容到剪贴板
        document.execCommand('copy');
        // 删除input元素
        document.body.removeChild(el);
        resolve(true);
    });
}

/**
* 是否是windows路径
* @param {String} path - 路径
* @return {Boolean} 是否正确
* @author lixiaodong31 2024/9/2
* @version 1.0.0
*/
export function isValidWindowsPath(path) {
    let regRoot = /[a-zA-Z]{1}:{1}\/?/;
    let reg = /[a-zA-Z]{1}:{1}\/[^\/].+(\/$)?/;
    return regRoot.test(path) || reg.test(path);
}

/**
 * 是否是windows操作系统
 * @return {Boolean} 是否是windows操作系统
 * @author lixiaodong31 2024/9/23
 * @version 1.0.0
 */
export function isWindowsOS() {
    return /win64|wow64|win32|win16|wow32/i.test(navigator.userAgent);
}
