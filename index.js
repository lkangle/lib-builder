#!/usr/bin/env node
const program = require('commander')
const { version } = require('./package.json')
const { doPkg } = require('./lib')

program.version(version, '-v, --version', '查看工具版本号').
  helpOption('-h, --help', '查看帮助').
  option('-i, --input <input>', '输入文件', 'index.js').
  option('-o, --output <output>', '输出文件', 'dist/index.js').
  option('-f, --format <format>', '输出的文件类型', 'umd').
  option('-w, --watch', '监听文件变化').
  usage('<options>')

program.parse(process.argv)

let opts = program.opts()

const options = {
  input: opts.input || 'index.js',
  output: opts.output || 'dist/index.js',
  format: opts.format || 'umd',
  watch: opts.hasOwnProperty('watch')
}

doPkg(options).finally()
