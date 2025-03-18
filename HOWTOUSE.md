# 播放器(simple-player-mix)

组件代码最新地址：
https://sys-gitlab.hikvision.com.cn/PBG/components/general/bsquare/-/tree/release_2.3.0/bsquare-frontend/src/components/simple-player

## 功能清单

|  功能 | 支持 | 依赖 |
| :--: | :--: | :--: |
| 权限 | 是 |  |
| 试看功能 | 是 |  |
| 兼容H5 | 是 |  |
| 浓缩回放 | 是 | simpleplayer大于2.3.14 |
| 异形屏 | 是 | |  
| 本地配置 | 是 | simpleplayer大于2.4.14 |

## 如何引用 （默认极简）
1、安装依赖
```  
"lodash": "^4.17.21",
"deepmerge": "^4.2.2",  
"client-container": "^0.2.58",  
"jsplugin": "^2.5.0",  
```  
还需支持`svg`标签：
`npm i svg-sprite-loader -D`

```
"svg-sprite-loader": "^6.0.11",
```
2、环境配置vue.config.js
```js  
// 默认babel-loader会忽略node_modules中的文件  
// 但是dolphin-plugin-tools用了es6的语法, 配置对其显示转译  
// 配合babel sourceType: 'unambiguous'来使用 https://github.com/babel/babel/issues/9187,transpileDependencies: [  
'dolphin-plugin-tools', /@hui-pro/, /hui/, /hi-map-vue/, /hi-map-core/, 'client-container']  
```  

关于`svg`相关的配置，增加如下loader：
```
chainWebpack: config => {
	config.module  
	  .rule('svg')  
	    .exclude.add(path.resolve(__dirname, 'src/components/simple-player/assets/svg-icons'))  
	    .end();  
	config.module  
	  .rule('icons')  
	    .test(/.svg$/)  
	    .include.add(path.resolve(__dirname, 'src/components/simple-player/assets/svg-icons'))  
	    .end()  
	    .use('svg-sprite-loader')  
	    .loader('svg-sprite-loader')  
	    .options({  
	        symbolId: 'icon-[name]',  
	  });
},
```
注意： 此处的路径确认和你工程中的路径对应， 'src/components/simple-player/assets/svg-icons'，如果有误需要按照你工程的路径配置。

3、vue中引用
```html  
<simple-player  
	 ref="simplePlayerRef" 
	 :player-type="getPlayerType()" 
	 :api-methods="apiMethodsMap" 
	 :style="{ width: '100%', height: '100%' }" 
	 :config="{ mode: 3, maxScreen: 9, debug: true, showTitle: true, hasApplyAuth: !isBsquareToPed }" 		  :    
	 :receive="receiveHandle"
/>  
```  

```js  
import simplePlayer from '@/components/simple-player/index.vue';  
  
// 获取当前选用哪一种播放器  
function getPlayerType() {  
	 try { 
		 const KEY = 'BSQUARE_ARCH_TAGSRC_INFO'; 
		 const cache = sessionStorage.getItem(KEY); 
		 const {playerType} = cache && JSON.parse(cache); 
		 return playerType; 
	 } catch (e) { 
		 console.log('从缓冲中，获取播放器类型异常', e);  
		 return 'client_container'; 
	 }
}  
```  

### 关于H5播放器如何使用（选用）
> 混合播放器中集成了H5播放器，使用前需要引入H5依赖的包

#### 前端需要做
1、安装依赖包`npm install jsplugin -S`
```
"jsplugin": "^2.5.0",
```
2、main.js中导入load函数
```js
// 这里写你播放器的路径，重点导入/h5/h5-load-script
import {  
  H5LoadScript,  
  setComponentPath  
} from '@/components/simple-player/h5/h5-load-script';
// 此处需要指定你组件的componenentId
setComponentPath('ipoint-data', () => {  
  Vue.use(H5LoadScript);  
});
```
3、<font color="#ff0000">要求jsPlugin必须放置于`/static/jsPlugin/`下</font>
Vue工程中，将`jsPlugin`文件夹拷贝到放置于`src/public/static/`下。
**<font color="#ff0000">PS: 这里要重点关注下你项目打包问题，要保证打包后`jsPlugin`也是存在的。以免部署后出现路径问题。</font>**

#### 后端需要做
1、需要提供两个接口，根据indexCode获取H5的取流信息的接口，一个是预览的一个是回放的。

#### 注意事项
1、生产环境中，H5播放器使用要求https必须是安全的，需要提前安装好证书。


## Vue中如何使用

### 播放器的属性以及方法

| 属性 | 类型 | 含义 |
| -- | -- | -- |
| player-type | String | 播放器类型，字典值是h5_player和client_container，默认client_container |
| api-methods | Object| api接口对象 |
| config | Object| 配置项对象 |
| receive | Function | 监听播放器所有事件回调函数 |
| notify-method | 事件 | 极简原生事件（选用） |
| onNotify | 事件 | 极简原生事件（选用） |


代码示例：
```html
<simple-player  
  ref="simplePlayerRef"  
  :player-type="getPlayerType()"  
  :api-methods="apiMethodsMap"  
  :style="{ width: '100%', height: '100%' }"  
  :config="{ mode: 3, maxScreen: 9, debug: true, showTitle: true, hasApplyAuth: false }"  
  :receive="receiveHandle"  
/>
```
script中导入<font color="#ff0000">(特别注意：如果你要使用`player-type`属性，则，导入一定是index.vue，如果你有个性需求，也可以只导入cc.vue或h5,vue，此时无须指定`player-type`属性)</font>
```js
import simplePlayer from '@/components/simple-player/index.vue';
```
<font color="#ff0000">PS：关于api-methods的使用案例，请移步到最下方【事件注册DEMO】</font>


### ==api-methods==
|  API名称 | 类型 | 含义 |
| -- | -- | -- |
| queryH5PreviewApi | Promise | H5预览查询接口 |
| queryH5PlaybackApi | Promise | H5回放查询接口 |
| queryAlgorithmsApi | Promise | 查询算法接口 |
| querySwitchStatusApi | Promise | 切换浓缩播放状态接口 |
| saveSwitchStatusApi | Promise | 保存浓缩播放切换接口 |
| queryPlaybackParamApi | Promise | 查询浓缩播放回放参数 |
| queryVideoByLabelApi | Promise | 查询录像片段数据 |
| queryPreviewAuthApi | Promise | 查询预览权限数据接口 |
| queryPlaybackAuthApi | Promise | 查询回放权限数据接口 |
| queryAlgorithmOptionApi | Promise | 查询单个点位的算法分析选项接口 |

详细解读：
- queryH5PreviewApi 和 queryH5PlaybackApi
  要求返回规范的response，包括code等，例如：
```
{
	code: 0,
	data: {
		url: '',
		playbackUrl: ''
	}
}
```

- queryAlgorithmOptionApi
  要求的返回数据格式是Array，格式如下：
```
[
	{ 
		label: '选项1',
		value: '1'
	},
	{ 
		label: '选项2',
		value: '2'
	}
]
```




### ==配置项 `config`==
|   属性 | 类型 | 含义 |
| -- | -- | -- |
| theme | String | 主题 |
| mode | Number| 播放器模式 |
| debug | String | 是否开启debug模式（开启后控制台有日志） |
| showMoreScreens | Boolean | 是否展示底部工具栏中异形屏按钮，默认false |
| showTitle | Boolean | 是否展示窗口标题，默认true |
| showToolBar | Boolean | 是否展示全局底部工具栏，默认true |
| showHeader | Boolean | 是否展示全局头部工具栏，默认true |
| showSetting | Boolean | 是否展示极简播放器器右上侧的配置按钮，默认true |
| showSequence | Boolean | 是否展示窗口编号，默认false |
| showAlgorithmAnalysis | Boolean | 是否展示算法分析功能，默认false |
| showLabelTag | Boolean | 是否展示标签标记功能，默认false |
| showEventReport | Boolean | 是否展示事件上报功能，默认false |
| showPictureTag | Boolean | 是否展示图片标签功能，默认false |
| showAiRecommend | Boolean | 是否展示智能推荐功能，默认false |
| openPtzWidthMini | Boolean | 当点击打开云台时，是否默认打开mini云台控制窗口，默认false |
| strictAuthMode | Boolean | 权限严格模式，false则不校验能力集,默认不校验能力集 |
| hasApplyAuth | Boolean | 是否可以申请权限，默认true |
| maxScreen | Number | 允许的播放器使用的最大分屏数，默认9 |
| videoTryTime | Number | 试看次数，默认3 |
| checkTool | Boolean | 是否检测插件助手，默认true |
| capabilitySetKey | String | 能力集字段名称，默认capabilitySet |
| globalTopHeader | Object | 全局头部,{ display: true, 是否展示 hasConcentrate: true, 是否有浓缩播放 } |
| globalToolBar | Object | 全局底部工具栏,{ display: true, 是否展示 hasPlayerBtnGroup: true, 是否有播放器按钮组 } |
| readStreamWay | Number | 极简取流方式。默认1。0-通过URL取流；1-通过indexCode取流；2-自动识别 |
| queryH5PreviewParamKeys | Array | 指定H5预览参数，默认['indexCode', 'streamType', 'protocol', 'transmode', 'expand'] |
| queryH5PlaybackParamKeys| Array | 指定H5回放参数，默认['indexCode', 'startTime', 'endTime', 'recordType', 'recordStyle', 'protocol', 'dataType', 'lockType', 'expand'] |

示例：
- 展示标题中的序号
```
:config="{ mode: 3, showTitle: true, showSequence: false }"
```
- 展示算法分析功能
```
:config="{ mode: 3, maxScreen: 9, showAlgorithmAnalysis: true }"
```

### ==事件==
`receive`函数接收播放器内部事件，参数有四个参数
| 参数 | 类型 | 含义 |
| -- | -- | -- |
| type | String | 事件类型 |
| data | Object | 返回数据对象 |
| callback | Function | 回调函数 |
| event_type | String | 事件类型字典值 |

`data`格式如下：
```
{
	selectWnd, // 当前选中窗格  
	screen, // 当前分屏数  
	list, // 当前可视中加载的数据  
	currentPage, // 当前页中的数据  
	pages, // 分页信息
	// 以下是其他个性参数，因事件类型决定，部分事件data的数据会有下面参数（打印参数联调查看）
	index, // 窗口下标
	status,  // 窗口状态
	wnd, // 窗口对象
	item // 当前窗口数据
}
```
<font color="#ff0000">PS： 其他个性参数，因事件类型决定（打印参数联调查看）</font>

`EVENT_TYPE`事件类型字典值如下：
| 事件名称 | 触发点 | 含义 |
| -- | -- | -- |
| SHOW_PLAYER_INFO | 点击窗口头部状态栏中的信息图标 | 播放器头部按钮信息点击触发 |  
| TRY_SEE_OVER | 试看被动检测触发启动后 | 单次试看结束 |  
| GLOBAL_PLAYER_STATUS | 全局预览回放状态切换时 | 全局预览回放状态切换 |  
| STOP_PLAY | 被动停止播放时 | 停止播放 |  
| START_PLAY | 开始播放时 | 开始播放触发 |  
| APPLY_AUTH | “申请权限”相关点击时 | 申请权限触发 |  
| APPLY_AUTH_OPENED | 申请权限图层被打开时 | 申请权限层打开 |  
| REFRESH | 取流失败后，点击“刷新重试”按钮触发 | 刷新 |  
| FIRST_PAGE | 被动初始化首页时 | 初始化首页触发 |
| PRE_PAGE | 点击底部状态栏时 | 前一页触发 |
| GO_PAGE | 跳转到某一页时 | 跳转页触发 |  
| NEXT_PAGE | 向后一页时 | 后一页触发 |  
| SELECT_WND | 选中视频窗格时 | 选中窗口触发 |  
| CHANGE_SCREEN | 改变分屏数时 | 改变分屏触发 |  
| CLOSE_WND | 关闭窗格时 | 关闭窗口触发 |  
| SINGLE_PREVIEW | 单个窗格预览后被动触发 | 单个播放器预览 |  
| SINGLE_PLAYBACK | 单个窗格回放后被动触发 | 单个播放器回放 |  
| BATCH_PREVIEW | 批量预览被动触发 | 批量播放器预览 |  
| BATCH_PLAYBACK | 批量回放被动触发 | 批量播放器回放 |  
| PLAYBACK_FAIL | 某个点位回放失败被动触发 | 回放失败 |  
| PREVIEW_FAIL | 某个点位预览失败被动触发 | 预览失败 |  
| PLAYBACK_SUCCESS | 某个点位回放成功被动触发 | 回放成功 |  
| PREVIEW_SUCCESS | 某个点位预览成功被动触发 | 预览成功 |  
| CLOSE_ALL_WND | 关闭所有窗格时 | 关闭所有窗口 |  
| CLOSE_ALL_BTN_CLICK | 点击关闭所有窗格时 | 关闭所有按钮点击事件 |  
| WND_STATUS_CHANGE | 窗口状态变化时 | 窗口状态变化 |  
| BATCH_ALGORITHM_ANALYSIS | 播放器顶部“算法分析”点击后 | 批量算法分析 |
| SINGLE_ALGORITHM_ANALYSIS | 某个窗口算法分析点击后 | 单个算法分析 |
| LABEL_TAG| 某个标记标记点击后 | 标签标记 |
| AI_RECOMMEND | 点击智能推荐时 | 智能推荐 |
| TIME_INTERVAL_CHANGE | 改变轮播时间时 | 轮播时间被改变事件 |
| MOVE_RIGHT |  | 向右滑动 |  
| MOVE_LEFT |  | 向左滑动 |
| BEFORE_GO_TO_PAGE | 切换翻页 | 翻页之前
| SINGLE_LOOP_END | 完成一次轮播时 | 单次轮询结束
| PTZ_TOP | mini云台控制窗口点击事件 | 云台控制向上
| PTZ_LEFT | mini云台控制窗口点击事件 | 云台控制向左
| PTZ_RIGHT | mini云台控制窗口点击事件 | 云台控制向右
| PTZ_BOTTOM | mini云台控制窗口点击事件 | 云台控制向下
| PTZ_LEFT_TOP | mini云台控制窗口点击事件 | 云台控制向左上
| PTZ_LEFT_BOTTOM | mini云台控制窗口点击事件 | 云台控制向左下
| PTZ_RIGHT_TOP | mini云台控制窗口点击事件 | 云台控制向右上
| PTZ_RIGHT_BOTTOM | mini云台控制窗口点击事件 | 云台控制向右下
| PTZ_FOCUS | mini云台控制窗口点击事件 | 云台控制聚焦
| PTZ_OUT_OF_FOCUS | mini云台控制窗口点击事件 | 云台控制失焦



### ==开放的API==

> <font color="#ff0000">一个前提条件：</font>看到这里，接下来所有的api说明中，都假设有一个前提，就是你已经拿到了点位数据，在调用播放器的api的时候，需要你对你拿到的数据进行map处理，处理成播放器要求的数据格式。
> <font color="#ff0000">一个注意点：</font>如果你的应用涉及到了权限，那么在调用以前任何一种方法时，均要考虑是否需要调用`doAddAuth`，一般情况下，是需要的。

#### ==doAddAuth==
更新权限
|   参数 | 类型 | 是否必填 | 含义 |
| -- | -- | -- | -- |
| pointInfos | Array | 是 | 视频点位对象集合 |

#### ==doReplacePlay==
替换到当前选中（无选中则指定_index替换）窗口
|   参数 | 类型 | 是否必填 | 含义 |
| -- | -- | -- | -- |
| pointInfo | Object | 是 | 视频点位对象 |
| _index | Number| 否 | 窗口下标（不传则默认替换当前选中窗口） |
| playStatus | String | 否 | 预览回放标识 |

**补充说明：**
- 替换原则：  
  1）不允许在同一屏下添加重复点（如果添加重复点则锚点到该点处）  
  2）替换到某个窗口前，一定会先从缓冲中读取，无则新增缓冲数据  
  3）无缓冲存在情况下，添加点位会丢失历史的权限信息

#### ==doPlayback==
批量回放,不传参则默认刷新
|   参数 | 类型 | 是否必填 | 含义 |
| -- | -- | -- | -- |
| pointInfo | String | 是 | 视频点位对象 |

关于参数pointInfo中核心参数说明：

|   字段名称 | 类型 | 是否必填 | 含义 |
| -- | -- | -- | -- |
| indexCode | String | 是 | 点位ID |
| url | String | 否 | 取流URL(对于极简播放器生效，rtsp协议取流地址) |
| recordStyle | Number | 否 | 存储类型 |
| transmode | Number | 否 | 取流方式 |
| streamType | Number | 否 | 码流类型 |
| startTime | String | 否 | 回放开始时间（+8区国际时间格式）|
| endTime | String | 否 | 回放结束时间（+8区国际时间格式）|
| _expandParams | Object | 否 | 扩展字段 |

关于字段补充说明<font color="#ff0000">（重要）</font>
- 回放时间段startTime和endTime，格式是：国际标准时间+8区时间，YYYY-MM-DDTHH:mm:ss.SSSZ，如果不传递则默认倒数一天起止时间。
- <font color="#ff0000">非必传并不是说可以不传，要按照真实的接口返回为准，有则一定要传，没有则不传，否则将影响回放效果。</font>
- 默认取流方式是indexCode，可以指定URL方式取流，也可以自适应方式取流。通过指定配置项`readStreamWay`实现。

关于H5的回放参数`h5Params`说明:
|   字段名称 | 类型 | 是否必填 | 含义 |
| -- | -- | -- | -- |
| streamType | String | 是 | 码流类型（按照接口返回如实传递） |
| transmode | Number | 否 | 取流方式（按照接口返回如实传递） |
| protocol | Number | 否 | 协议类型 |
| startTime | Number | 否 | 回放开始时间（+8区国际时间格式） |
| endTime | String | 否 | 回放结束时间（+8区国际时间格式）|

例如：
```
{
	indexCode,   
	transmode,  
	streamType,
	// ...,
	h5Params: {  
	    streamType: 0,  
	    transmode: 1,  
	    protocol: getH5Protocol(),  
	    startTime: moment(range[0]).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),   
	    endTime: moment(range[1]).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),  
	}
}
```
PS： 关于`getH5Protocol`方法，可以引用播放器中的。
```js
import {getH5Protocol} from "@/components/simple-player/util";
```



---
---
---
---
---
---
## 扩展阅读
**设计原则**
原则一：播放器抽象成类`SimplePlayerData`
原则二：播放器侧的功能解耦，独立到`lib`中，极简播放器是`cc.lib.js`，H5播放器是`h5.lib.js`
原则三：事件、配置项、权限、开放的API等都解耦到`mixin`中

### 重构原因

- 播放器变量分散，难以维护
- 相当一部分方法中存在较多的冗余逻辑
- 国产化和基线测试中修改缺陷频频，难收敛
- 播放器template中代码越来越多，越来越难以阅读
- 现有的窗格提示信息难以增加扩展，为了解决自定义窗口各种图层的问题。
- 能解决Pro不能不解决的权限问题。
- 能解决Pro没有的H5的问题。
- 重构后易于二次开发扩展。



### 详细解读 功能点


#### 目录结构

```  
├─simple-player 
|    | 
│    └─asssets 
|    |   |  svg-icons（播放器中图标库，靠近设计，仅支持svg，随放随用）  
│    └─components 
|    |   |  AlgorithmModal.vue（浓缩播放中算法选择弹框）  
|    |   |  Concentrate.vue（浓缩播放插件）  
|    |   |  CoverDialog.vue（全局弹框）  
|    |   |  DateDialog.vue（日期选择器）  
|    |   |  DefaultCameraImg.vue（默认图片）  
|    |   |  GlobalLayer.vue（全局图层入口文件）  
|    |   |  LoopPlayTimeSetting.vue（轮询组件）  
|    |   |  PlayerFooter.vue（窗格尾部组件）  
|    |   |  PlayerHeader.vue（窗格头部组件）  
|    |   |  PlayerLayer.vue（窗格遮罩层组件）  
|    |   |  SpeedSelect.vue（倍数播放组件）  
|    |   |  SvgI.vue（svg图标组件）  
|    |   |  TimeInterval.vue（轮询时间间隔选择组件）  
|    |   |  ToolBar.vue（全局底部工具栏）  
|    |   |  VideoPlanPlayHeader.vue（全局头组件）  
│    └─lib 
|    |   |  cc.lib.js（client-container库）  
|    |   |  checker.lib.js（预留）  
|    |   |  h5.lib.js（h5库）  
|    |   |  index.js（外放库，供给外部调用）  
|    |   |  notify.lib.js（提示封装库）  
|    |   |  params.lib.js（核心数据）  
|    |   |  player.lib.js（核心类）  
|    |   |  text.lib.js （文本封装）  
│    └─layer（遮罩图层库）
│    └─mixin 
|    |   |  ApiProps.mixin.js（API插件）  
|    |   |  Concentrate.mixin.js  
|    |   |  Config.mixin.js（配置项插件）  
|    |   |  Event.mixin.js（事件插件）  
|    |   |  LoopPlay.mixin.js  
|    |   |  OpenApiCommon.mixin.js（开放API插件）  
|    |   |  OpenApiForCc.mixin.js（开放API插件-极简专用）  
|    |   |  OpenApiForH5.mixin.js（开放API插件-h5专用）  
|    |   |  PlayerStyle.mixin.js  
|    |   |  SpFooter.mixin.js  
|    |   |  SpHeader.mixin.js  
│    └─index.vue 
```  


#### 播放器的数据结构

```  
{  
	 isDelete: false, // 非必需，点位是否已被删除  
	 indexCode: "", // 点位编码  
	 title: "", // 非必需，点位名称  
	 sequence: "", // 非必需，序号（启用showTitle后）  
	 sequenceHtml: "",  // 非必需，序号Html（启用showTitle后）  
	 recordType: '', // 非必需， 录像类型 传空查询全部录像片段 0|1|2|6 0 定时录像 1 移动侦测 2 报警触发 6 手动录像  
	 transmode: 1, // 非必需， 0 UDP 1 TCP streamType: 0, // 非必需，0 主码流 1 子码流  
	 status: "preview", // 非必需，内部使用  
	 capabilitySet: '', // 非必需，能力集 (默认非严格模式，严格模式下会使用该字段，配置中strictAuthMode为true)  
	 cascadeType: 0, // 非必需，点位级联属性（废弃，该字段无用）  
	 cameraType: 0, // 点位类型（重要字段，涉及到操作工具栏显隐）  
	 h5Params: { 
		 url: '', // 取流URL预览  
		 playbackUrl: '', // 取流URL回放  
		 szURL: null, // 取流URL  
		 playURL: null, proxy: null, mode: 0, // 必传；0 普通模式 1 高级模式； 默认0  
		 beginTime: null, // 回放必传开始时间，实时预览不需要传入  
		 endTime: null, // 回放必传结束时间，实时预览不需要传入  
		 previewFail: null, // 预览失败编码，H5内部不支持错误码展示，所以组件要单独显示  
		 playbackFail: null, // 回放失败描述，H5内部不支持错误码展示，所以组件要单独显示  
	 }, 
	 extraParams: { 
		 action: { 
			 playSnapAuth: false, 
			 playbackSnapAuth: false, 
			 digitalZoomAuth: false, 
			 ptzAuth: false, 
			 downloadAuth: false, 
			 audioRecvAuth: false, 
			 previewRecordAuth: false, 
			 playbackRecordAuth: false, 
			 tdZoomAuth: false, 
			 talkAuth: false, 
		 }, 
		 wndStatus: { // 非必需（TRY_SEE_OVER事件钩子中维护，可不传）  
			 previewAuth: true, // 预览权限  
			 remainPreviewCount: 3, // 预览剩余次数  
			 playbackAuth: true, // 回放权限  
			 remainPlaybackCount: 3, // 回放剩余次数  
		 } 
	 }
 }  
```  

> 功能点介绍详见线上文档


#### 事件注册DEMO

`api-methods`中提前注册声明API对象，demo如下：

```js
apiMethodsMap: {  
    queryH5PreviewApi: (params) => getH5PreviewUrl({  
        previewUrlParamList: [params]  
    }).then((res) => {  
	    // 返回包括code的完整的返回体。下面这样处理的原因是，真正的返回体包裹在indexCode中，所以要读取indexCode。
        return res && res.data && res.data[params.indexCode] && res.data[params.indexCode];  
    }),  
    queryH5PlaybackApi: (params) => getPlayBackUrl({playBackUrlParamList: [params]}).then((res) => {  
        return res && res.data && res.data[params.indexCode] && res.data[params.indexCode];  
    }),  
    queryAlgorithmsApi: getAlgorithmsApi,  
    querySwitchStatusApi: getSwitchStatusApi,  
    saveSwitchStatusApi: saveSwitchStatus,  
    queryPlaybackParamApi: getPlaybackParamApi,  
    queryVideoByLabelApi: queryVideoByLabelApi,  
    queryPreviewAuthApi: (params) => {  
        if (this.openAuthMode) {  
            return Promise.all([  
                resourcesByParamsApi({  
                    cameraIndexCodes: [params.indexCode],  
                    authCodes: ['preview']  
                }),  
                getRenmainderApi({  
                    indexCode: params.indexCode  
                })  
            ]).then(([r1, r2]) => {  
                return {  
                    previewAuth: r1.data && r1.data.includes(params.indexCode), // 预览权限  
			        remainPreviewCount: r2.data && r2.data.operateTimes && r2.data.operateTimes[0] && r2.data.operateTimes[0].playRealNum, // 预览剩余次数  
				  };  
            });  
        } else {  
            return new Promise((resolve) => {  
                resolve({  
                        previewAuth: true,  
                        remainPreviewCount: 3  
			    });  
            });  
        }  
    },  
    queryPlaybackAuthApi: (params) => {  
        if (this.openAuthMode) {  
            return Promise.all([  
                resourcesByParamsApi({  
                    cameraIndexCodes: [params.indexCode],  
                    authCodes: ['playback']  
                }),  
                getRenmainderApi({  
                    indexCode: params.indexCode  
                })  
            ]).then(([r1, r2]) => {  
                return {  
                    playbackAuth: r1.data && r1.data.includes(params.indexCode), // 回放权限  
					remainPlaybackCount: r2.data && r2.data.operateTimes && r2.data.operateTimes[0] && r2.data.operateTimes[0].playBackNum, // 回放剩余次数  
			    };  
            });  
        } else {  
            return new Promise((resolve) => {  
                resolve({  
                        playbackAuth: true,  
                        remainPlaybackCount: 3  
				});  
            });  
        }  
    },  
}

```


## 文档修订记录
| 修订内容 | 修订人 | 修订时间 |
| -- | -- | -- |
| 初始化文档 | lixiaodong31 | 2024-04-12 |
| 增加新功能说明，点搜使用的算法申请`showAlgorithmAnalysis` | lixiaodong31 | 2024-04-16 |
| 增加了安装依赖部分说明，主要是svg部分，变更了实现方案，以后必须安装`svg-sprite-loader`并配置 | lixiaodong31 | 2024-06-26 |
| 补充部分章节新增的功能说明 | lixiaodong31 | 2025-03-18 |
