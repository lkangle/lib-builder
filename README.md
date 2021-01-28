## library builder

开箱即用的JavaScript库打包工具，内部使用rollup实现

### 安装
```shell script
npm install --save-dev @lkl/builder --registry=http://npm.lkangle.cn
```

### 使用
```shell script
$ npx builder -h
Usage: builder <option>

Options:
  -v, --version          查看工具版本号
  -i, --input <input>    输入文件 (default: "index.js")
  -o, --output <output>  输出文件 (default: "dist/index.js")
  -f, --format <format>  输出的文件类型 (default: "umd")
  -w, --watch            监听文件变化
  -h, --help             查看帮助
```

### 支持使用配置文件
在项目根目录下创建`build.config.js`，默认配置
```json5
{
  mode: 'development',     // 构建模式 默认开发（不压缩） production生成（压缩代码）
  input: '',               // 入口文件
  plugins: [],             // 要使用的插件
  extensions: ['.ts', '.js', '.json'],
  alias: {                 // 配置别名 @rollup/plugin-alias
    '@': '/src'
  },
  output: [],              // 打包输出文件
  server: {                // 开发服务器配置
    contentBase: '/dist',
    port: 4002
  },
  terser: {}               // 代码压缩配置 rollup-plugin-terser
  // 可写其他rollup支持的配置
}
```

#### 内建的插件
- @rollup/plugin-commonjs

暂未向外暴露配置
- @rollup/plugin-node-resolve

支持 `extensions` 配置

- @rollup/plugin-alias

通过 `alias` 配置

- rollup-plugin-serve

在开发模式并且启用`-w`时会自动启用。可通过`server`来指定配置

- rollup-plugin-terser

在生产模式并且`terser`不为`false`时启用，可以通过`terser`来指定配置

- @rollup/plugin-babel

当项目跟目录下存在`.babelrs`或`.babelrc.json`的babel的配置时会启用，当启用babel时必须要安装相关的babel库

插件默认配置如下，暂不支持配置
```json5
{
  exclude: 'node_modules',
  babelHelpers: 'bundled',
  extensions: '${extensions}'
}
```
