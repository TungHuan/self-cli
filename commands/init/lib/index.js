"use strict";

const log = require('@self-cli/log');
const getProjectTemplate = require('./getProjectTemplate');
const fs = require('fs');
const semver = require('semver');
const fse = require('fs-extra');
const inquirer = require('inquirer');
const glob = require('glob');
const ejs = require('ejs');
const SelfPackage = require('@self-cli/package');
const {  spinnerStart, sleep, execSync } = require('@self-cli/utils');


class InitCommand {
  constructor(argv) {
    // console.log(Object.prototype.toString.call(argv));
    if (!argv) throw new Error("Command 参数不能为空");
    if (!Array.isArray(argv)) throw new Error("参数必须为数组");
    if (argv.length < 1) {
      throw new Error("参数列表不能空");
    }
    // console.log('command',argv[2]._name);
    this._argv = argv;
    let runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve();
      chain = chain.then(() => this.initArgs());
      chain = chain.then(() => this.init());
      chain = chain.then(() => this.exec());
      chain.catch((err) => {
        log.error(err.message);
      });
    });
  }

  initArgs() {
    this._cmd = this._argv[this._argv.length - 1];
    this._argv = this._argv.slice(0, this._argv.length - 1);
    console.log(this.cmd, this._argv,'this.cmd, this._argv');
  }

  init() {
    // console.log(this._cmd);
    this.projectName = this._argv[0] || '';
    this.force = !!this._argv[1].force;
    log.verbose('_argv', this.projectName, this._argv);
    log.verbose('force', this.force);
  }

    /**
   * @description 执行过程
   */
    async exec() {
      console.log('exec','开始执行了');
      try {
        // 1、准备
        const projectInfo = await this.prepare();
        if (projectInfo) {
          log.verbose('projectInfo', projectInfo);
          // 2、下载
          await this.downloadTemplate(projectInfo);
          // 3、安装
          await this.installTemplate(projectInfo);
        }
      } catch (error) {
        log.error(error);
        if (process.env.LOG_LEVEL === 'verbose') {
          console.log(error);
        }
      }
    }

    async getProjectInfo(){
      function isValidateName(v){
        const reg =
        /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/;
        return reg.test(v);
      }
      let projectInfo={};
      const isProjectNameValidate = isValidateName(this.projectName);
      if (isProjectNameValidate) {
        projectInfo.projectName = this.projectName;
      }
      const {type}=await inquirer.prompt({
        type:'list',
        name:'type',
        message:'请选择初始化项目类型',
        default:'project',
        choices:[
          {
            name:'项目',
            value:'project'
          },
          {
            name:'组件',
            value:'component'
          }
        ]
      })
      console.log(type,'type',this.template);
      this.template=this.template.filter((item)=>{
        return item.tag.includes(type)
      })
      const title=type==='project'?'项目':'组件';
      const projectPrompt = [
        {
          type:'input',
          name:'projectName',
          message: `请输入${title}名称`,
          default:'',
          validate:function(v){
            const done=this.async();
            setTimeout(function(){
              if(!isValidateName(v)){
                done('首字符必须为英文，尾字符必须为英文，字符仅允许-_字母和数字');
                return;
              }
              done(null,true);
            },0)
          }
        },
        {
          type: 'input',
          name: 'projectVersion',
          message: `请输入${title}版本号`,
          default: '1.0.0',
          validate: function (v) {
            const done = this.async();
            setTimeout(() => {
              if (!semver.valid(v)) {
                done(`请输出合法的${title}版本号`);
              }
              done(null, true);
            }, 0);
          },
          filter: function (v) {
            if (semver.valid(v)) {
              return semver.valid(v);
            } else {
              return v;
            }
          },
        },
        {
          type: 'list',
          name: 'projectTemplate',
          message: `请选择${title}模版`,
          choices: this.createTemplateChoice(),
        },
      ];

      if (type === 'project') {
        const project = await inquirer.prompt(projectPrompt);
        projectInfo = {
          ...projectInfo,
          type,
          ...project,
        };
      } else if (type === TYPE_COMPONENT) {
        const descPrompt = {
          type: 'input',
          name: 'componentDes',
          message: '请输入组件描述信息',
          default: '',
          validate: function (v) {
            const done = this.async();
            setTimeout(() => {
              if (!v) {
                done('请输入组件描述信息');
              }
              done(null, true);
            }, 0);
          },
        };
  
        projectPrompt.push(descPrompt);
  
        const component = await inquirer.prompt(projectPrompt);
  
        // console.log(component);
        projectInfo = {
          ...projectInfo,
          type,
          ...component,
        };
      }

      projectInfo.name = require('kebab-case')(projectInfo.projectName);
      projectInfo.version = projectInfo.projectVersion;

      return projectInfo
    }

    async prepare(){
      const template=await getProjectTemplate()
      this.template=template;
      // 直接在当前目录开始配置init
      const localPath=process.cwd();
      const isEmpty=this.isEmptyDir(localPath);
      if(!isEmpty){
        let ifContinue=false
        if(this.force){
          const promResult=await inquirer.prompt({
            type:'confirm',
            name:'ifContinue',
            default:false,
            message:'当前文件夹不为空，是否继续创建项目？'
          })
          ifContinue=promResult.ifContinue;
        }
        if(!ifContinue){
          return;
        }
        console.log(ifContinue||this.force,'ifContinue||this.force');
        if(ifContinue||this.force){
          const {confirmDelete}=await inquirer.prompt({
            type:'confirm',
            name:'confirmDelete',
            default:false,
            message:'是否确认清空当前文件夹下所有文件？'
          })
          if (confirmDelete) {
            fse.emptyDirSync(localPath);
          }
        }
      }
      return this.getProjectInfo();
    }

      /**
   *
   * @param {*} projectInfo
   * @description 缓存模版下载与更新
   */
    async downloadTemplate(projectInfo){
      // 获取用户目录
      const { default: userHome } = await import('user-home');
      console.log(userHome);
      /**
       * {
            projectName: 'ceshi',
            type: 'project',
            projectVersion: '1.0.0',
            projectTemplate: '@msfe/monorepo-project',
            name: 'ceshi',
            version: '1.0.0'
          }
       */
    const templateInfo=this.template.find((item)=>item.npmName===projectInfo.projectTemplate);
    console.log(templateInfo,'templateInfo');
    const targetPath = path.resolve(userHome, '.self-cli-dev', 'template');
    const storeDir = path.resolve(userHome, '.self-cli-dev', 'template');

    const {npmName, version} = templateInfo;
    this.templateInfo=templateInfo;

    const templateNpm = new SelfPackage({
      targetPath,
      storeDir,
      packageName: npmName,
      packageVersion: version,
    });

    if (!(await templateNpm.exists())) {
      const spinner = spinnerStart('正在下载模版...');
      await sleep();
      try {
        await templateNpm.install();
        // eslint-disable-next-line no-useless-catch
      } catch (error) {
        throw error;
      } finally {
        spinner.stop(true);
        if (await templateNpm.exists()) {
          log.success('下载模版成功');
          this.templateNpm = templateNpm;
        }
      }
    } else {
      const spinner = spinnerStart('正在更新模版...');
      await sleep();
      try {
        await templateNpm.update();
        // eslint-disable-next-line no-useless-catch
      } catch (error) {
        throw error;
      } finally {
        spinner.stop(true);
        if (await templateNpm.exists()) {
          log.success('更新模版成功');
          this.templateNpm = templateNpm;
        }
      }
    }







      

    }


    async installTemplate(projectInfo){
      if(this.templateInfo){
        await this.installNormalTemplate(projectInfo);
      }
    }

    async installNormalTemplate(projectInfo){
      const spiner = spinnerStart('正在安装模版...');
      await sleep();
      const targetPath = process.cwd();
      try{
        const templatePath = path.resolve(this.templateNpm.cacheFilePath, 'template');
        console.log(this.templateNpm,templatePath,'templatePath',targetPath,'targetPath');
        
        fse.ensureDirSync(templatePath);
        fse.ensureDirSync(targetPath);
        fse.copySync(templatePath, targetPath);
      }
      catch(err){
        throw err;
      } finally{
        spiner.stop(true);
        log.success('模版安装成功');
      }
      const templateIgnore = this.templateInfo.ignore || [];
      const ignore = ['node_modules/**', ...templateIgnore];
      await this.ejsRender({ ignore }, projectInfo);

      // 判断 git 是否存在
      if (!fse.existsSync(path.resolve(process.cwd(), '.git'))) {
        execSync('git', ['init']);
      }
      const { installCommand, startCommand } = this.templateInfo;
      // 安装依赖
      await this.execCommand(installCommand, '依赖安装过程失败！');
      // 项目启动
      await this.execCommand(startCommand, '启动过程过程失败！');
    }

      /**
   *
   * @param {*} option
   * @param {*} projectInfo
   * @description ejs 渲染模版，设置项目名称
   */
  async ejsRender(option, projectInfo) {
    const dir = process.cwd();
    console.log(projectInfo,'projectInfo');
    
    return new Promise((resolve, reject) => {
      glob(
        '**',
        {
          cwd: dir,
          ignore: option.ignore || '',
          nodir: true,
        },
        (err, files) => {
          if (err) {
            throw new Error(err);
          }
          // console.log(files);
          Promise.all(
            files.map((file) => {
              const filePath = path.join(dir, file);
              // console.log(filePath);
              return new Promise((resolve1, reject1) => {
                ejs.renderFile(filePath, projectInfo, {}, (err, result) => {
                  // console.log(result);
                  if (err) {
                    reject1(err);
                  }
                  fse.writeFileSync(filePath, result);
                  resolve1(result);
                });
              });
            }),
          )
            .then(() => {
              resolve();
            })
            .catch((err) => {
              reject(err);
            });
        },
      );
    });
  }
    /**
   *
   * @param {*} localPath
   * @returns
   * @description 判断是否是空文件夹,除了 .文件和 node_modules
   */
    isEmptyDir(localPath){
      const originFileList=fs.readdirSync(localPath);
      const filteredList=originFileList.filter((file)=>{
        return !file.startsWith('.') && ['node_modules'].indexOf(file)<0;
      })
      return !filteredList || filteredList.length<=0;
    }

      /**
   *
   * @param {*} template
   * @returns
   * @description 选择项目模版
   */
  createTemplateChoice(template) {
    return this.template.map((item) => {
      return {
        name: item.name,
        value: item.npmName,
      };
    });
  }

  async execCommand(command, errMsg) {
    let ret;
    if (command) {
      const cmdArray = command.split(' ');
      const args = cmdArray.slice(1);
      const cmd= cmdArray[0]
      // console.log(cmd, args);
      ret = await execSync(cmd, args, {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
    }
    if (ret !== 0) {
      throw new Error(errMsg);
    }

    return ret;
  }

}

function usuInit(argv) {
  // 初始化
  return new InitCommand(argv);
}
module.exports = usuInit;
module.exports.InitCommand = InitCommand;
