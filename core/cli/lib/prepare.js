const log = require('@self-cli/log');
const pkg=require('../package.json')
const semver=require('semver')
const colors=require('colors/safe')

const {LOWEST_NODE_VERSION}=require('./const')

/**
 * prepare阶段要做的事
 * 1. 检查版本号
 * 2. 检查node版本
 * 3. 检查root启动  ---提示用户正在root
 * 4. 检查用户主目录 ---不知道有啥用
 * 5. 检查入参      ---不知道有啥用
 * 6. 检查环境变量   ---不知道有啥用
 * 7. 检查是否为新版本
 * 8. 提示更新 ----需要发了包再做
 */

// 检查版本号
function checkPkgVersion(){
    log.success('友情提示你当前使用的版本是',pkg.version)
    
}

// 检查 node版本
function checkNodeVersion(){
    const currentNodeVersion= process.version;
    if(!semver.gte(currentNodeVersion,LOWEST_NODE_VERSION)){
        throw new Error(colors.red('使用该脚手架需要node版本高于',LOWEST_NODE_VERSION))
    }
    console.log(LOWEST_NODE_VERSION,currentNodeVersion);
}

/**
 * 当检测到以 root 账号启动时，脚手架可以给出明确的提示信息，
 * 引导用户以普通用户身份运行，避免用户因不了解风险而进行不安全的操作。
 * 这有助于提升用户体验，同时保障系统和项目的安全。
 */
function checkRoot(){
    const rootCheck=require('root-check')
    rootCheck()
}

async function checkUserHome(){
    const { default: userHome } = await import('user-home');
    const { pathExistsSync } = await import('path-exists');
    if (!userHome || !pathExistsSync(userHome)) {
        throw new Error(colors.red('当前用户主目录不存在'));
    }
}

function checkGlobalUpdate(){
    const currentVersion=pkg.version
    const npmName=pkg.name

    log.info(currentVersion,npmName)

}

function prepare(){
    log.info('你进入了prepare阶段')
    checkPkgVersion()
    checkNodeVersion()
    checkRoot()
    checkUserHome()
    checkGlobalUpdate()
}

module.exports=prepare