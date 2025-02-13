'use strict';

const log = require('@self-cli/log');
const { isObject ,getDefaultRegistry,formatPath} = require('@self-cli/utils');
const npmInstall = require('npminstall');
const path = require('path');

class SelfPackage{
  constructor(options){
    if(!options) throw new Error('Package 类的options参数不能为空')
    if(!isObject(options))  throw new Error('Package 类的options参数必须是对象')
    log.verbose('Pakage', options);
    this.targetPath=options.targetPath
    this.storeDir=options.storeDir
    this.packageName=options.packageName
    this.packageVersion=options.packageVersion
    this.cacheFilePathPrefix=this.packageName.replace(/\//g, '_');
  }

  /**判断缓存目录是否存在，不存在的话新增缓存目录*/
  async prepare(){
    const { pathExistsSync } = await import('path-exists');
    const fse = require('fs-extra');

    if (this.storeDir && !pathExistsSync(this.storeDir)) {
      fse.mkdirsSync(this.storeDir);
    }
  }

  get cacheFilePath(){
    return path.resolve(this.storeDir,  `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`)
  }

    /**
   * @description 更新
   */
    async update() {
      const { pathExistsSync } = await import('path-exists');
  
      await this.prepare();
      // const latestPackageVersion = await getNpmLatestVersion(this.packageName);
      const latestPackageVersion = '0.0.12';
      const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion);
      if (!pathExistsSync(latestFilePath)) {
        await npmInstall({
          root: this.targetPath,
          storeDir: this.storeDir,
          registry: getDefaultRegistry(true),
          pkgs: [
            {
              name: this.packageName,
              version: latestPackageVersion,
            },
          ],
        });
      }
      this.packageVersion = latestPackageVersion;
    }
  

  async exists(){
    const {pathExistsSync}=await import('path-exists')
    if(this.storeDir){
      await this.prepare()
      return pathExistsSync(this.cacheFilePath)
    }else{
      return pathExistsSync(this.targetPath)
    }
  }

  async install(){
    await this.prepare()
    return npmInstall({
      root:this.targetPath,
      storeDir:this.storeDir,
      registry:getDefaultRegistry(true),
      pkgs:[
        {
          name:this.packageName,
          version:this.packageVersion
        }
      ]
    })
  }

  async getRootFilePath() {
    async function _getRootFile(targetPath) {
      const pkgDir = await import('pkg-dir');
      const dir = pkgDir.packageDirectorySync({ cwd: targetPath });
      // console.log('getRootFilePath', this.targetPath, dir);
      if (dir) {
        // 读取package.json
        const pkgFile = require(path.resolve(dir, 'package.json'));
        if (pkgFile && pkgFile.main) {
          return formatPath(path.resolve(dir, pkgFile.main));
        }
      }
      return null;
    }
    if (this.storeDir) {
      return await _getRootFile(this.cacheFilePath);
    } else {
      return await _getRootFile(this.targetPath);
    }
  }

  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`,
    );
  }



}

module.exports = SelfPackage;
