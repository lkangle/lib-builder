const fs = require('fs')
const path = require('path')
const alias = require('@rollup/plugin-alias')
const commonjs = require('@rollup/plugin-commonjs')
const { nodeResolve } = require('@rollup/plugin-node-resolve')

const cwd = process.cwd()

const defaultCustomConfig = {
  input: '',
  plugins: [],
  extensions: ['.ts', '.js', '.json'],
  alias: {
    '@': `${cwd}/src`
  },
  output: [],
  server: {
    contentBase: `${cwd}/dist`,
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
  const configPath = `${cwd}/build.config.js`
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

function buildPlugins(config, watch) {
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
    let serveConfig = { ...config.server }
    _pushNotExist(userPlugins, serve(serveConfig))
  }

  if (config.terser) {
    let terserConfig = config.terser === true ? {} : config.terser
    const { terser } = require('rollup-plugin-terser')
    _pushNotExist(userPlugins, terser(terserConfig))
  }

  if (fs.existsSync(`${cwd}/.babelrc`) || fs.existsSync(`${cwd}/.babelrc.json`)) {
    const { babel } = require('@rollup/plugin-babel')
    _pushNotExist(userPlugins, babel({
      exclude: 'node_modules',
      babelHelpers: 'bundled',
      extensions: config.extensions
    }))
  }
  return userPlugins
}

function buildInputOption(input, watch) {
  const [customConfig, fromFile] = getCustomConfig('output')
  if (!fromFile) {
    customConfig.input = path.resolve(cwd, input)
  }
  const rollupInputOption = {
    input: customConfig.input,
    plugins: buildPlugins(customConfig, watch)
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
      file: path.resolve(cwd, output),
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
