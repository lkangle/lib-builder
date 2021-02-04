const rollup = require('rollup')
const chalk = require('chalk')
const { buildInputOption, buildOutputOptions } = require('./config')

let start = 0
let changeFile = ''
const cwd = process.cwd()

async function doRollup(options) {
  const watch = options.watch
  const inputOption = buildInputOption(options)
  const outputOptions = buildOutputOptions(options)

  if (!inputOption.input || !outputOptions || !outputOptions.length) {
    console.warn(chalk.red('必须包含输入和输出！'))
    return
  }

  if (watch) {
    console.log(chalk.blue('watch start...'))
    const watcher = rollup.watch({
      ...inputOption,
      output: outputOptions,
      watch: {
        exclude: 'node_modules/**'
      }
    })
    watcher.on('change', file => {
      changeFile = file.replace(cwd, '')
    })
    watcher.on('event', e => {
      if (!changeFile) {
        // 开始就错，则停止运行
        if (e.code === 'ERROR') {
          watcher.close()
          console.error(e.error.stack)
          process.exit(0)
        }
      } else {
        switch (e.code) {
          case 'START':
            start = Date.now()
            break
          case 'ERROR':
            console.error(e.error.stack)
            break
          case 'END':
            console.log(
              chalk.cyan('rebuild use time:', `${Date.now() - start}ms`),
              `-> ${changeFile}`)
            break
        }
      }
    })
  } else {
    start = Date.now()
    const bundle = await rollup.rollup(inputOption)
    outputOptions.map(async (output) => {
      await bundle.write(output)
    })
    console.log(chalk.green('build use time:', `${Date.now() - start}ms`))
  }
}

exports.doRollup = doRollup
