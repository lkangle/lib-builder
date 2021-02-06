const fs = require('fs')
const path = require('path')
const alias = require('@rollup/plugin-alias')
const commonjs = require('@rollup/plugin-commonjs')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const { CWD, serverContentBase } = require('./utils')

const defaultCustomConfig = {
  input: '',
  plugins: [],
  extensions: ['.ts', '.js', '.json'],
  alias: {
    '@': `${CWD}/src`
  },
  output: [],
  server: {
    contentBase: `${CWD}/dist`,
    port: 4002
  },
  terser: false
}

function getDefaultConfig(...excludes) {
  return JSON.parse(JSON.stringify(defaultCustomConfig, (key, value) => {
    if (excludes.includes(key)) {
      return undefined
    }
    return value
  }))
}

function getCustomConfig(...excludes) {
  const configPath = `${CWD}/build.config.js`
  let formFile = false
  let customConfig = getDefaultConfig(...excludes)
  if (fs.existsSync(configPath)) {
    customConfig = Object.assign(customConfig, require(configPath))
    formFile = true
  }
  return [customConfig, formFile]
}

function _pushNotExist(plugins, plugin) {
  if (plugins.findIndex(value => value.name === plugin.name) === -1) {
    plugins.push(plugin)
  }
}

function buildPlugins(config, { watch, output }) {
  const userPlugins = config.plugins || []
  _pushNotExist(userPlugins, commonjs())
  _pushNotExist(userPlugins, nodeResolve({
    extensions: config.extensions
  }))
  _pushNotExist(userPlugins, alias({
    entries: config.alias
  }))

  if (watch) {
    const serve = require('rollup-plugin-serve')
    let contentBase = serverContentBase(output, config.server.contentBase)
    let serveConfig = { ...config.server, contentBase }
    _pushNotExist(userPlugins, serve(serveConfig))
  }

  if (config.terser) {
    let terserConfig = config.terser === true ? {} : config.terser
    const { terser } = require('rollup-plugin-terser')
    _pushNotExist(userPlugins, terser(terserConfig))
  }

  if (fs.existsSync(`${CWD}/.babelrc`) || fs.existsSync(`${CWD}/.babelrc.json`)) {
    const { babel } = require('@rollup/plugin-babel')
    _pushNotExist(userPlugins, babel({
      exclude: 'node_modules',
      babelHelpers: 'bundled',
      extensions: config.extensions
    }))
  }
  return userPlugins
}

function buildInputOption(options) {
  const { input, watch, terser } = options
  const [customConfig, fromFile] = getCustomConfig('output')
  if (!fromFile) {
    customConfig.input = path.resolve(CWD, input)
  }
  if (!customConfig.terser) {
    customConfig.terser = terser
  }

  const rollupInputOption = {
    input: customConfig.input,
    plugins: buildPlugins(customConfig, options)
  }
  const dfKeys = Object.keys(defaultCustomConfig)
  if (Object.keys(customConfig).length > dfKeys.length) {
    Object.entries(customConfig).forEach(([key, value]) => {
      if (!dfKeys.includes(key)) {
        rollupInputOption[key] = value
      }
    })
  }
  return rollupInputOption
}

function buildOutputOptions({ output, format, name, sourcemap }) {
  const [customConfig, fromFile] = getCustomConfig()
  let outputOptions = customConfig.output
  if (!Array.isArray(outputOptions)) {
    outputOptions = [outputOptions]
  }
  if (!fromFile) {
    outputOptions.push({
      file: path.resolve(CWD, output),
      format: format,
      sourcemap,
      name
    })
  }
  return outputOptions.map(out => {
    let _format = out.format || 'iife'
    if (_format === 'umd' && !out.name) {
      out.name = name || path.basename(out.file).replace(/(\..*)$/, '')
    }
    return {...out, format: _format}
  })
}

module.exports = {
  buildInputOption,
  buildOutputOptions
}
