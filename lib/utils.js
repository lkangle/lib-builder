const { networkInterfaces } = require('os')
const fs = require('fs')
const path = require('path')
const unzip = require('unzip')
const chalk = require('chalk')
const { spawnSync } = require('child_process')

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
 * @param folder
 * @return {boolean}
 */
const isEmptyFolder = (folder) => {
  if (fs.existsSync(folder)) {
    let files = fs.readdirSync(folder)
    return !files || files.length === 0
  }
  return true
}

const unzipFile = (target, filepath) => {
  mkdirs(target)
  return new Promise((resolve, reject) => {
    let ext = unzip.Extract({ path: target })
    ext.on('close', resolve)
    ext.on('error', reject)
    fs.createReadStream(filepath).pipe(ext)
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
    cwd, stdio: 'inherit'
  })
  if (rs.error) {
    throw rs.error
  }
}

module.exports = {
  mkdirs,
  isEmptyFolder,
  unzipFile,
  getIp,
  readJsonFile,
  writeJsonFile,
  getPackageJsonPath,
  extendFieldOfPkgJson,
  extendDevDepsOfPkgJson,
  execNpm,
  TEMP_FOLDER,
  CWD
}
