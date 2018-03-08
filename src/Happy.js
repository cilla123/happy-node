const Koa = require('koa')
const Emitter = require('events')
const { resolve } = require('path')
const { defaultsDeep } = require('lodash')

const middlewares = require('./middlewares')
const Loader = require('./libs/loader')
const pkg = require('../package.json')

class Happy extends Emitter {

    constructor(config){
        super()
        this.app = new Koa()
        this.config = config || {}
        this.config.SERVER_ROOT = this.config.SERVER_ROOT || this.defaultServerRoot
        if (this.config.STATIC_PATH) {
            this.config.STATIC_PATH = resolve(this.config.SERVER_ROOT, this.config.STATIC_PATH)
        }
        // 合并环境和默认的配置文件
        this.config = defaultsDeep({}, this.envConfig, this.config, this.defaultConfig)

        process.env.NODE_ENV = this.config.NODE_ENV
        process.env.NODE_PORT = this.config.NODE_PORT

        this.app = new Koa()
        this.app.config = this.config
        this.app.keys = this.config.KEYS
        this.app.env = this.config.NODE_ENV

        this.middlewares = middlewares(this.config)
        // 初始化加载器
        this.loader = new Loader(this.config)
        // 加载项目配置
        this.app.projectConfig = this.loader.loadProjectConfig()
        // 加载Version文件
        this.config.VERSION_MAP = this.loader.loadVersionMap()
        // 加载Controllers文件
        this.app.controllers = this.loader.loadControllers()
        // 加载目录 server/middlewares 下的所有中间件
        this.projectMiddlewares = this.loader.loadMiddlewares()
        // 加载中间配置
        this.middlewareConfig = defaultsDeep({}, this.loader.loadMiddlewareConfig(), this.defaultMiddlewareConfig)
        this.loader.loadContextExtend()
        this.loader.loadViewExtend()
        // HappyNode version
        this.config.HAPPY_VERSION = pkg.version
        // 把框架中间件跟业务中间件都合并到 allMiddlewares
        this.allMiddlewares = [].concat(this.middlewares).concat(this.projectMiddlewares)

        this.run()
        return this
    }

    // 默认配置
    get defaultConfig(){
        const SERVER_ROOT = this.config.SERVER_ROOT
        return {
            KEYS: ['im a newer secret', 'i like turtle'],
            NODE_ENV: 'development',
            NODE_PORT: 3000,
            FAVICON_PATH: resolve(SERVER_ROOT, 'favicon.ico'),
            STATIC_PATH: resolve(SERVER_ROOT, '../static'),
            CODE_PATH: resolve(SERVER_ROOT, 'constants/code.js'),
            CONFIG_PATH: resolve(SERVER_ROOT, 'config'),
            SEO_PATH: resolve(SERVER_ROOT, 'constants/site.js'),
            VIEW_PATH: resolve(SERVER_ROOT, 'views'),
            ROUTERS_PATH: resolve(SERVER_ROOT, 'routes'),
            CONTROLLERS_PATH: resolve(SERVER_ROOT, 'controllers'),
            EXTEND_PATH: resolve(SERVER_ROOT, 'extends'),
            XSS_WHITELISTS: [],
            CDN_PATH: '//www.cdn.com',
            beforeLoadMiddlewares() {},
            MIDDLEWARES_PATH: resolve(SERVER_ROOT, 'middlewares'),
            MIDDLEWARES_CONFIG_PATH: resolve(SERVER_ROOT, 'config/middlewares.js'),
            // iron 目录结构
            IRON_DIR: false,
            SRC_PATH: resolve(SERVER_ROOT, 'src'),
            // 所有中间件（框架+业务中间件）可配，默认 false
            AUTO_MIDDLEWARE: false
        }
    }

    // 环境配置
    get envConfig(){
        return {
            NODE_ENV: process.env.NODE_ENV,
            NODE_PORT: process.env.NODE_PORT
        }
    }

    // 运行根目录
    get defaultServerRoot(){
        let defaultServerRoot
        if (/server_dist|bin/.test(process.mainModule.filename)) {
            defaultServerRoot = resolve(process.cwd(), 'server_dist')
        } else {
            defaultServerRoot = resolve(process.cwd(), 'server')
        }
        return defaultServerRoot
    }

    // 默认的中间件
    get defaultMiddlewareConfig(){
        return {
            framework: [
                'static',
            ],
            project: [],
            custom: []
        }
    }

    /** 
     * 使用中间件
    */
    useMiddlewares(){
      R.map(R.compose(R.forEachObjIndexed(initWith => initWith(this.app)),
          require,
          name => resolve(__dirname, `./middlewares/${name}`)
      ))(MIDDLEWARES)
    }

    run(){
      this.app.listen(8080, () => {
          console.log('启动成功')
      })
    }

}

// const happy = new Happy()
// happy.run()

module.exports = Happy
