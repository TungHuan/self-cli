'use strict';


const log = require('@self-cli/log');
const prepare=require('./prepare')
const command=require('./commander')

async function core(argv) {
  console.log(argv);
  try {
    await prepare();
  } catch (error) {
    log.error(error.message);
    if (process.env.LOG_LEVEL === 'verbose') {
      console.log(e);
    }
  }
  command();
}

module.exports = core;
