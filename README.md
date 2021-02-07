## library builder

开箱即用的JavaScript库打包工具，内部使用rollup实现

### 安装
```shell script
npm install --save-dev @lkl/builder --registry=http://npm.lkangle.cn
```

全局安装可支持使用`create`命令

### 使用

```shell script
$ npx builder -h
Usage: builder [command] [options]

Options:
  -v, --version                    查看工具版本号
  -h, --help                       查看帮助

Commands:
  build [options]                  library打包 (默认命令)
  add <library>                    添加库，支持: ts, jest, eslint, babel
  create [options] <project-name>  使用模板初始化一个项目
  help                             查看命令帮助

$ npx builder help build
Usage: builder build [options]

library打包 (默认命令)

Options:
  -i, --input <input>    输入文件 (default: "index.js")
  -o, --output <output>  输出文件 (default: "dist/index.js")
  -f, --format <format>  输出的文件类型 (default: "iife")
  -n, --name <name>      模块名
  -s, --sourcemap        输出sourcemap文件 (default: false)
  -t, --terser           使用terser进行压缩 (default: false)
  -w, --watch            监听文件变化 (default: false)
  -h, --help             查看帮助

$ npx builder help create
Usage: builder create [options] <project-name>

使用模板初始化一个项目

Options:
  --ts        使用typescript (default: false)
  --jest      添加jest (default: false)
  --eslint    添加eslint (default: false)
  -h, --help  查看帮助
  
$ npx builder help add
Usage: builder add [options] <library>

添加库，支持: ts, jest, eslint, babel

Options:
  -h, --help  查看帮助
```

### 支持使用配置文件
在项目根目录下创建`build.config.js`，默认配置
```json5
{
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
  terser: false            // 代码压缩配置 rollup-plugin-terser
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

在启用`-w`时会自动启用。可通过`server`来指定配置

- rollup-plugin-terser

当`terser`不为`false`时启用，可以通过`terser`来指定配置

- @rollup/plugin-babel

当项目跟目录下存在的babel的配置时会启用，当启用babel时必须要安装相关的babel库

插件默认配置如下，暂不支持配置
```json5
{
  exclude: 'node_modules',
  babelHelpers: 'bundled',
  extensions: '${extensions}'
}
```

- @rollup/plugin-eslint

当项目下存在eslint的配置时会自动启用，启用需要安装对应的eslint依赖

插件默认配置，不支持修改
```json5
{
  throwOnError: true
}
```
