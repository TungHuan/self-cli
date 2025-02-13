#!/usr/bin/env node

const importLocal=require('import-local')

if(importLocal(__filename)){
    require('npmlog'.info('提示','正在使用当前项目中的self-cli版本'))
}else{
    require('../lib')(process?.argv.slice(2))
}
