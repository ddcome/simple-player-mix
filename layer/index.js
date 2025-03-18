// 获取./路径下的所有文件
const requireComponent = require.context(
    './', // 组件所在目录的相对路径
    true, // 是否查询其子目录
    /\w+Layer\.vue$/ // 匹配***Layer.vue的组件
)
let comObj = {}
requireComponent.keys().forEach(fileName => {
    // 获取文件名
    let names = fileName.split('/').pop().replace(/\.\w+$/, '')
    // 获取组件配置
    const componentConfig = requireComponent(fileName)
    // 若该组件是通过"export default"导出的，优先使用".default"，否则退回到使用模块的根
    comObj[names] = componentConfig.default || componentConfig
})

/**
* @function
* @description 导出所有的组件Layer
* @return {String}
* @author lixiaodong31 2023/9/8
* @version 1.0.0
* @example
* components: Object.assign({}, allCompLayer, { a: a })
*/
export const allCompLayer = comObj;
