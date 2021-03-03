学习笔记

本地 Git 的Hook功能
copy 并编写 ./.git/hooks/*   对应hook名称的文件

ESlint 轻量级代码规范检测


ESlint 配合git commit local hook ,  可以达到如果代码不和规范commit 失败的效果



Chrome Headless 模式 
npm puppeteer



# 学习笔记  (炒笔记)

1. git hook 检查时机
2. ESLint 轻量级代码检查方案
3. //PhantomJS 无头浏览器代码生成与检查
3. Chrome的headless模式

## Git hook

pre-commit   =>  lint

```bash
#! /usr/bin/env node
let process = require("process");
console.log("Hello, hooks!");
process.exit(1);
```

pre-push   => check

## ESLint

npm install --save-dev eslint

npx eslint --init

npx eslint ./index.js

## Chrome headless

puppeteer文件较大 安装需要一定时间

```nodejs
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:8080/main.html');
    const a = await page.$('a');
    console.log(await a.asElement().boxModel());
})();

```