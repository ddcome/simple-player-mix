$themes: (
        black: (
                // 文本字体颜色
                text_font_color: #000000,
                // 文本可hover后的背景颜色
                text_bg_hover_color: rgb(32, 128, 247),
                // 文本被hover、active的颜色
                text_hover_color: #ffffff,
                // 禁用文字颜色
                text_disabled_color: #777,
                // 播放器头部组件背景色
                header_bg_color: #3d3d3d,
                // 播放器尾部组件背景色
                footer_bg_color: #3d3d3d,
                // 工具栏背景色
                opt_bg_color: rgba(33, 33, 33, 0.85),
                // 工具栏按钮hover的颜色
                opt_btn_hover_color: #ffffff,
                // 工具栏按钮默认颜色
                opt_btn_default_color: #aaaaaa,
                // 时间弹框背景色
                select_options_bg_color: #ffffff,
        ),
        blue: (
                // 文本字体颜色
                text_font_color: #ffffff,
                // 文本可hover后的背景颜色
                text_bg_hover_color: rgba(18, 96, 230, 0.75),
                // 文本被hover、active的颜色
                text_hover_color: #ffffff,
                // 禁用文字颜色
                text_disabled_color: #777,
                // 播放器头部组件背景色
                header_bg_color: #174C73,
                // 播放器尾部组件背景色
                footer_bg_color: #174C73,
                // 工具栏背景色
                opt_bg_color: #04172B,
                // 工具栏按钮hover的颜色
                opt_btn_hover_color: rgba(18, 96, 230, 0.75),
                // 工具栏按钮默认颜色
                opt_btn_default_color: rgba(18, 96, 230, 0.75),
                // 时间弹框背景色
                select_options_bg_color: #002d5c,
                // 时间选择输入框颜色
                input_bg_color: #023569,
                input_bg_border_color: #0086c8,
        ),
);

// 科技蓝主题
.simple-player-wrapper[simple-player-mix-theme="blue"] {
        // 头、尾、窗口工具栏
        .sp-header {
                background-color: map-get(map-get($themes, blue), opt_bg_color) !important;
        }
        .tool-bar-outer .tool-bar {
                background: map-get(map-get($themes, blue), footer_bg_color) !important;
        }
        .vpph-outer {
                background: map-get(map-get($themes, blue), header_bg_color) !important;
        }

        // 时间组件相关 - 自定义弹框
        .time-interval .loop-time-select-options li.active {
                background: map-get(map-get($themes, blue), text_bg_hover_color) !important;
        }
        .time-interval .loop-time-select-options li {
                color: map-get(map-get($themes, blue), text_font_color) !important;
                background: map-get(map-get($themes, blue), select_options_bg_color) !important;
        }
        .loop-play-time-setting {
                background: map-get(map-get($themes, blue), select_options_bg_color) !important;

                .el-input__inner {
                        background: map-get(map-get($themes, blue), input_bg_border_color) !important;
                }
        }

        // 配置面板相关
        .setting,
        .setting-title,
        .setting-content,
        .setting-footer {
                background-color: map-get(map-get($themes, blue), select_options_bg_color) !important;
                color: map-get(map-get($themes, blue), text_font_color) !important;
                border-color: black;
                .el-form-item__label-text {
                        color: map-get(map-get($themes, blue), text_font_color) !important;
                }
        }
        .el-alert {
                background-color: map-get(map-get($themes, blue), header_bg_color) !important;
                .el-alert__title {
                        color: map-get(map-get($themes, blue), text_font_color) !important;
                }
        }

        // 回放时间选择组件相关
        .calendar-dialog {
                background: map-get(map-get($themes, blue), select_options_bg_color) !important;
                .el-date-range-picker__title {
                        color: map-get(map-get($themes, blue), text_font_color) !important;
                }
                .el-date-editor,
                .calendar-dialog-title,
                .el-picker-panel,
                .el-picker-panel__content div,
                .el-date-table {
                        background: map-get(map-get($themes, blue), select_options_bg_color) !important;
                        color: map-get(map-get($themes, blue), text_font_color) !important;
                }
                .el-picker-panel__footer {
                        background: map-get(map-get($themes, blue), select_options_bg_color) !important;
                }
                .el-time-panel {
                        background: map-get(map-get($themes, blue), header_bg_color) !important;
                }
                .el-time-spinner__item {
                        color: map-get(map-get($themes, blue), text_font_color) !important;
                }
                .el-time-spinner__item.active,
                .el-time-spinner__item:hover {
                        color: black !important;
                }
        }

        // 通用
        .el-input {
                input {
                        color: map-get(map-get($themes, blue), text_font_color) !important;
                        background: map-get(map-get($themes, blue), input_bg_color) !important;
                }
        }
        .el-button.el-button--default {
                background: map-get(map-get($themes, blue), header_bg_color) !important;
                border-color: map-get(map-get($themes, blue), input_bg_border_color) !important;
                color: map-get(map-get($themes, blue), text_font_color) !important;
        }

        .ptz-compass {
                background: map-get(map-get($themes, blue), select_options_bg_color) !important;
                .compass-outer {
                        background-color: map-get(map-get($themes, blue), opt_bg_color) !important;
                        border-color: map-get(map-get($themes, blue), opt_bg_color) !important;
                }
        }
}

// 默认黑主题
.simple-player-wrapper[simple-player-mix-theme="black"] {
        // 默认空，因播放器实现时，就采用的该主题，所以此处不需要覆盖
}

