import Vue from 'vue';
import hui, {Message} from 'hui';
import './huiPro';
import './initHMap';
import initApp from './initSingleApp';
import VueClipboard from 'vue-clipboard2'; // 拷贝
import voiceHelper from './initVoice.js';
import {
    getFindRolesByConditionApi,
    getMapConfigApi,
    javaGetSessionActiveApi
} from '@/api';
import { getArchTagSrcDetailsFirstTime } from '@/util/compatible';
import { bsquarePrefix } from '@/util/openWindow.js';
import axios from 'axios';

import 'animate.css';
import '@hui-pro/empty/theme/index.scss';
import '@hui-pro/sync-tree-select/theme/index.scss';
import '@hui-pro/time-picker/theme/index.scss';
import '@hui-pro/img-preview/theme/index.scss';
import '@hui-pro/tree-select/theme/index.scss';
import "@/assets/font/font.css"; // 引入自定义字体文件

import {H5LoadScript} from '@/components/simple-player/h5/h5-load-script';
Vue.use(hui);
Vue.use(VueClipboard);
Vue.use(H5LoadScript);

import StepLikePlugin from "@/components/camera-card-pro/components/step-like-load";
import H5PreviewPlayerPlugin from "@/components/h5PreviewPlayer/h5-preview-player-load";
import VideoPreviewPlayerPlugin from "@/components/videoPreviewPlayer/video-preview-player-load";
import CameraViewLineChartPlugin from "@/components/camera-card-pro/components/camera-view-line-chart-load";
Vue.use(StepLikePlugin);
Vue.use(H5PreviewPlayerPlugin);
Vue.use(VideoPreviewPlayerPlugin);
Vue.use(CameraViewLineChartPlugin);

Vue.prototype.$bus = new Vue();

Vue.prototype.$voiceHelper = voiceHelper;

Vue.prototype.getPublicDistrictJson = (fileName='district') => {
    const isDev = process.env.NODE_ENV === 'development';
    return axios.get(
        isDev
            ? `../static/${fileName}.json`
            : `${bsquarePrefix}static/${fileName}.json`
    );
};

// 引入图标
import '@hui/svg-icon/lib/svg-icon.css';
import icons from '@hui/svg-icon';
import CameraViewLineChart from "@/components/camera-card-pro/components/CameraViewLineChart";
for (let icon of icons) {
    Vue.component(icon.name, icon);
}

const echarts = require('echarts/lib/echarts');
require('echarts/lib/chart/radar');
require('echarts/lib/component/tooltip');
Vue.prototype.$echarts = echarts;

try {
    let count = 0;
    Vue.prototype.$messageForCC = (type, message) => {
        const customClass = 'hikcc' + (count += 1);
        Message({
            type,
            message,
            customClass
        });
        setTimeout(() => {
            const mesDom = document.querySelector('.' + customClass);
            mesDom.setAttribute('hikcc_cover', 'opaque');
            mesDom.style.zIndex = 99999999;
        }, 100);
    };
} catch (e) {
    console.info('极简消息提示组件异常', e);
}


sessionStorage.removeItem('BSQUARE_Enter_TIME');
sessionStorage.removeItem('BSQUARE_LISTACTIONPAGE_USERINDEXCODE');
sessionStorage.removeItem('BSQUARE_LISTACTIONPAGE_USERISADMIN');
sessionStorage.removeItem('BSQUARE_SHOW_DISTRICT_STATIS');
sessionStorage.removeItem('BSQUARE_ROLES_LIST');

function getMapConfigInfo() {
    getMapConfigApi().then(res => {
        if (
            [0, '0'].includes(res.code) &&
            res.data &&
            Object.keys(res.data).length > 0
        ) {
            res.data &&
                sessionStorage.setItem(
                    'BSQUARE_HIMAP_MAPCONFIG',
                    JSON.stringify(res.data)
                );
        }
    });
}
getMapConfigInfo();

getArchTagSrcDetailsFirstTime().then(res => {
    console.info('[初始化视频广场配置项完成][getArchTagSrcDetailsFirstTime]');
    const { keepFlushSessionActive } = res;
    if (String(keepFlushSessionActive) === 'true') {
        flushSessionActive();
    }
});

function getRolesListInfo() {
    getFindRolesByConditionApi().then(res => {
        if ([0, '0'].includes(res.code)) {
            const list =
                res.data && res.data.list && Array.isArray(res.data.list)
                    ? res.data.list
                    : [];
            list.length > 0 &&
                sessionStorage.setItem(
                    'BSQUARE_ROLES_LIST',
                    JSON.stringify(list)
                );
        }
    });
}
getRolesListInfo();

// 初始化显示区点位数量统计-------前端控制是否显示，以及更换对应的面数据，和根节点字段信息
// sessionStorage.setItem('BSQUARE_SHOW_DISTRICT_STATIS', '1')

function flushSessionActive() {
    setInterval(() => {
        try {
            javaGetSessionActiveApi()
                .then(res => {
                    if ([0, '0'].includes(res.code)) {
                        console.log('javaGetSessionActive req ok');
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        } catch (e) {
            console.log(e);
        }
    }, 1000 * 60 * 5);
}

let vueThis = null;
initApp().then(res => {
    vueThis = res;
});
console.log('[main.js]', +new Date());
export { vueThis };
