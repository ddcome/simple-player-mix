<template>
    <div class="icons-outer">
        <h2>混合播放器图标库</h2>
        <ul>
            <li v-for="(icon, index) in icons">
                <svg-i :icon="icon" :key="index" color="#000" hover-color="red" :font-size="1.5"/>
                <span>{{ icon }}</span>
            </li>
        </ul>
    </div>
</template>

<script>
import SvgI from './../components/SvgI';
import {infoLog} from "./../util/logger";

export default {
    components: {SvgI},
    data() {
        return {
            icons: []
        }
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            this.icons = this.getSvgFiles();
            infoLog('加载所有图标', this.icons);
        },
        getSvgFiles() {
            try{
                //获取所有icons文件数据
                let data = require.context('./../assets/svg-icons', false, /\.svg$/).keys();
                for(let i in data){
                    //遍历替换全部 ./ 和 .svg 为空
                    data[i] = data[i].replace(/\.\//g, '').replace(/\.svg/g, '');
                }
                //返回处理过的数据，再展示出来即可
                return data;
            }catch(e){
                return []
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.icons-outer {
    height: 100%;
    width: 100%;
    overflow-y: auto;
    overflow-x: auto;
    padding: 90px 200px;
    justify-content: center;
    h2 {
        text-align: center;
        margin-bottom: 25px;
    }
    ul {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        li {
            display: flex;
            width: 130px;
            height: 130px;
            background-color: #eff;
            border: 1px solid #ddd;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin: 3px;
            span {
                line-height: 30px;
                height: 30px;
            }
        }
    }
}
</style>
