const fs = require('fs');
const glob = require('glob');
const debug = require('debug')('happy:router');
const isFunction = require('lodash/isFunction');
const router = require('../libs/router');

module.exports = function(app, config) {
    if (!fs.existsSync(config.ROUTERS_PATH)) {
        return;
    }
    const controllers = app.controllers;
    debug(controllers);

    let files = glob.sync(`${config.ROUTERS_PATH}/**/*.js`);
    debug(files);
    for (let i = 0; i < files.length; i++) {
        const requireContent = require(files[i]);

        if (requireContent.methods) {
            router.use('', requireContent.routes(), requireContent.allowedMethods());
        } else if (isFunction(requireContent)) {
            requireContent(app, router);
        } else if (Array.isArray(requireContent)) {
            for (let j = 0; j < requireContent.length; j++) {
                const httpVerb = requireContent[j][0].toLowerCase(); // HTTP 请求方法
                const requestPath = requireContent[j][1]; // 请求路径
                const fileKey = requireContent[j][2].replace('.', '/') + '.js';
                const funcName = requireContent[j][3];
                const match = controllers[fileKey];

                if (match) {
                    debug(httpVerb, requestPath, fileKey, funcName, match);
                    router[httpVerb](requestPath, async function(ctx, next) {
                        if (isFunction(match.controller)) {
                            const Controller = match.controller;
                            const instance = new Controller(ctx);
                            if (instance[funcName]) {
                                await instance[funcName](ctx, next);
                            }
                        } else if (match.controller[funcName]) {
                            await match.controller[funcName](ctx, next);
                        }
                    });
                }
            }
        }
    }
};