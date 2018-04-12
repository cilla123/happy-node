const union = require('lodash/union')
const defaultsDeep = require('lodash/defaultsDeep')
const isPlainObject = require('lodash/isPlainObject')
const querystring = require('querystring')
const { mapKeysToSnakeCase, mapKeysToCamelCase } = require('happy-utils/string')

/**
 * 数据转型
 * @param {string} key 
 * @param {*} value 
 * @param {boolean} toSnakeCase 
 */
function transformData(key, value, toSnakeCase) {
    const plainObject = isPlainObject(key)
    let data = {}
    if (plainObject) {
        data = key
    } else {
        data[key] = value
    }
    toSnakeCase = (plainObject ? value : toSnakeCase) || false
    if (toSnakeCase) {
        data = mapKeysToSnakeCase(data)
    }
    return data
}

module.exports = {

    /**
     * 接受JSON
     */
    get acceptJSON() {
        if (this.path.endsWith('.json')) {
            return true
        } else {
            return false
        }
    },

    /**
     * 判断当前请求上下文对象中的 state 对象是否包含属性 key，如果包含，则返回 true，否则返回 false。
     * @param {string} key 
     */
    hasState(key) {
        return key ? this.state.hasOwnProperty(key) : false
    },

    /**
     * 根据 key 获取状态信息，如果 key 不传，则返回整个 context.state 对象。
     * @param  {String/null} key
     * @param  {Boolean} toCamelCase 是否转成驼峰格式
     */
    getState(key, toCamelCase = false) {
        let data = key ? this.state[key] : this.state
        return toCamelCase ? mapKeysToCamelCase(data) : data
    },

    /**
     * 设置状态
     * @param {string} key 
     * @param {*} value 
     * @param {boolean} toSnakeCase 
     */
    setState(key, value, toSnakeCase = false) {
        const data = transformData(key, value, toSnakeCase)
        this.state = Object.assign(this.state || {}, data)
    },

    /**
     * 设置环境
     * @param {string} key 
     * @param {*} value 
     * @param {boolean} toSnakeCase 
     */
    setEnv(key, value, toSnakeCase = false) {
        const data = transformData(key, value, toSnakeCase);
        this.state = Object.assign(this.state || {}, data);
        this.state.global = Object.assign(this.state.global || {}, data);
    },

    /**
     * 设置全局变量
     * @param {string} key 
     * @param {*} value 
     * @param {boolean} toSnakeCase 
     */
    setGlobal(key, value, toSnakeCase = false) {
        const data = transformData(key, value, toSnakeCase);
        this.state.global = Object.assign(this.state.global || {}, data);
    },

    /**
     * 获取全局变量
     * @param {string} key 
     * @param {boolean} toCamelCase
     */
    getGlobal(key, toCamelCase = false) {
        let data = key ? this.state.global[key] : this.state.global;
        return toCamelCase ? mapKeysToCamelCase(data) : data;
    },

    /**
     * 获取请求参数，该方法会将查询参数和请求体中的参数合并，然后返回合并后的对象，
     * 如果同名，则请求体参数优先级更高，请求体参数会覆盖查询参数。
     * @param {string} key 
     */
    getRequestData(key) {
        const data = defaultsDeep({}, this.request.body, this.query);
        return key ? data[key] : data;
    },

    /**
     * 获取请求体参数，如果没有传递参数 key，则返回整个请求体参数对象，如果传递了参数 key，则返回具体某一个参数值。
     * @param {string} key 
     */
    getPostData(key) {
        const data = this.request.body;
        return key ? data[key] : data;
    },

    pushBeforeRender(fn) {
        if (typeof fn === 'function') this.beforeRenderFns.push(fn);
    },

    /**
     * 我们把一些配置信息(比如dev、pre、qa的host)放在server/config目录下，
     * ctx.getConfig可以判断不同的运行环境获取到对应的配置(lib目录下有一个util也可以实现获取host)。
     * @param {string} name 
     */
    getConfig(name) {
        if (!name) {
            return this.app.projectConfig;
        }
        let arr = name.split('.');
        let result = this.app.projectConfig;
        let i = 0;
        while (arr[i]) {
            result = result[arr[i]];
            i++;
        }
        return result;
    },

    /**
     * 获取请求查询参数，如果没有传递参数 key，则返回整个查询参数对象，如果传递了查询参数 key，则返回具体某一个请求参数值。
     * @param {string} key 
     */
    getQueryData(key) {
        const str = this.querystring;
        let parsed = querystring.parse(str);
        Object.keys(parsed).forEach((item) => {
            if (Array.isArray(parsed[item]) && union(parsed[item]).length === 1) {
                parsed[item] = parsed[item][0];
            }
        });
        return key ? parsed[key] : parsed;
    },

    /** 
     * 获取 Cookie 原始值。返回示例
     */
    getRawCookies() {
        return this.headers.cookie;
    },

    /** 
     * 获取所有 Cookie
     */
    getCookies() {
        let result = {};
        let cookies = this.headers.cookie.split('; ');
        for (let i = 0; i < cookies.length; i++) {
            let arr = cookies[i].split('=');
            result[arr[0]] = arr[1];
        }
        return result;
    },

    /**
     * 获得 cookie 中名为 name 的值，options 为可选参数
     * @param {string} name 
     * @param {object} options 
     */
    getCookie(name, options) {
        return this.cookies.get(name, options);
    },

    /**
     * 设置 cookie 中名为 name 的值，options 为可选参数
     * @param {string} name 
     * @param {*} value 
     * @param {object} options 
     */
    setCookie(name, value, options) {
        return this.cookies.set(name, value, options);
    },

    throwBusinessError(type, code, msg) {
        this.businessErrorType = type;
        this.businessErrorContent = {
            code,
            msg
        };
    },

    /**
     * 返回json格式数据
     * @param {*} status 
     * @param {*} data 
     * @param {*} extra 
     */
    json(status, data, extra) {
        if (extra) { // 三个参数情况，这3个参数分别为 code msg data
            this.body = {
                code: status,
                msg: data,
                data: extra
            };
        } else {
            this.body = {
                code: status.code,
                msg: status.msg,
                data
            };
        }
        return;
    },

    r(code, msg, data) {
        this.body = {
            code,
            msg,
            data: mapKeysToSnakeCase(data)
        };
        return;
    },

    /**
     * 获取session
     * @param {string} key 
     */
    getSession(key) {
        return key ? this.sessionCache[key] : this.sessionCache;
    },

    /**
     * 设置session
     * @param {string} key 
     * @param {*} value 
     */
    setSession(key, value) {
        let plainObject = isPlainObject(key);
        let data = {};
        if (plainObject) {
            data = key;
        } else {
            data[key] = value;
        }
        this.sessionCache = Object.assign(this.sessionCache || {}, data);
    },

    /**
     * 删除session
     * @param {string} key 
     */
    delSession(key) {
        delete this.sessionCache[key];
    }

};
