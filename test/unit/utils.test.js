const {
  mkdirs,
  isEmptyFolder,
  unzipFile,
  readJsonFile,
  writeJsonFile,
  getPackageJsonPath,
  execNpm,
  getJestConfig
} = require('../../lib/utils')
const fs = require('fs')
const path = require('path')

describe('[Test] utils', () => {
  test('mkdirs', () => {
    let folder = `${__dirname}/${Date.now()}`
    expect(mkdirs(folder)).not.toBeNull()
    fs.rmdirSync(folder)
  })

  test('isEmptyFolder', () => {
    expect(isEmptyFolder(__dirname)).toBeFalsy()
    expect(isEmptyFolder('/home/empty')).toBeTruthy()
    expect(isEmptyFolder(path.resolve(__dirname, '../empty'))).toBeTruthy()
    expect(isEmptyFolder(path.resolve(process.cwd()))).toBeFalsy()
  })

  test('unzipFile', () => {
    let target = path.resolve(__dirname, '../../templates')
    return unzipFile(target + '/demo', target + '/demo.zip')
  })

  test('readJsonFile', () => {
    let file = path.resolve(__dirname, '../../templates/tsconfig.json')
    expect(readJsonFile(file)).toHaveProperty('compilerOptions')
    expect(readJsonFile(null)).toBeNull()
  })

  test('writeJsonFile', () => {
    let obj = { name: 'acc', ips: ['103.2.3.12'], info: { age: 12 } }
    let file = path.resolve(__dirname, 'temp.json')
    expect(writeJsonFile(obj, file)).toBeTruthy()
    fs.unlinkSync(file)
  })

  test('getPackageJsonPath', () => {
    expect(getPackageJsonPath()).not.toBeNull()
  })

  test('execNpm', () => {
    execNpm(process.cwd(), '-v')
  })

  test('getJestConfig', () => {
    let conf = getJestConfig(true)
    expect(conf.length).toBeGreaterThanOrEqual(100)
  })
})
