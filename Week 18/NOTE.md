学习笔记

单元测试 (Mocha)  https://mochajs.org/


code coverage(istanbul):  npm install --save-dev nyc
万事之前先 npm init



含demo

抄作业:

# 学习笔记

## mocha

npm install --save-dev mocha

使用babel来转换import命令

.babelrc文件 

```
{
    "presets" : ["@babel/preset-env"]
}
```

## code coverage

使用istanbuljs/nyc测试覆盖率

npm install --save-dev nyc

npm install --save-dev babel-plugin-istanbul @istanbul/nyc-config-babel


.babelrc文件 

```
{
    "presets" : ["@babel/preset-env"],
    "plugins":["istanbul"]
}
```

.nycrc 

```
{
    "extends": "@istanbuljs/nyc-config-babel"
}
```

## 对parser.js进行测试

因为使用babel翻译，vs code 调试时行数对不上 在babelrc中加入"sourceMaps": "inline"  
vscode的launch.json  

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "pwa-node",
            "request": "launch",
            "name": "Launch Program",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "runtimeArgs":[
                "--require","@babel/register"
            ],
            "sourceMaps": true,
            "args":[

            ],
            "program": "${workspaceFolder}\\node_modules\\.bin\\mocha"
        }
    ]
}
```

npm run test  
npm run coverage  


## 使用yeoman-generator集成测试模块

修改index.js中的pkgJson, 安装的npm包和复制的文件名。

```bash
yo xxx
npm run test
npm run coverage
npm build
```
