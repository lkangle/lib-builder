const { networkInterfaces } = require('os')
const fs = require('fs')
const path = require('path')
const extract = require('extract-zip')
const chalk = require('chalk')
const { spawnSync } = require('child_process')
const readline = require('readline')

const TEMP_FOLDER = path.resolve(__dirname, '../templates')
const CWD = process.cwd()

const isDirectory = filepath => {
  return fs.existsSync(filepath) && fs.statSync(filepath).isDirectory()
}

const isFile = (filepath) => {
  return fs.existsSync(filepath) && fs.statSync(filepath).isFile()
}

const readJsonFile = (filepath) => {
  if (isFile(filepath)) {
    try {
      return JSON.parse(fs.readFileSync(filepath).toString('utf8'))
    } catch (e) {
      return null
    }
  }
  return null
}

const writeJsonFile = (obj, filepath) => {
  if (!isDirectory(filepath)) {
    let content = JSON.stringify(obj, null, 2)
    fs.writeFileSync(filepath, content, { encoding: 'utf8' })
    return true
  }
  return false
}

const mkdirs = (target) => {
  if (!fs.existsSync(target)) {
    return fs.mkdirSync(target, { recursive: true })
  }
  return null
}

/**
 * 判断文件夹是不是空文件夹 不存在的也是空文件夹
 * 排除.git .idea等.开头的文件夹
 * @param folder
 * @return {boolean}
 */
const isEmptyFolder = (folder) => {
  if (fs.existsSync(folder)) {
    let files = fs.readdirSync(folder).filter(file => {
      return !/^\./.test(file) || fs.statSync(path.resolve(folder, file)).isFile()
    })
    return !files || files.length === 0
  }
  return true
}

const unzipFile = (target, filepath) => {
  mkdirs(target)
  return extract(filepath, {
    dir: target
  })
}

const getIp = () => {
  let network = networkInterfaces()
  for (const entity of Object.entries(network)) {
    let nets = entity[1]
    for (const net of nets) {
      if (net.address !== '127.0.0.1' && net.family === 'IPv4') {
        return net.address
      }
    }
  }
  return 'localhost'
}

const getPackageJsonPath = (projectPath = CWD) => {
  let pkgPath = path.resolve(projectPath, 'package.json')
  if (fs.existsSync(pkgPath)) {
    return pkgPath
  }
  console.trace(chalk.red('未发现【package.json】文件，确定该目录下是js项目吗？'))
  return null
}

const extendFieldOfPkgJson = (projectPath = CWD, field, fieldValue) => {
  let pkgJsonPath = getPackageJsonPath(projectPath)
  let json = readJsonFile(pkgJsonPath)
  if (json) {
    let value = json[field] || {}
    if (typeof fieldValue === 'string') {
      json[field] = fieldValue
    } else {
      Object.assign(value, fieldValue)
      json[field] = value
    }
    if (writeJsonFile(json, pkgJsonPath)) {
      return value
    }
  }
  return false
}

/**
 * 扩展项目下package.json的devDeps
 * @param projectPath  项目路径
 * @param addDeps      添加的依赖
 * @return {{}|boolean}  成功返回deps 失败false
 */
const extendDevDepsOfPkgJson = (projectPath = CWD, addDeps) => {
  return extendFieldOfPkgJson(projectPath, 'devDependencies', addDeps)
}

const execNpm = (cwd, ...args) => {
  const isWin = process.platform === 'win32'

  let rs = spawnSync(isWin ? 'npm.cmd' : 'npm', args, {
    cwd, stdio: 'inherit',
  })
  if (rs.error) {
    throw rs.error
  }
}

const getJestConfig = (useTs = false) => {
  const configPath = path.resolve(TEMP_FOLDER, 'jest.conf')
  let conf = fs.readFileSync(configPath).toString('utf8')
  if (useTs) {
    conf = 'export default ' + conf
  } else {
    conf = 'module.exports = ' + conf
  }
  conf = `/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

${conf}
 `
  return conf
}

const readLine = (tipMsg, defaultVal) => {
  let rl = readline.createInterface(process.stdin, process.stdout)

  return new Promise(resolve => {
    rl.question(tipMsg, val => {
      rl.close()
      if (val == null || val.trim().length < 1) {
        resolve(defaultVal)
      } else {
        resolve(val)
      }
    })
  })
}

module.exports = {
  mkdirs,
  isEmptyFolder,
  unzipFile,
  getIp,
  getJestConfig,
  readJsonFile,
  writeJsonFile,
  getPackageJsonPath,
  extendFieldOfPkgJson,
  extendDevDepsOfPkgJson,
  execNpm,
  readLine,
  TEMP_FOLDER,
  CWD,
}
