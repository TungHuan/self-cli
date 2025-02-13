const commander = require("commander");
const log = require("@self-cli/log");
const pkg = require("../package.json");
const exec = require("@self-cli/exec")

function command() {
  log.success("恭喜你成功进入这一阶段");
  // 手动创建新的 commander 实例
  const program = new commander.Command();
  program
    .name(Object.keys(pkg.bin)[0])
    .usage("<command>[options]")
    .description("一站式命令行工具")
    .version(pkg.version)
    .option("-d, --targetPath <targetPath>", "是否指定本地调试文件路径", "")
    .option("-e, --env <envName>", "获取环境变量名称");

  // 监听options, 如果指定了目录，就需要把这个目录放在全局配置里面
  program.on("option:targetPath", (args) => {
    process.env.CLI_TARGET_PATH = args;
  });
  // 注册init命令
  const init = program.command("init [componentName]");
  init
    .description("初始化项目")
    .option("--force, -f", "如果项目存在是否强制初始化-dh测试")
    .option("--dir, -d <dirName>", "目录名称")
    .action(exec);

    // 对未知命令监听
    program.on('command:*', (obj) => {
        log.error('未知命令：' + obj[0]);
        const availableCommands = program.commands.map((cmd) => cmd.name());
        log.error('未知命令：' + availableCommands);
        log.notice('可用命令：', availableCommands.join(','));
        program.outputHelp();
      });
    
      program.parse(process.argv);
}
module.exports = command;
