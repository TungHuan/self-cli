'use strict';

const log=require('npmlog')

log.level=process.env.LOG_LEVEL?process.env.LOG_LEVEL:'info'

// 定制 log 的前缀
log.heading = 'self-cli';
// 定制 log 前缀的样式
log.headingStyle = { fg: 'blue', bg: 'green', bold: true };
log.addLevel('success', 2000, { fg: 'green', bold: true });

module.exports = log;
