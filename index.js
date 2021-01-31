#!/usr/bin/env node
const program = require('commander')
const { version } = require('./package.json')
const { doRollup } = require('./lib')
const { createProject } = require('./lib/projects')

program.version(version, '-v, --version', '查看工具版本号')
  .helpOption('-h, --help', '查看帮助')
  .addHelpCommand('help', '查看命令帮助')
  .usage('[command] [options]')

program.command('build', { isDefault: true })
  .description('library打包 (默认命令)')
  .helpOption('-h, --help', '查看帮助')
  .option('-i, --input <input>', '输入文件', 'index.js')
  .option('-o, --output <output>', '输出文件', 'dist/index.js')
  .option('-f, --format <format>', '输出的文件类型', 'iife')
  .option('-n, --name <name>', '模块名')
  .option('-w, --watch', '监听文件变化', false)
  .usage('[options]')
  .action(async options => {
    await doRollup(options)
  })

program.command('add <library>')
  .description('添加库，支持: ts, jest, eslint, babel')
  .action(library => {
    console.log('add library:', library)
  })

program.command('create <project-name>')
  .description('使用模板初始化一个项目')
  .option('--ts', '使用typescript', false)
  .option('--jest', '添加jest', false)
  .option('--eslint', '添加eslint', false)
  .action(async (project, options) => {
    await createProject(project, options)
  })

program.parse(process.argv)
