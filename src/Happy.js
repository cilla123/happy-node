const Koa = require('koa')
const Emitter = require('events')

class Happy extends Emitter {

    constructor(config){
      super()
      this.app = new Koa()
    }

    /** 
     * 使用中间件
    */
    useMiddlewares(){
      R.map(R.compose(R.forEachObjIndexed(initWith => initWith(app)),
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
