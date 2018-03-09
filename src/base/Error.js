/** 
 * 参数错误类
 */
class ParamsError extends Error {

    constructor(code, msg){
        super()
        this.errorContent = {
            type: 'paramsError',
            code,
            msg
        }
    }

}

/** 
 * 业务错误类
 */
class BusinessError extends Error {

    constructor(type, code, msg){
        super(type)
        this.errorContent = {
            type,
            code,
            msg
        }
    }

}

/** 
 * 404错误类
 */
class Exception_404 extends Error {

    constructor(...args){
        super(...args)
    }

}

module.exports = {
    ParamsError,
    BussinessError,
    Exception_404
}