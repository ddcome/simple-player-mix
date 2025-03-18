// 获取searchKeyword正则
export function getKeywordReg(searchKeyword) {
    // 支持大小写模糊搜索
    // specialCharts：特殊字符集合，这些字符不能直接塞进正则里，需要先转译
    const specialCharts = ['(', ')', "'", '\\', '$', '*', '+', '[', ']', '?', '^', '{', '}', '|', '.'];
    let wordStr = '';
    for (let i = 0, len = searchKeyword.length; i < len; i++) {
        if (specialCharts.includes(searchKeyword[i])) {
            wordStr += '\\' + searchKeyword[i];
        } else {
            wordStr += searchKeyword[i];
        }
    }
    return new RegExp(wordStr, 'ig');
}

export function getRedTextHtml(shortTxt, text) {
    return text.replace(getKeywordReg(shortTxt), `<span style="color: red;">${shortTxt}</span>`);
}

// 给tree数据增加path字段
export function addPathForTree(data, fatherPath) {
    return (data && data.length > 0) && data.map(c => {
        c['path'] = c.parentId == '-1' ? `/${c.id}` : `${fatherPath}/${c.id || ''}`;
        if (c.children && c.children.length > 0) {
            c.children = addPathForTree(c.children, c.path);
        }
        if (c.algorithms && c.algorithms.length > 0) {
            c.algorithms = addPathForTree(c.algorithms, c.path);
        }

        return c;
    }) || [];
}

// 从数状数据中提取算法数据
export function getAlgoFromTree(treeData, base = []) {
    return treeData.reduce((prev, cur) => {
        if (cur.children && cur.children.length > 0) {
            prev = prev.concat(getAlgoFromTree(cur.children, prev));
        }
        if (cur.algorithms && cur.algorithms.length > 0) {
            return prev.concat(cur.algorithms);
        } else {
            return prev;
        }
    }, base || []);
}
