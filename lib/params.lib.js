import {deepClone} from "./../util";

export const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * @object
 * @description *_AUTH记录的是是否权限，其他的为点击PRESS的状态记录
 * - PTZ_ABILITY 云台控制能力集
 * - PLAY_SNAP_ABILITY 截图权限能力集
 * - DOWNLOAD_ABILITY 下载权限能力集
 * - PLAYBACK_SNAP_ABILITY 回放截图能力集
 * - AUDIO_RECV_ABILITY 声音接收能力集
 * - PREVIEW_RECORD_ABILITY 预览录像能力集
 * - PLAYBACK_RECORD_ABILITY 回放录像能力集
 * - TALK_ABILITY
 * - SNAP 截图
 * - SNAP_MORE 连续抓拍
 * - SOUND 声音
 * - DIGITAL_ZOOM 电子放大
 * - TD_ZOOM 3D放大
 * - PTZ 云台控制
 * - CLOSE 关闭
 * - FRAME_NEXT 下一帧
 * - FRAME_PRE 上一帧
 * - PAUSE_OR_CONTINUE 暂停或继续
 * - INFO 详情
 * - PLAY_SNAP_AUTH 截图权限
 * - PLAYBACK_SNAP_AUTH 回放截图权限
 * - PTZ_AUTH 云台权限
 * - DOWNLOAD_AUTH 下载权限
 * - AUDIO_RECV_AUTH 声音接收权限
 * - PREVIEW_RECORD_AUTH 预览紧急录像权限
 * - PLAYBACK_RECORD_AUTH 回放紧急录像权限
 * - DIGITAL_ZOOM_AUTH 电子放大权限
 * - TALK_AUTH 对讲权限
 * - PREVIEW_RECORD 紧急录像
 * - PLAYBACK_RECORD 录像剪辑
 * - TALK 对讲
 * - IS_PAUSE 是否暂停
 * - LABEL_TAG 标签标记
 * - EVENT_REPORT 事件上报
 * - PICTURE_TAG 图片打标签
 * - AI_RECOMMEND 智能推荐
 * @return {String}
 * @author lixiaodong31 2023/9/19
 * @version 1.0.0
 * @example
 */
export const ACTION = {
    PTZ_ABILITY: 'ptzAbility',
    PLAY_SNAP_ABILITY: 'playSnapAbility',
    DOWNLOAD_ABILITY: 'downloadAbility',
    PLAYBACK_SNAP_ABILITY: 'playbackSnapAbility',
    AUDIO_RECV_ABILITY: 'audioRecvAbility',
    PREVIEW_RECORD_ABILITY: 'previewRecordAbility',
    PLAYBACK_RECORD_ABILITY: 'playbackRecordAbility',
    TALK_ABILITY: 'talkAbility',
    SNAP: 'snap',
    SNAP_MORE: 'snapMore',
    SOUND: 'sound',
    DIGITAL_ZOOM: 'digitalZoom',
    TD_ZOOM: 'tdZoom',
    PREVIEW_RECORD: 'previewRecord',
    PLAYBACK_RECORD: 'playbackRecord',
    TALK: 'talk',
    IS_PAUSE: 'isPause',
    PTZ: 'ptz',
    CLOSE: 'close',
    FRAME_NEXT: 'frameNext',
    FRAME_PRE: 'framePre',
    PAUSE_OR_CONTINUE: 'pauseOrContinue',
    INFO: 'info',
    TD_ZOOM_AUTH: 'tdZoomAuth',
    PLAY_SNAP_AUTH: 'playSnapAuth',
    PLAYBACK_SNAP_AUTH: 'playbackSnapAuth',
    PTZ_AUTH: 'ptzAuth',
    DOWNLOAD_AUTH: 'downloadAuth',
    AUDIO_RECV_AUTH: 'audioRecvAuth',
    DIGITAL_ZOOM_AUTH: 'digitalZoomAuth',
    PREVIEW_RECORD_AUTH: 'previewRecordAuth',
    PLAYBACK_RECORD_AUTH: 'playbackRecordAuth',
    TALK_AUTH: 'talkAuth',
    LABEL_TAG: 'labelTag',
    EVENT_REPORT: 'eventReport',
    PICTURE_TAG: 'pictureTag',
    AI_RECOMMEND: 'aiRecommend',
}

/**
 * @function
 * @description 获取action默认对象
 * @return {{}}
 * @author lixiaodong31 2023/9/19
 * @version 1.0.0
 * @example
 */
function getAction() {
    // 使用Object.values()获取ACTION对象的所有键，然后遍历这些键，为新对象设置相应的键值对，其值为false
    return Object.values(ACTION).reduce((acc, key) => {
        acc[key] = false;
        return acc;
    }, {});
}

/**
 * @function
 * @description 获取轮询时间间隔选项集
 * @author lixiaodong31 2023/10/2
 * @version 1.0.0
 * @example
 */
function getToolBarOptions() {
    try {
        return deepClone(LOOP_TIME_OPTIONS);
    } catch (e) {
        return [];
    }
}

/**
 * @function
 * @description 获取轮询时间间隔选项集默认选项
 * @author lixiaodong31 2023/10/2
 * @version 1.0.0
 * @example
 */
function getToolBarDefaultOption() {
    try {
        return deepClone(LOOP_TIME_OPTIONS[0]);
    } catch (e) {
        return [];
    }
}

/**
 * @function
 * @description 播放器播放状态
 *
 * - DOPLAYED 请求播放中
 * - PLAYING 播放中
 * - FAILING 播放失败
 * - CLOSE 关闭
 * - DONE 回放结束
 * - UNKNOWN 未知
 * - PAUSE 暂停
 * @return {String}
 * @author lixiaodong31 2023/8/22
 * @version 1.0.0
 * @example
 */
export const PLAYER_STATUS_MAP = {
    DOPLAYED: "doPlayed",
    PLAYING: "playing",
    FAILING: "failing",
    CLOSE: "close",
    DONE: "done",
    UNKNOWN: "unknown",
    PAUSE: "pause"
}

/**
 * @function
 * @description 播放器返回方法MAP
 * - NOTIFY_METHOD对象包含三个对象：FROM_METHOD, TYPE, MSG。
 * - FROM_METHOD对象包含以下五个字符串常量：
 * - START_PLAY_REAL （开始实时播放）
 * - START_PLAY_BACK （开始回放）
 * - REAL_RECORD （实时录制）
 * - SNAP_SHOT （快照）
 * - TYPE对象包含以下六个字符串常量：
 * - PAUSE_PLAY_BACK （暂停回放）
 * - SPEED_CHANGED（速度改变）
 * - REFRESH（刷新）
 * - DOUBLE_CLICK（双击）
 * - DOWNLOAD（下载）
 * - CALENDAR（日历）
 * - DROP_EVENT（拖放事件）
 * - GESTURE（手势）
 * - SELECT_EXISTING_DIR（文件夹选择器）
 * - MSG对象包含以下二十二个字符串常量：
 * - ZOOM_IN（放大）
 * - ZOOM_OUT（缩小）
 * - MOVE_RIGHT（向右移动）
 * - MOVE_LEFT（向左移动）
 * - MOVE_UP（向上移动）
 * - MOVE_DOWN（向下移动）
 * - CHANGE_TO_PLAY_REAL（切换到实时播放）
 * - CHANGE_TO_PLAY_BACK（切换到回放）
 * - ABOUT（关于）
 * - ENTER_PTZ（进入云台）
 * - LEAVE_PTZ（离开云台）
 * - CLOSE（关闭）
 * - TOUCH_BAR_SHOW（显示触摸条）
 * - TOUCH_BAR_HIDE（隐藏触摸条）
 * - ENTER_DIGITAL_ZOOM（进入数字变焦）
 * - LEAVE_DIGITAL_ZOOM（退出数字变焦）
 * - OPEN_VOICE（打开声音）
 * - CLOSE_VOICE（关闭声音）
 * @return {String}
 * @author lixiaodong31 2023/9/20
 * @version 1.0.0
 * @example
 */
export const NOTIFY_METHOD = {
    FROM_METHOD: {
        START_PLAY_REAL: 'startPlayReal',
        START_PLAY_BACK: 'startPlayBack',
        REAL_RECORD: 'realRecord',
        SNAP_SHOT: 'snapShot',
    },
    TYPE: {
        PAUSE_PLAY_BACK: 'pausePlayBack',
        SPEED_CHANGED: 'speedChanged',
        REFRESH: 'refresh',
        DOUBLE_CLICK: 'doubleclick',
        DOWNLOAD: 'download',
        CALENDAR: 'calendar',
        DROP_EVENT: 'dropEvent',
        GESTURE: 'gesture',
        SELECT_EXISTING_DIR: 'selectExistingDir',
    },
    MSG: {
        ZOOM_IN: 'zoomIn',
        ZOOM_OUT: 'zoomOut',
        MOVE_RIGHT: 'moveRight',
        MOVE_LEFT: 'moveLeft',
        MOVE_UP: 'moveUp',
        MOVE_DOWN: 'moveDown',
        CHANGE_TO_PLAY_REAL: 'changeToPlayReal',
        CHANGE_TO_PLAY_BACK: 'changeToPlayBack',
        ABOUT: 'about',
        ENTER_PTZ: 'enterPTZ',
        LEAVE_PTZ: 'leavePTZ',
        CLOSE: 'close',
        TOUCH_BAR_SHOW: 'touchBarShow',
        TOUCH_BAR_HIDE: 'touchBarHide',
        ENTER_DIGITAL_ZOOM: 'enterDigitalZoom',
        LEAVE_DIGITAL_ZOOM: 'leaveDigitalZoom',
        OPEN_VOICE: 'openVoice',
        CLOSE_VOICE: 'closeVoice',
    }
}

/**
 * @function
 * @description 哪种播放模式
 * @return {String}
 * @author lixiaodong31 2023/8/22
 * @version 1.0.0
 * @example
 */
export const PLAYER_MODE_MAP = {
    PREVIEW: {
        label: '预览中',
        value: "preview"
    },
    PLAYBACK: {
        label: '回放中',
        value: "playback"
    },
    ERROR: {
        label: '出错了',
        value: "error"
    }
}

/**
 * @object
 * @description 能力集有很多,此处是视频广场用到的能力集
 * - VSS 视频能力
 * - PTZCONTROL 云台能力
 * - PREVIEWCANDIDSHOT 预览抓拍
 * - RECORDDOWNLOAD 录像下载
 * - PLAYBACKCANDIDSHOT 录像抓拍
 * - AUDIORECV 声音接收
 * - PREVIEWRECORD 预览紧急录像
 * - PLAYBACKRECORD 回放紧急录像
 * - TALK 对讲
 * @return {String}
 * @author lixiaodong31 2023/9/19
 * @version 1.0.0
 * @example
 */
export const ABILITY = {
    VSS: 'vss',
    PTZ: 'ptz',
    PTZCONTROL: 'ptzControl',
    PREVIEWCANDIDSHOT: 'previewCandidShot',
    RECORDDOWNLOAD: 'recordDownload',
    PLAYBACKCANDIDSHOT: 'playbackCandidShot',
    AUDIORECV: 'audioRecv',
    PREVIEWRECORD: 'previewRecord',
    PLAYBACKRECORD: 'playbackRecord',
    TALK: 'talk',
}

/**
 * @object
 * @description 级联状态
 * @return {String}
 * @author lixiaodong31 2023/9/19
 * @version 1.0.0
 * @example
 */
export const CASCADE_TYPE = {
    benji: {
        value: 0,
        label: '本级'
    },
    jilian: {
        value: 1,
        label: '级联'
    }
}

/**
 * @object
 * @description 点位类型
 *
 * - sdmc(目前平台采用的字典值) - 0 - 枪机， 1 - 半球， 2 - 球机， 3 - 云台枪机，
 * - ncg参数值含义 - 0，可控制标清球机（或带云台标清枪机）；1标清枪机；2，可控高清球机（或带云台高清枪机）；3，高清枪机；4，车载监控；5，不可控制标清球机；6，不可控高清球机
 * @return {String}
 * @author lixiaodong31 2023/9/19
 * @version 1.0.0
 * @example
 */
export const CAMERA_TYPE = {
    qiangji: {
        value: 0,
        label: '枪机'
    },
    qiuji: {
        value: 1,
        label: '半球'
    },
    qiuji1: {
        value: 2,
        label: '球机'
    },
    yuntaiqiangji: {
        value: 3,
        label: '云台枪机'
    }
}

/**
 * @function
 * @description 点位所有权限，这里是所有权限，权限是通过后端动态获取
 *
 * - camera    监控点
 * - - view    查看
 * - - preview    预览
 * - - playback    录像回放
 * - - ptzControl    云台控制
 * - - consoleConf    云台配置
 * - - audioRecv    接收声音
 * - - previewCandidShot    预览抓拍
 * - - playbackCandidShot    录像抓拍
 * - - previewRecord    紧急录像
 * - - playbackRecord    录像剪辑
 * - - recordDownload    录像下载
 * - - talk    语音对讲
 * @return {String}
 * @author lixiaodong31 2023/8/18
 * @version 1.0.0
 * @example
 */
export const POINT_AUTH_MAP = {
    VIEW: 'view',
    PREVIEW: 'preview',
    PLAYBACK: 'playback',
    PTZ_CONTROL: 'ptzControl',
    CONSOLE_CONF: 'consoleConf',
    AUDIO_RECV: 'audioRecv',
    PREVIEW_CANDID_SHOT: 'previewCandidShot',
    PLAYBACK_CANDID_SHOT: 'playbackCandidShot',
    PREVIEW_RECORD: 'previewRecord',
    PLAYBACK_RECORD: 'playbackRecord',
    RECORD_DOWNLOAD: 'recordDownload',
    TALK: 'talk'
}

/**
 * @object
 * @description 循环时间options
 * @return {String}
 * @author lixiaodong31 2023/9/14
 * @version 1.0.0
 * @example
 */
export const LOOP_TIME_OPTIONS = [
    {
        key: 1,
        txt: '10秒',
        valSecond: 10,
        value: 10,
        unit: '秒'
    },
    {
        key: 2,
        txt: '20秒',
        valSecond: 20,
        value: 20,
        unit: '秒'
    },
    {
        key: 3,
        txt: '1分钟',
        valSecond: 60,
        value: 1,
        unit: '分钟'
    },
    {
        key: 4,
        txt: '2分钟',
        valSecond: 120,
        value: 2,
        unit: '分钟'
    },
    {
        key: 5,
        txt: '5分钟',
        valSecond: 300,
        value: 5,
        unit: '分钟'
    },
    {
        key: 100,
        txt: '自定义轮巡时间间隔',
        valSecond: 0,
        value: 0,
        unit: '秒'
    }
]

/**
 * @object
 * @description 轮询时间设置器常量
 * - SECOND_MIN - 秒最小值
 * - MINUTE_MIN - 分钟最小值
 * - SECOND_MAX - 秒最大值
 * - MINUTE_MAX - 分钟最大值
 * @author lixiaodong31 2024/3/10
 * @version 1.0.0
 * @example
 */
export const LOOP_TIME_CONSTANT = {
    MINUTE_MIN: 3, // 分钟最小值
    SECOND_MIN: 3, // 秒最小值
    SECOND_MAX: 600, // 秒单位的最大值
    MINUTE_MAX: 10, // 分钟单位的最大值
    UNIT: [
        {
            value: "second",
            label: "秒"
        },
        {
            value: "min",
            label: "分钟"
        },
    ]
}

/**
 * @object
 * @description 倍速回放字典值（极简专用）
 *
 * - 1/64x - 1/64倍数
 * - 1/32x - 1/32倍数
 * - 1/16x - 1/16倍数 值为-4
 * - 1/8x - 1/8倍数 值为-3
 * - 1/4x - 1/4倍数 值为-2
 * - 1/2x - 1/2倍数 值为-1
 * - 1x - 1倍数 值为0
 * - 2x - 2倍数 值为1
 * - 3x - 3倍数 值为2
 * - 4x - 4倍数 值为3
 * - 16x - 16倍数 值为4
 * @author lixiaodong31 2023/12/8
 * @version 1.0.0
 * @example
 */
export const SPEED = {
    '1/16x': -4,
    '1/8x': -3,
    '1/4x': -2,
    '1/2x': -1,
    '1x': 0,
    '2x': 1,
    '4x': 2,
    '8x': 3,
    '16x': 4,
}

/**
 * @function
 * @description 倍速KEY
 *
 * - S1HALF16 - 1/16x
 * - S1HALF8 - 1/8x
 * - S1HALF4 - 1/4x
 * - S1HALF2 - 1/2x
 * - S1 - 1x
 * - S2 - 2x
 * - S4 - 4x
 * - S8 - 8x
 * - S16 - 16x
 * @author lixiaodong31 2023/12/14
 * @version 1.0.0
 * @example
 */
export const SPEED_KEY = {
    S1HALF16: '1/16x',
    S1HALF8: '1/8x',
    S1HALF4: '1/4x',
    S1HALF2: '1/2x',
    S1: '1x',
    S2: '2x',
    S4: '4x',
    S8: '8x',
    S16: '16x',
}

/**
 * @object
 * @description 播放倍速（H5专用）
 * @author lixiaodong31 2023/12/8
 * @version 1.0.0
 * @example
 */
export const SPEED_FOR_H5 = {
    '1/8x': -3,
    '1/4x': -2,
    '1/2x': -1,
    '1x': 0,
    '2x': 1,
    '4x': 2,
    '8x': 3,
}

/**
 * @object
 * @description THEME 主题色
 *
 * - BLACK - 默认黑
 * - WHITE - 白色系
 * - BLUE - 科技蓝
 * @author lixiaodong31 2023/9/28
 * @version 1.0.0
 * @example
 */
export const THEME = {
    BLACK: 'black',
    WHITE: 'white',
    BLUE: 'blue',
}

/**
 * @function
 * @description 播放器对外开放配置项。
 * config.mixin负责 承上 调用传递的参数 启下 内部解析CONFIG参数设置到simplePlayerData对象中
 *
 * - theme 主题
 * - mode 模式
 * - single 是否是最简播放器
 * - userIndexCode 用户indexCode
 * - globalTopHeader 全局头部
 * - - display 是否展示
 * - - hasConcentrate 是否有浓缩播放
 * - globalToolBar 全局底部工具栏
 * - - display 是否展示
 * - - hasPlayerBtnGroup 是否有播放器按钮组
 * @return {Object}
 * @author lixiaodong31 2023/9/27
 * @version 1.0.0
 * @example
 */
export const CONFIG = {
    theme: 'black', // 主题
    mode: 2,
    debug: true,
    maxScreen: 9,
    userId: '',
    globalTopHeader: {
        display: true,
        hasConcentrate: true,
    },
    globalToolBar: {
        display: true,
        hasPlayerBtnGroup: true,
    },
}

/**
 * @function
 * @description 模式
 *
 * - SIMPLE - 最简模式 1
 * - NORMAL - 普通模式 2
 * - VIDEO_PLAN - 视频预案模式 3
 * @author lixiaodong31 2023/9/28
 * @version 1.0.0
 * @example
 */
export const MODE = {
    SIMPLE: 1,
    NORMAL: 2,
    NONGSUO: 3,
    VIDEO_PLAN: 4
}

/**
 * @object
 * @description 播放器类型
 *
 * - H5_PLAYER - H5播放器
 * - CLIENT_CONTAINER - 极简播放器
 * @author lixiaodong31 2023/10/20
 * @version 1.0.0
 * @example
 */
export const PLAYER_TYPE = {
    H5_PLAYER: 'h5_player',
    CLIENT_CONTAINER: 'client_container'
}

/**
 * @function
 * @description 码流类型
 * @author lixiaodong31 2023/12/6
 * @version 1.0.0
 * @example
 */
export const STREAM_TYPE = {
    0: '主码流',
    1: '子码流',
    2: '第三码流',
}

/**
 * @function
 * @description 协议类型
 * @author lixiaodong31 2023/12/6
 * @version 1.0.0
 * @example
 */
export const PROTOCOL_TYPE = {
    RTSP: 'rtsp', // 默认
    WEBSOCKET: 'ws',
    RTMP: 'rtmp',
    HLS: 'hls',
}

/**
 * @function
 * @description 协议类型
 * @author lixiaodong31 2023/12/6
 * @version 1.0.0
 * @example
 */
export const TRANSMODE_TYPE = {
    UDP: 0,
    TCP: 1 // 默认
}

/**
 * @function
 * @description 播放器抛出事件类型
 * 播放器事件统一。事件参数规则为：类型 + 参数 + 回调事件。
 * - SHOW_PLAYER_INFO - 播放器头部按钮信息点击触发
 * - TRY_SEE_OVER - 单次试看结束
 * - GLOBAL_PLAYER_STATUS - 全局预览回放状态切换
 * - STOP_PLAY - 试看权限被动触发停止播放
 * - START_PLAY - 开始播放触发
 * - APPLY_AUTH - 申请权限触发
 * - APPLY_AUTH_OPENED - 申请权限层打开
 * - REFRESH - 刷新
 * - FIRST_PAGE - 初始化首页触发
 * - PRE_PAGE - 前一页触发
 * - GO_PAGE - 跳转页触发
 * - NEXT_PAGE - 后一页触发
 * - SELECT_WND - 选中窗口触发
 * - CHANGE_SCREEN - 改变分屏触发
 * - CLOSE_WND - 关闭窗口触发
 * - SINGLE_PREVIEW - 单个播放器预览
 * - SINGLE_PLAYBACK - 单个播放器回放
 * - BATCH_PREVIEW - 批量播放器预览
 * - BATCH_PLAYBACK - 批量播放器回放
 * - PLAYBACK_FAIL - 回放失败
 * - PREVIEW_FAIL - 预览失败
 * - PLAYBACK_SUCCESS - 回放成功
 * - PREVIEW_SUCCESS - 预览成功
 * - CLOSE_ALL_WND - 关闭所有窗口
 * - CLOSE_ALL_BTN_CLICK - 关闭所有按钮点击事件
 * - WND_STATUS_CHANGE - 窗口状态变化
 * - BATCH_ALGORITHM_ANALYSIS - 批量算法分析
 * - SINGLE_ALGORITHM_ANALYSIS - 单个算法分析
 * - LABEL_TAG - 标签标记
 * - AI_RECOMMEND - 智能推荐
 * - TIME_INTERVAL_CHANGE - 轮询时间改变时
 * - MOVE_RIGHT - 向右滑动
 * - MOVE_LEFT - 向左滑动
 * - BEFORE_GO_TO_PAGE - 翻页之前
 * - SINGLE_LOOP_END - 单次轮询结束
 * - PTZ_TOP - 云台控制向上
 * - PTZ_LEFT - 云台控制向左
 * - PTZ_RIGHT - 云台控制向右
 * - PTZ_BOTTOM - 云台控制向下
 * - PTZ_LEFT_TOP - 云台控制向左上
 * - PTZ_LEFT_BOTTOM - 云台控制向左下
 * - PTZ_RIGHT_TOP - 云台控制向右上
 * - PTZ_RIGHT_BOTTOM - 云台控制向右下
 * - PTZ_FOCUS - 云台控制聚焦
 * - PTZ_OUT_OF_FOCUS - 云台控制失焦
 * -
 * @author lixiaodong31 2023/10/16
 * @version 1.0.0
 * @example
 */
export const EVENT_TYPE = {
    SHOW_PLAYER_INFO: 'show_player_info',
    TRY_SEE_OVER: 'try_see_over',
    GLOBAL_PLAYER_STATUS: 'global_player_status',
    STOP_PLAY: 'stop_play',
    START_PLAY: 'start_play',
    APPLY_AUTH: 'apply_auth',
    APPLY_AUTH_OPENED: 'apply_auth_opened',
    REFRESH: 'refresh',
    FIRST_PAGE: 'first_page',
    PRE_PAGE: 'pre_page',
    NEXT_PAGE: 'next_page',
    GO_PAGE: 'go_page',
    SELECT_WND: 'select_wnd',
    CHANGE_SCREEN: 'change_screen',
    CLOSE_WND: 'close_wnd',
    SINGLE_PREVIEW: 'single_preview',
    SINGLE_PLAYBACK: 'single_playback',
    BATCH_PREVIEW: 'batch_preview',
    BATCH_PLAYBACK: 'batch_playback',
    PLAYBACK_FAIL: 'playback_fail',
    PREVIEW_FAIL: 'preview_fail',
    PLAYBACK_SUCCESS: 'playback_success',
    PREVIEW_SUCCESS: 'preview_success',
    CLOSE_ALL_WND: 'close_all_wnd',
    CLOSE_ALL_BTN_CLICK: 'close_all_btn_click',
    WND_STATUS_CHANGE: 'wnd_status_change',
    BATCH_ALGORITHM_ANALYSIS: 'batch_algorithm_analysis',
    SINGLE_ALGORITHM_ANALYSIS: 'single_algorithm_analysis',
    LABEL_TAG: 'label_tag',
    AI_RECOMMEND: 'ai_recommend',
    TIME_INTERVAL_CHANGE: 'time_interval_change',
    MOVE_RIGHT: 'moveRight',
    MOVE_LEFT: 'moveLeft',
    BEFORE_GO_TO_PAGE: 'before_go_to_page',
    SINGLE_LOOP_END: 'single_loop_end',
    PTZ_TOP: 'ptz_top',
    PTZ_LEFT: 'ptz_left',
    PTZ_RIGHT: 'ptz_right',
    PTZ_BOTTOM: 'ptz_bottom',
    PTZ_LEFT_TOP: 'ptz_left_top',
    PTZ_LEFT_BOTTOM: 'ptz_left_bottom',
    PTZ_RIGHT_TOP: 'ptz_right_top',
    PTZ_RIGHT_BOTTOM: 'ptz_right_bottom',
    PTZ_FOCUS: 'ptz_focus',
    PTZ_OUT_OF_FOCUS: 'ptz_out_of_focus',
}

/**
 * @function
 * @description 录像存储位置(默认中心存储)
 *
 * - 0-中心存储
 * - 1-设备存储
 * @author lixiaodong31 2023/12/5
 * @version 1.0.0
 * @example
 */
export const VIDEO_STORAGE = {
    ZHOGNXIN: 0,
    SHEBEI: 1
}

/**
 * 极简取流方式
 * - 0-通过URL取流
 * - 1-通过indexCode取流
 * - 2-自动识别
 *
 * @return {Object}
 */
export const READ_STREAM_WAY = {
    URL: 0,
    INDEX_CODE: 1,
    AUTO: 2
}

/**
 * 连续抓拍方式
 * @return {Object}
 * @author lixiaodong31 2024/5/17
 * @version 1.0.0
 */
export const I_SNAP_MODE_OPTIONS = [
    {
        label: '按时间连续抓拍',
        value: 1
    },
    {
        label: '按帧连续抓拍',
        value: 2
    },
];


/**
 * 插件助手下载地址
 * @author lixiaodong31 2024/9/23
 * @version 1.0.0
 */
export const BTOOL_URL = {
    WIN: '/portal/out/getPackageById.do?id=btools',
    OTHER: '/portal/download',
}


/**
 * @object
 * @description 播放器额外参数
 * @return {String}
 * @author lixiaodong31 2023/8/18
 * @version 1.0.0
 * @example
 */
export const PLAYER_EXTRA_PARAMS = {
    index: 0, // 该视频对应的宫格数组下标,也是播放器的唯一ID，很重要，所有的操作都是基于这个值
    hasAllAuth: false, // 该点位拥有所有权限
    isPlaybackAgain: false, // 是否已经切换过中心存储或者设备存储
    hasAuth: [], // 该点位拥有的权限
    capability: [], // 该点位拥有的能力集
    emptyWnd: true, // 默认不是空窗口。是否是空窗口，某些操作需要判断该值才能进行。
    thumbnail: '', // 缩略图
    playerReady: false, // 播放器是否就绪
    action: getAction(), // 获取所有播放器顶部工具栏的操作项
    wndStatus: {
        previewAuth: true, // 预览权限
        remainPreviewCount: 3, // 预览剩余次数
        playbackAuth: true, // 回放权限
        remainPlaybackCount: 3, // 回放剩余次数
        timeEnd: false, // 是否到了15s
        tickTimer: null, // 定时器ID
        stopTimer: null, // 延时器ID
        selected: false, // 窗格当前选中状态
        lastSecond: 0,
        speed: 0, // 回放 播放速度
        status: "doPlayed" // doPlayed 请求播放中 playing 播放中 failing 播放失败 pause 暂停 close 关闭
    }, // 窗口状态
    concentrate: { // 浓缩播放参数
        list: '', // 浓缩播放片段
        startTime: '', // 查询回放的开始时间
        endTime: '', // 查询回放的结束时间
        url: '', // 回放2地址
        streamDispatchMode: '', // 播放器API参数
        queryReqReady: '', // 查询录像片段相关接口是否均就绪
        doSpeed16PlayTimes: 0, // 16倍速播放调用次数，用于仅触发一次控制
        doSpeedPlayTimes: 0, // 正常播放调用次数，用于仅触发一次控制
        isDateRight: '', // 浓缩播放的设备和服务时间校时是否准确，通过帧位置是否在第一片段开始位置处
        intervalId: null, // 定时轮询器ID记录
    }
}

/**
 * @function
 * @description 原始数据 播放器API的核心参数来源 外部调用方传入
 * 此处是为了兼容，所以这部分数据不动；
 * 使用原则是，没用的拒绝使用；
 * @return {String}
 * @author lixiaodong31 2023/8/22
 * @version 1.0.0
 * @example
 */
export const BASE_PARAMS = {
    isDelete: false, // 点位是否在底层已经不存在，是否被删除的标志
    indexCode: "",
    title: "",
    sequence: "", // 序号
    sequenceHtml: "",  // 序号Html
    transmode: 1,
    streamType: 0,
    isSmallEagleEyeAbility: 0,
    status: "preview", // 回放中、预览中、出错了
    cloudAbility: true,
    capabilitySet: '', // 能力集
    cascadeType: 0,
    cameraType: 0, // 点位类型
    selfStatus: false, // 废弃字段（视频广场侧废弃了这个字段，由后端去判断这种权限业务）
    h5Params: null,
    extraParams: null, // 附加扩展字段，其中的数据均会映射到_extra中
}

/**
 * @object
 * @description H5参数
 * @author lixiaodong31 2023/10/19
 * @version 1.0.0
 * @example
 */
export const H5_PARAMS = {
    tokens: {}, // 构架226以上，细颗粒权限
    url: '', // 取流URL预览
    playbackUrl: '', // 取流URL回放
    timeSegments: null, // 时间段集合
    szURL: null, // 取流URL
    playURL: null,
    proxy: null,
    mode: 0, // 必传；0 普通模式 1 高级模式； 默认0
    curIndex: null, // curIndex当前窗口下标
    beginTime: null, // 回放必传开始时间，实时预览不需要传入
    endTime: null, // 回放必传结束时间，实时预览不需要传入
    width: null, // 每个播放器的宽度
    height: null, // 每个播放器的高度
    previewFail: null, // 预览失败编码，H5内部不支持错误码展示，所以组件要单独显示
    playbackFail: null, // 回放失败描述，H5内部不支持错误码展示，所以组件要单独显示
}

/**
 * @object
 * @description 所有播放器全局参数
 * @return {String}
 * @author lixiaodong31 2023/8/18
 * @version 1.0.0
 * @example
 */
export const GLOBAL_PARAMS = {
    playerType: PLAYER_TYPE.CLIENT_CONTAINER, // 默认是极简播放器
    theme: THEME.BLACK, // 默认深色主题
    selectedWnd: null, // 当前选中的窗格编号
    selectedWndData: null, // 当前选中的窗格对象
    strictAuthMode: false, // 权限严格模式，false则不校验能力集,默认校验能力集
    hoverWnd: null, // 当前hover的窗格编号
    hasApplyAuth: true, // 有无申请权限功能,默认有
    maxScreen: 9, // 最大支持分屏数,不建议使用16，对电脑性能要求高
    ccLocalConfig: null, // 极简播放器本地参数配置
    screenMap: [], // 所有分屏MAP
    lastMinTimes: -1, // 剩余次数临界值，-1时标志没有剩余次数了
    showMoreScreens: false, //  是否开启所有屏，开启后会看到异形屏
    showTitle: true, // 是否展示窗格标题
    showToolBar: true, // 底部工具栏
    showHeader: true, // 头部工具栏
    showSetting: true, // 是否展示配置按钮
    showSequence: false, // 是否展示窗格编号
    showAlgorithmAnalysis: false, // 是否展示算法分析模块
    showLabelTag: false, // 是否展示标签标注模块
    showEventReport: false, // 是否展示事件上报按钮
    showPictureTag: false, // 是否展示图片标签
    showAiRecommend: false, // 是否展示智能推荐
    openPtzWidthMini: false, // 开启云台是否携带mini窗口
    closeAll: false, // 是否关闭所有
    fullScreen: false, // 是否是全屏
    historyScreen: null, // 上一次的分屏数
    currentScreen: 1, // 当前是几分屏 1 4 9 24
    currentDiffScreenId: -1, // 异形屏中当前选中项ID
    ccExists: true, // 播放器插件是否存在
    hasConcentrate: true, // 是否有浓缩播放功能
    mode: 2, // 详见MODE字典
    videoTryTime: 15, // 试看最大时长（s）
    readStreamWay: 1, // 极简取流方式
    checkTool: true, // 是否检测插件助手，默认true
    loop: false, // 是否开启了自动轮询
    h5EnvReady: false, // H5播放器环境信息是否就绪
    h5ParamsKey: 'h5Params', // H5播放器参数
    extraKey: '_extra', // 播放器的额外参数在哪个字段下
    extraParamsKey: 'extraParams', // 外部额外参数在哪个字段下
    capabilitySetKey: 'capabilitySet', // 能力集字段名称
    refPre: 'simplePlayer', // 播放器ref
    globalStatus: 'preview', // 全局的播放状态
    userId: '', // 用户ID,废弃，用户名主要是播放器配置参数中存在
    toolBar: {
        options: getToolBarOptions(),
        current: getToolBarDefaultOption(), // 自动轮询时间间隔的当前项
    },
    commonConfig: {}, // 播放器配置项
    cachePoints: [], // 缓冲当前的所有的点位，点位数据是多少取决于调用播放器组件时传递了多少 重点！！！
    pagination: {
        pageNo: 1, // 当前页
        size: 1, // 总页码
        currentPageFirstIndexCode: null, //当前页第一个点位indexCode
        total: 0, // 总点位数
        currentPageNum: 0 // 当前页码中点位数
    },
    playInfos: [], // 包含所有播放器相关参数的对象
    initParams: ['playInfos', 'pagination', 'cachePoints', 'toolBar'], // 此对象中需要初始化的字段集
    queryH5PreviewParamKeys: ['indexCode', 'streamType', 'protocol', 'transmode', 'expand', 'address', 'domainName'], // h5查询参数，在使用外部api事生效. 默认来源于 API网关 中的接口标准 /api/video/v1/cameras/previewURLs
    queryH5PlaybackParamKeys: ['indexCode', 'startTime', 'endTime', 'recordType', 'recordStyle', 'protocol', 'dataType', 'lockType', 'expand', 'address', 'domainName'], // h5查询参数，在使用外部api事生效 /api/video/v1/cameras/playbackURLs
}

// 全局参数中常量参数，可以后续不断被初始化的变量
export const CONST_KEYS_OF_GLOBAL_PARAMS = ['playInfos', 'pagination', 'cachePoints', 'toolBar']
