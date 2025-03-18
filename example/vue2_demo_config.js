const path = require("path");
/**
 * name:页面名称
 * title:页面描述
 * template:页面模板
 */
// const pxtovw = require('postcss-px-to-viewport');
const env = process.env.NODE_ENV;
const isDev = env === 'development';
const tempCookie = 'JSESSIONID=TXnESxPaW_k2YwEjbbSkd3sGr5nMNuB5BvgRwdhz; Current_Env=EQBAAM+PX1JZjkAvC4uayQYjgwW8peV0XJVeV/hFlvs21xIrCVQlUS7J9RgHYIzN/eDLqPB26mj4fpcxnW4bkCtkWIo4qz1a7ZOxBN2vcBhH1g75nB++efpusWFIswX+IFFHAA==; OPSMGRCASTGC=TGT-32-A631sBuObVkFIzQRvnSqjt9bgpW0gTMvzMEtaq3vhkOu12oICS-cas; portal_locale_cookie=zh_CN; portal_locale_cookie.sig=VGxNpP7F4XZ1Gp3jFG_eDaYRyjAPOrprGsuvEUOU4_s; portal_locale_cookie_egg=zh_CN; portal_locale_cookie_egg.sig=w1ywwaZdZHDklrBdqaDLkbkaT6pDsqBnY3Yx5WYGaDo; portal_type_cookie=iportal; portal_type_cookie.sig=UCZaF8EkRMH4dmm8_FyX0-kK5EmKE5pVSkOszTqKyzs; CASTGC=TGT-126-1-8B1D0BD87A5849C0B0B5EF86B9B93045-o6eCzr6FldICfpU3LUerV7ZKCzXBuOib4dChK7izrkeCUNekM2-cas; portal_sess=RghJrLXPq6mGbYwmuXYH3vRphR65vhePRZIQDwu9_MRLldDRaao16ugy-MYjR8rh';

const pageList = [{ name: 'index', title: '首页', template: 'index' }];
let pages = {};
pageList.forEach(page => {
    const { name, title, template } = page;
    pages[name] = {
        entry: `src/main.js`,
        template: `public/${template}.html`,
        filename: `${name}.html`,
        chunks: [
            'vue',
            'vuex',
            'vue-router',
            'chunk-vendors',
            'chunk-hui-vue',
            'chunk-hi-map-vue',
            'chunk-moment-vue',
            'chunk-echarts',
            'chunk-libs',
            'chunk-map',
            'chunk-components',
            'chunk-assets',
            'chunk-commons',
            `${name}`
        ],
        title
    };
});

const main = {
    indexPath: isDev ? 'index.html' : 'index.ftlh',
    chainWebpack: config => {
        pageList.forEach(page => {
            const { name } = page;
            config.plugin(`html-${name}`).tap(args => {
                args[0].meta = {
                    // _csrf: isDev ? '' : `{{ ctx.session.csrfToken }}`,
                    // lang: {
                    //     name: 'lang',
                    //     language: isDev
                    //         ? process.env.VUE_APP_DEV_DEFAULT_LANG
                    //         : `{{ helper.locale('locale', ctx) }}`
                    // },
                    skin: {
                        // 生成meta标签
                        name: 'skin',
                        skin: isDev
                            ? process.env.VUE_APP_DEV_DEFAULT_SKIN
                            : `Light_Blue9_01` // {{ helper.skin() }}
                    },
                    playMode: {
                        name: 'playMode',
                        playMode: isDev
                            ? process.env.VUE_APP_DEV_DEFAULT_PLAY_MODE
                            : `window` // {{ helper.playMode() }}
                    }
                };
                return args;
            });
        });

        config.when(process.env.NODE_ENV != 'development', config => {
            config.optimization.splitChunks({
                chunks: 'all',
                minSize: 20000, // 允许新拆出 chunk 的最小体积，也是异步 chunk 公共模块的强制拆分体积
                maxAsyncRequests: 6, // 每个异步加载模块最多能被拆分的数量
                maxInitialRequests: 6, // 每个入口和它的同步依赖最多能被拆分的数量
                // enforceSizeThreshold: 50000, // 强制执行拆分的体积阈值并忽略其他限制
                cacheGroups: {
                    vue: {
                        name: 'vue',
                        test: /[\\/]node_modules[\\/]vue[\\/]/,
                        priority: 30
                    },
                    vuex: {
                        name: 'vuex',
                        test: /[\\/]node_modules[\\/]vuex[\\/]/,
                        priority: 30
                    },
                    'vue-router': {
                        name: 'vue-router',
                        test: /[\\/]node_modules[\\/]vue-router[\\/]/,
                        priority: 30
                    },
                    vendors: {
                        name: 'chunk-vendors', // 打包后的文件名
                        test: /[\\/]node_modules[\\/]/,
                        priority: 1,
                        chunks: 'initial',
                        enforce: true, // true/false。为true时，忽略minSize，minChunks
                        reuseExistingChunk: true
                        // maxSize: 244 * 1000
                    },
                    huiVue: {
                        //把antDesignVue从chunk-vendors.js提取出来。当然我们也可以把mixins，vue.min.js等等也按照类似配置提取出来
                        name: 'chunk-hui-vue',
                        test: /[\\/]node_modules[\\/]hui[\\/]/,
                        chunks: 'initial',
                        priority: 3,
                        // maxSize: 600000,
                        reuseExistingChunk: true,
                        enforce: true
                    },
                    himapVue: {
                        //把antDesignVue从chunk-vendors.js提取出来。当然我们也可以把mixins，vue.min.js等等也按照类似配置提取出来
                        name: 'chunk-hi-map-vue',
                        test: /[\\/]node_modules[\\/]hi-map-vue[\\/]/,
                        chunks: 'initial',
                        priority: 3,
                        // maxSize: 600000,
                        reuseExistingChunk: true,
                        enforce: true
                    },
                    momentVue: {
                        //把antDesignVue从chunk-vendors.js提取出来。当然我们也可以把mixins，vue.min.js等等也按照类似配置提取出来
                        name: 'chunk-moment-vue',
                        test: /[\\/]node_modules[\\/]moment[\\/]/,
                        chunks: 'initial',
                        priority: 3,
                        // maxSize: 600000,
                        reuseExistingChunk: true,
                        enforce: true
                    },
                    echarts: {
                        name: 'chunk-echarts', // split echarts into a single package
                        priority: 3, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                        test: /[\\/]node_modules[\\/]_?echarts(.*)/ // in order to adapt to cnpm
                    },
                    libs: {
                        name: 'chunk-libs',
                        test: /[\\/]node_modules[\\/]/,
                        priority: 2,
                        chunks: 'initial' // only package third parties that are initially dependent
                    },
                    assets: {
                        // assetsImgSvg 单独拆包
                        name: 'chunk-assets',
                        test: /[\\/]src[\\/]assets/,
                        priority: 20, // 权重
                        chunks: 'all' // 只打包按需引入的模块
                    },
                    map: {
                        // assetsImgSvg 单独拆包
                        name: 'chunk-map',
                        test: /[\\/]src[\\/]components[\\/]map/,
                        priority: 18, // 权重
                        chunks: 'all' // 只打包按需引入的模块
                    },
                    components: {
                        // components 单独拆包
                        name: 'chunk-components',
                        test: /[\\/]src[\\/]components/,
                        priority: 20, // 权重
                        chunks: 'all', // 只打包按需引入的模块
                        minChunks: 2,
                        reuseExistingChunk: true
                        // maxSize: 244 * 1000
                    },
                    commons: {
                        // 公共模块包
                        name: 'chunk-commons',
                        minChunks: 2,
                        priority: 0,
                        reuseExistingChunk: true
                    }
                }
            });
        });

        // if (process.env.NODE_ENV === 'production') {
        //     config.plugin('webpack-bundle-analyzer')
        //         .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
        //         .end()
        // }
        config.module
            .rule('svg')
            .exclude.add(path.resolve(__dirname, 'src/components/simple-player/assets/svg-icons'))
            .add(path.resolve(__dirname, 'src/assets/svg/device_icons'))
            .end();
        config.module
            .rule('icons')
            .test(/.svg$/)
            .include.add(path.resolve(__dirname, 'src/components/simple-player/assets/svg-icons'))
            .add(path.resolve(__dirname, 'src/assets/svg/device_icons'))
            .end()
            .use('svg-sprite-loader')
            .loader('svg-sprite-loader')
            .options({
                symbolId: 'icon-[name]',
            });
    },
    publicPath: isDev ? '/' : process.env.VUE_APP_CONTEXT,
    assetsDir: process.env.VUE_APP_ASSETS,
    runtimeCompiler: true,
    // 默认babel-loader会忽略node_modules中的文件
    // 但是dolphin-plugin-tools用了es6的语法, 配置对其显示转译
    // 配合babel sourceType: 'unambiguous'来使用 https://github.com/babel/babel/issues/9187,
    transpileDependencies: [
        'dolphin-plugin-tools',
        /@hui-pro/,
        /hui/,
        /hi-map-vue/,
        /hi-map-core/,
        'client-container'
    ],
    // 用于开发环境下与后端联调
    // 如有需要, 还可以配合easy-proxy进行使用
    devServer: {
        proxy: {
            [`${process.env.VUE_APP_API_PREFIX}/*`]: {
                target: `${process.env.VUE_APP_API_BACKEND}`,
                secure: false,
                changeOrigin: true,
                // eslint-disable-next-line
                onProxyReq(a, b, c) {
                    // eslint-disable-next-line
                    a.setHeader('CooKie', tempCookie);
                    // a.setHeader('X-CSRF-TOKEN', tempXCSRFTOKEN);
                }
            },
            '/ngx': {
                //target: 'http://10.192.77.81'
                target: `https://${process.env.VUE_APP_IP}/`
            },
            '/hmap-server': {
                //target: 'http://10.192.77.81'
                target: `https://${process.env.VUE_APP_IP}/`
            },
            '/xmap-web': {
                //target: 'http://10.192.77.81'
                target: `https://${process.env.VUE_APP_IP}/`
            },
            '/ipoint-web': {
                //target: 'http://10.192.77.81'
                target: `https://${process.env.VUE_APP_IP}/`
            },
            [`bsquare-data/*`]: {
                target: `https://${process.env.VUE_APP_IP}:9149/`,
                secure: false,
                changeOrigin: true,
                // eslint-disable-next-line
                onProxyReq(a, b, c) {
                    // eslint-disable-next-line
                    a.setHeader('CooKie', tempCookie);
                }
            }
        }
    },
    pages,
    // 开启eslint-loader
    lintOnSave: true,
    css: {
        loaderOptions: {
            sass: {
                data: isDev
                    ? `@import "~@/globalStyle/indexDev.scss";`
                    : `@import "~@/globalStyle/index.scss";`
            }
        }
    },
    productionSourceMap: false,
};

module.exports = main;
