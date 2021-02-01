const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const {
  unzipFile,
  isEmptyFolder,
  readJsonFile,
  writeJsonFile,
  extendDevDepsOfPkgJson,
  extendFieldOfPkgJson,
  execNpm,
  mkdirs,
  getJestConfig,
  TEMP_FOLDER, CWD,
} = require('./utils')

function addBabel(projectPath = CWD) {
  let result = extendDevDepsOfPkgJson(projectPath, {
    "@babel/core": "^7.12.10",
    "@babel/preset-env": "^7.12.11",
    "@babel/plugin-proposal-class-properties": "^7.12.1"
  })
  if (result) {
    let babelrc = path.resolve(TEMP_FOLDER, '.babelrc')
    let targetRc = path.resolve(projectPath, '.babelrc')

    if (fs.existsSync(targetRc)) {
      let babelConfig = readJsonFile(targetRc)
      let presets = babelConfig.presets || []
      if (!presets.some(value => /[\/-]env/.test(Array.isArray(value) ? value[0] : value))) {
        presets.unshift([
          '@babel/env',
          {
            targets: {
              chrome: 85
            }
          }
        ])
      }
      let plugins = babelConfig.plugins || []
      if (!plugins.some(value => /plugin-proposal-class-properties/.test(Array.isArray(value) ? value[0] : value))) {
        plugins.push('@babel/plugin-proposal-class-properties')
      }
      babelConfig.presets = presets
      babelConfig.plugins = plugins
      writeJsonFile(babelConfig, targetRc)
    } else {
      try {
        fs.copyFileSync(babelrc, targetRc)
      } catch (e) {
        console.log(chalk.yellow('创建默认babel配置失败，请手动创建，并配置@babel/preset-env预设。'))
      }
    }
    return true
  }
  return false
}

function addTypescript(projectPath = CWD) {
  let result = extendDevDepsOfPkgJson(projectPath, {
    "@babel/preset-typescript": "^7.12.7"
  })
  if (result) {
    if (!Object.keys(result).includes('@babel/core')) {
      addBabel(projectPath)
    }
    let tsConfig = path.resolve(TEMP_FOLDER, 'tsconfig.json')
    let targetTsConfig = path.resolve(projectPath, 'tsconfig.json')
    if (!fs.existsSync(targetTsConfig)) {
      fs.copyFileSync(tsConfig, targetTsConfig)
    }

    if (!extendFieldOfPkgJson(projectPath, 'scripts', {
      build: 'builder -i src/index.ts',
      dev: 'builder -i src/index.ts -w',
    })) {
      return false
    }

    let oldPath = path.resolve(projectPath, 'src/index.js')
    let newPath = path.resolve(projectPath, 'src/index.ts')
    if (!fs.existsSync(oldPath)) {
      return true
    }
    fs.renameSync(oldPath, newPath)
    return true
  }
  return false
}

function addEslint(projectPath = CWD) {
  console.log(chalk.red('暂不支持！'))
  return false
}

function addJest(useTs = false, projectPath = CWD) {
  let result = extendDevDepsOfPkgJson(projectPath, {
    "@types/jest": "^26.0.20",
    "jest": "^26.6.3"
  })
  if (result) {
    const configPath = path.resolve(projectPath, 'jest.config.js')
    if (!fs.existsSync(configPath)) {
      const confContent = getJestConfig(useTs)
      fs.writeFileSync(configPath, confContent, { encoding: 'utf8' })
    }

    const unitPath = path.resolve(projectPath, 'test/unit')
    mkdirs(unitPath)
    const sourceIndex = path.resolve(TEMP_FOLDER, 'index.test.js')
    const targetIndex = path.resolve(unitPath, 'index.test' + (useTs ? '.ts' : '.js'))
    if (!fs.existsSync(targetIndex)) {
      fs.copyFileSync(sourceIndex, targetIndex)
    }

    execNpm(projectPath, 'install')

    console.log(chalk.green(`\n添加Jest成功。`))
    return true
  }
  return false
}

/**
 * 初始化一个最基础的项目
 * @param projectName 项目名称
 * @param {{ts, eslint, jest}} options 选项
 */
async function createProject(projectName, options) {
  projectName = projectName.replace(/\.+/, '.')
  let projectPath = path.resolve(CWD, projectName)

  if (!isEmptyFolder(projectPath)) {
    return console.log(chalk.red(`目标目录不为空，无法初始化项目:【${projectPath}】`))
  }

  await unzipFile(projectPath, path.resolve(TEMP_FOLDER, 'demo.zip'))
  extendFieldOfPkgJson(projectPath, 'name', projectName)

  if (options.ts) {
    addTypescript(projectPath)
  }
  if (options.eslint) {
    addEslint(projectPath)
  }
  if (options.jest) {
    addJest(projectPath)
  }

  console.log(chalk.blue('项目配置完成，开始安装依赖... \n'))

  execNpm(projectPath, 'install')

  console.log(chalk.green(`\n 项目【${projectName}】创建成功！`))
  console.log(chalk.green(` -> ${projectPath}`))
}

module.exports = {
  createProject,
  addBabel,
  addTypescript,
  addEslint,
  addJest
}
