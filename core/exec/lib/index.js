'use strict';

const SelfPackage = require('@self-cli/package');
const log = require('@self-cli/log');
const path = require('path');
const { exec: spawn } = require('@self-cli/utils');

module.exports = exec;

const INIT_PACKAGE_MAPPING={
  init:'@self-cli/init',
}
const CACHE_DIR = 'dependencies';

/**
 * @description 动态加载 npm 包
 */
async function exec() {
  let targetPath = process.env.CLI_TARGET_PATH;
  log.info('targetPath', targetPath,);
  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();
  log.info('cmdName', cmdName,);
  const packageName = INIT_PACKAGE_MAPPING[cmdName];
  const packageVersion = '1.0.0';
  let storeDir = '';
  let pkg = null;

  if(!targetPath){
    targetPath=path.resolve(process.env.CLI_HOME_PATH, CACHE_DIR);
    storeDir = path.resolve(targetPath, 'node_modules');

    pkg=new SelfPackage({
      targetPath,
      storeDir,
      packageName,
      packageVersion,
    });
    if(await pkg.exists()){
      await pkg.update();
    }else{
      await pkg.install();
    }
  }else{
    // 本地包
    pkg=new SelfPackage({
      targetPath,
      packageName,
      packageVersion,
    });
  }
  const rootFile = await pkg.getRootFilePath();
  log.verbose('rootFile', rootFile);
  console.log('哈哈哈哈哈哈哈哈',rootFile);
  
  if (rootFile) {
    try {
      const args = Array.from(arguments);
      const cmd = args[args.length - 1];
      const o = Object.create(null);
      Object.keys(cmd).forEach((key) => {
        if (
          cmd.hasOwnProperty(key) &&
          !key.startsWith('_') &&
          key !== 'parent'
        ) {
          o[key] = cmd[key];
        }
      });
      args[args.length - 1] = o;
      const code = `require('${rootFile}').call(null, ${JSON.stringify(args)})`;
      const child = spawn('node', ['-e', code], {
        cwd: process.cwd(),
        stdio: 'inherit',
      });
      child.on('error', (e) => {
        log.error(e, e.message);
        process.exit(1);
      });
      child.on('exit', (e) => {
        log.verbose('执行完成：' + e);
      });
    } catch (error) {
      log.error(error);
    }
    // node 子进程执行
  }
}
