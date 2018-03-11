const log4js = require('koa-log4');

const DEFAULT_FORMAT = '":method :url HTTP/:http-version :status :response-timems" ":user-agent"';

const errorLogPath = 'logs/error/server'
const responseLogPath = 'logs/response/server'

log4js.configure({
  appenders: {
    "ruleConsole": {
      "type": "console"
    },
    "errorLogger": {
      "type": "dateFile",
      "filename": errorLogPath,
      "pattern": "-yyyy-MM-dd hh.log",
      "alwaysIncludePattern": true,
      "encoding": "utf-8",
      "maxLogSize": 10 * 1000 * 1000,
      "numBackups": 3,
    },
    "resLogger": {
      "type": "dateFile",
      "filename": responseLogPath,
      "pattern": "-yyyy-MM-dd hh.log",
      "alwaysIncludePattern": true,
      "encoding": "utf-8",
      "maxLogSize": 10 * 1000 * 1000,
      "numBackups": 3,
    },
  },
  //供外部调用的名称和对应设置定义
  categories: {
    "default": {
      "appenders": ["rule-console"],
      "level": "all"
    },
    "resLogger": {
      "appenders": ["resLogger"],
      "level": "info"
    },
    "errorLogger": {
      "appenders": ["errorLogger"],
      "level": "error"
    },
    "http": {
      "appenders": ["resLogger"],
      "level": "info"
    }
  },
});

module.exports = function (options = {}) {
  const logger = log4js.koaLogger(log4js.getLogger('http'), {
    level: options.level || 'auto',
    format: options.format || DEFAULT_FORMAT
  })
  return logger;
};