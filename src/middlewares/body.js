const path = require('path');
const koaBody = require('koa-body');

/**
 * strict {Boolean} If enabled, don't parse GET, HEAD, DELETE requests, default true
 */
module.exports = function() {
    return koaBody({
        formidable: {
            uploadDir: path.resolve('/tmp')
        },
        multipart: true,
        jsonLimit: '3mb',
        formLimit: '3mb',
        textLimit: '3mb',
        strict: false
    });
};