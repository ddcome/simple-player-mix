/**
 * @function
 * @description 获取抓图模板
 * @return {String}
 * @author lixiaodong31 2023/9/21
 * @version 1.0.0
 * @example
 */
import {infoLog} from "./../util/logger";

export function getMessageOfCapture(url, text) {
    return `<div class="capture-notify-wrapper" style="display: flex; flex-flow: row nowrap; justify-content: flex-start; align-items: center;">
              <img class="capture-notify-img" style="width: 80px; height: 80px" src=${url} alt="视频截图" />
              <div class="capture-notify-text" style="margin-left: 16px; word-break: break-all">${text}<div/>
            </div>`;
}

/**
 * @function
 * @description 获取录像记录模板
 * @return {String}
 * @author lixiaodong31 2023/9/21
 * @version 1.0.0
 * @example
 */
export function getMessageOfRecord(fileName, saveUrl, picUrl) {
    return `<div class="snap-notify-wrapper" style="display: flex; flex-flow: row nowrap; justify-content: flex-start; align-items: center; z-index: 2022">
                        ${picUrl && `<img class="snap-notify-img" style="width:80px;height:80px;margin-right:8px" src=${picUrl} alt="视频截图" />`}
                        <div class="snap-notify-right" style="width:100%;height:82px;display: flex; flex-flow: column nowrap; justify-content: space-around; align-items: flex-start">
                            <div class="snap-notify-text" style="display:flex;flex-flow:row nowrap;justify-content:flex-start;align-items:center">
                                <span class="title" style="display:inline-block; width: 60px">${picUrl ? '点位名称:' : '录像名称'}</span>
                                ${picUrl ? `<span class="text" title=${fileName.replace(/ /g, '&#32;')} style="display:inline-block;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;word-break:break-all;margin-left:8px;max-width:136px">${fileName}</span>` : `<span class="text" title=${fileName.replace(/ /g, '&#32;')} style="display:inline-block;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;word-break:break-all;margin-left:8px;max-width:220px">${fileName}</span>`}
                            </div>
                            <div class="snap-save-url" style="display:flex;flex-flow:row nowrap;justify-content:flex-start;align-items:center">
                            <span class="title" style="display:inline-block; width: 60px"">存储路径:</span>
                            ${picUrl ? `<span class="text" title=${saveUrl.replace(/ /g, '&#32;')} style="display:inline-block;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;word-break:break-all;margin-left:8px;max-width:136px">${saveUrl}</span>` : `<span class="text" title=${saveUrl.replace(/ /g, '&#32;')} style="display:inline-block;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;word-break:break-all;margin-left:8px;max-width:220px">${saveUrl}</span>`}
                            </div>
                        </div>
           </div>`
}

/**
 * @function
 * @description 播放器回调后异常
 * @return {String}
 * @author lixiaodong31 2023/9/21
 * @version 1.0.0
 * @example
 */
export function showErrMsg(errCode, _this, msg) {
    if ([1, '1'].includes(errCode)) {
        _this.$message({
            message: msg || '请检查插件助手配置信息是否正确，或者是否正常安装并启动',
            type: 'warning'
        });
    }
}

/**
 * @function
 * @description 请先安装插件助手
 * @return {String}
 * @author lixiaodong31 2023/9/21
 * @version 1.0.0
 * @example
 */
export function pleaseInstallFirst(_this) {
    _this.$confirm(
        '检测到平台插件助手未安装，请先安装平台插件助手',
        {
            distinguishCancelAndClose: true,
            type: 'question',
            confirmButtonText: '安装',
            cancelButtonText: '取消'
        }
    ).then(() => {
        window.open('/portal/out/getPackageById.do?id=btools');
    }).catch((e) => {
        infoLog('[pleaseInstallFirst][异常]', e);
    });
}

/**
* @function
* @description 启动中
* @return {String}
* @author lixiaodong31 2023/9/21
* @version 1.0.0
* @example
*/
export function startPlayering(_this) {
    _this.$message({
        message: '启动播放器进程中，请刷新页面',
        type: 'info'
    });
}

/**
* @function
* @description 安装中
* @return {String}
* @author lixiaodong31 2023/9/21
* @version 1.0.0
* @example
*/
export function installPlayering(_this) {
    _this.$message({
        message: '安装播放器中，完成后请刷新页面',
        type: 'info'
    });
}
