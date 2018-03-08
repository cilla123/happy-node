const favicon = require('./favicon');
const zanStatic = require('./static');
const koaHelmet = require('koa-helmet');
const code = require('./code');
// const seo = require('./seo');
// const log = require('./log');
const body = require('./body');
const xss = require('./xss');
const mixin = require('./mixin');
const nunjucks = require('./nunjucks');
const healthCheck = require('./health_check');

module.exports = function(config) {
    return [{
        name: 'static',
        fn: zanStatic(config.STATIC_PATH),
        type: 'framework'
    }];
};