const { Exception_404 } = require('./Error')

/** 
 * 基本类
 */
class Bass {

    constructor(ctx){
        this.ctx = ctx
        this.Exception_404 = Exception_404
    }

}

module.exports = Bass