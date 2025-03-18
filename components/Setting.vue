<template>
    <div class="setting" hikcc_cover="opaque" v-if="visible">
        <p class="setting-title">
            <span class="title-span">设置</span>
            <svg-i
                class="screen-icon"
                title="关闭"
                :font-size="1.2"
                color="#000"
                hoverColor="#000"
                icon="close"
                @click.native="close()"
            />
        </p>

        <div class="setting-content">
            <el-alert title="此设置对本台电脑生效，不局限于当前功能模块。" type="info" simple show-icon></el-alert>
            <el-form
                class="setting-form"
                ref="form"
                :model="form"
                :rules="rules"
                label-position="left"
                label-width="140px"
            >
                <el-form-item label="截图保存路径" prop="strSnapPath">
                    <el-input v-model="form.strSnapPath" :disabled="strSnapPathDisabled">
                        <el-button
                            slot="append"
                            :disabled="strSnapPathDisabled"
                            icon="h-icon-folder_open"
                            @click.stop="openDir('snapDirIpt')"
                        ></el-button>
                    </el-input>
                </el-form-item>
                <el-form-item label="紧急录像保存路径" prop="strRecordPath">
                    <el-input v-model="form.strRecordPath" :disabled="strRecordPathDisabled">
                        <el-button
                            slot="append"
                            :disabled="strRecordPathDisabled"
                            icon="h-icon-folder_open"
                            @click.stop="openDir('recordDirIpt')"
                        ></el-button>
                    </el-input>
                </el-form-item>
                <el-form-item label="连续抓拍模式" prop="iSnapMode">
                    <el-select
                        v-model="form.iSnapMode"
                        placeholder="请选择"
                    >
                        <el-option
                            v-for="item in iSnapModeOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="连续抓拍张数" prop="iSnapCounter">
                    <el-input-number v-model="form.iSnapCounter"></el-input-number>
                </el-form-item>
                <el-form-item label="时间间隔设置" title="按抓拍的时间间隔设置" prop="iSnapIntervalTime">
                    <el-input-number v-model="form.iSnapIntervalTime"></el-input-number>
                </el-form-item>
                <el-form-item label="是否开启NLP取流" prop="bNpqEnable">
                    <el-switch on-text="" off-text="" v-model="form.bNpqEnable"></el-switch>
                </el-form-item>
                <el-form-item label="是否开启硬解" prop="bGpuEnable">
                    <el-switch on-text="" off-text="" v-model="form.bGpuEnable"></el-switch>
                </el-form-item>
                <el-form-item label="是否显示智能信息" prop="bRenderPriData">
                    <el-switch on-text="" off-text="" v-model="form.bRenderPriData"></el-switch>
                </el-form-item>
            </el-form>
        </div>
        <div class="setting-footer">
            <el-button type="primary" @click="save()">保存</el-button>
            <el-button @click="reset()">恢复默认</el-button>
            <el-button @click="close()">取消</el-button>
        </div>
    </div>
</template>

<script>
import SvgI from './SvgI';
import {I_SNAP_MODE_OPTIONS} from "./../lib/params.lib";
import {commonFuns} from "client-container";
import {addHikccCover, deepClone, isNotEmpty, isValidWindowsPath} from "./../util";
import {errorLog, infoLog} from "./../util/logger";
import {getSimplePlayerData} from "./../lib";

const FORM_DEFAULT = {
    strSnapPath: "D:/capture", /* 截图保存路径 */
    iSnapMode: 1, /* 连续抓拍模式 1按时间连续抓拍 2按帧连续抓拍 */
    iSnapCounter: 15, /* 连续抓拍张数 */
    iSnapIntervalTime: 200, /* 按时间抓拍的时间间隔设置 */
    strRecordPath: "D:/record", /* 紧急录像保存路径 */
    bNpqEnable: false, /* 是否开启npq取流 */
    bGpuEnable: false, /* 是否开启硬解 */
    bRenderPriData: false, /* 是否显示智能信息 */
}

export default {
    components: {SvgI},
    data() {
        const checkPath = (rule, value, callback) => {
            if (!isValidWindowsPath(value)) {
                callback(new Error('请输入正确的文件夹路径'));
            } else {
                callback();
            }
        };
        return {
            strSnapPathDisabled: false,
            strRecordPathDisabled: false,
            active: '', // 刚刚点击了哪个选择路径，记录ID值
            lock: false, // 控制选择文件夹只能one by one，因为选择文件夹回调是异步
            iSnapModeOptions: I_SNAP_MODE_OPTIONS,
            visible: false,
            form: deepClone(FORM_DEFAULT),
            rules: {
                strSnapPath: [
                    {required: true, message: '不可为空', trigger: 'change'},
                    {validator: checkPath, trigger: 'blur'}
                ],
                iSnapMode: [
                    {type: 'number', required: true, message: '不可为空', trigger: 'change'},
                ],
                iSnapCounter: [
                    {type: 'number', required: true, message: '不可为空', trigger: 'change'},
                ],
                iSnapIntervalTime: [
                    {type: 'number', required: true, message: '不可为空', trigger: 'change'},
                ],
                strRecordPath: [
                    {required: true, message: '不可为空', trigger: 'change'},
                    {validator: checkPath, trigger: 'blur'}
                ]
            }
        };
    },
    computed: {
        simplePlayerData() {
            return getSimplePlayerData();
        },
    },
    methods: {
        init() {
            this.getLocalConfig();
        },
        updateInputDisabled() {
            switch (this.active) {
                case 'snapDirIpt':
                    this.strRecordPathDisabled = this.lock;
                    break;
                case 'recordDirIpt':
                    this.strSnapPathDisabled = this.lock;
                    break;
            }
        },
        openLock() {
            this.lock = true;
            this.updateInputDisabled();
        },
        closeLock() {
            this.lock = false;
            this.updateInputDisabled();
        },
        // 设置路径
        setDirPath(path) {
            this.closeLock();
            switch (this.active) {
                case 'snapDirIpt':
                    this.form.strSnapPath = path;
                    break;
                case 'recordDirIpt':
                    this.form.strRecordPath = path;
                    break;
            }
        },
        // 打开文件夹
        openDir(id) {
            this.active = id;
            this.openLock(); // 进入锁，结果返回前不允许再次选择目录
            switch (id) {
                case 'snapDirIpt':
                    this.$emit('open-dir', id, {
                        strDefaultDir: this.form.strSnapPath
                    });
                    break;
                case 'recordDirIpt':
                    this.$emit('open-dir', id, {
                        strDefaultDir: this.form.strRecordPath
                    });
                    break;
            }
        },
        async getLocalConfig() {
            try {
                let res = await commonFuns.getLocalConfig({});
                infoLog('[getLocalConfig]player config is', deepClone(res));
                this.setForm(res);
                this.simplePlayerData.setCcLocalConfig(this.form);
            } catch (e) {
                errorLog('please install client-container latest version', e);
            }
        },
        setLocalConfig(data) {
            try {
                if (isNotEmpty(data)) commonFuns.setLocalConfig(data);
                this.$message({
                    message: '保存成功',
                    type: 'success',
                    customClass: 'setting-save-outer'
                });
                addHikccCover('setting-save-outer');
            } catch (e) {
                this.$message({
                    message: '保存失败',
                    type: 'error',
                    customClass: 'setting-save-fail-outer'
                });
                addHikccCover('setting-save-fail-outer');
                errorLog('[setLocalConfig] please install client-container latest version, you can use npm package "client-container": "^0.3.10"', data, e);
            }
        },
        resetForm() {
            this.setForm(FORM_DEFAULT);
        },
        setForm(data) {
            if (data.hasOwnProperty('recordPath')) data['strRecordPath'] = data.recordPath;
            if (data.hasOwnProperty('snapShotPath')) data['strSnapPath'] = data.snapShotPath;
            if (data.hasOwnProperty('npqEnable')) data['bNpqEnable'] = 'true' === data.npqEnable;
            if (data.hasOwnProperty('gpuEnable')) data['bGpuEnable'] = 'true' === data.gpuEnable;
            if (data.hasOwnProperty('renderPriData')) data['bRenderPriData'] = 'true' === data.renderPriData;
            if (data.hasOwnProperty('snapShotMode')) data['iSnapMode'] = data.snapShotMode;
            if (data.hasOwnProperty('snapShotCounter')) data['iSnapCounter'] = data.snapShotCounter;
            if (data.hasOwnProperty('snapShotIntervalTime')) data['iSnapIntervalTime'] = data.snapShotIntervalTime;
            const KEYS = Object.keys(FORM_DEFAULT);
            KEYS.forEach((K) => {
                infoLog(K, data[K]);
                this.$set(this.form, K, data[K]);
            });
            infoLog('[setForm] after set over, form is', deepClone(this.form));
        },
        open() {
            this.getLocalConfig();
            this.visible = true;
        },
        close() {
            this.visible = false;
        },
        reset() {
            this.resetForm();
        },
        save() {
            this.$refs['form'].validate((valid, invalidFields) => {
                if (valid) {
                    infoLog('[save][form]', this.form);
                    this.setLocalConfig(this.form);
                    this.simplePlayerData.setCcLocalConfig(this.form);
                    this.close();
                } else {
                    this.$refs['form'].focusFirstField();
                    return false;
                }
            });
        }
    }
};
</script>

<style lang="scss" scoped>
.setting {
    width: 528px;
    height: 100%;
    display: block;
    background-color: #fff;
    position: absolute;
    right: 0;
    z-index: 2000; // 不得高于2000，ele的弹层是大于2000
    top: 0;
    bottom: 0;

    .setting-title {
        padding: 0 20px;
        height: 60px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #eee;

        .title-span {
            font-weight: bold;
            font-size: 18px;
        }
    }

    .setting-content {
        padding: 10px 20px;
        overflow-y: auto;
        height: calc(100% - 110px);
    }
}

.setting-form {
    margin: 20px 0;

    .el-form-item {
        margin-bottom: 10px;
    }
}

.setting-footer {
    border-top: 1px solid #ccc;
    padding: 10px 20px;
    position: absolute;
    left: 0;
    width: 100%;
    bottom: 0;
    background-color: #fff;
}
</style>
