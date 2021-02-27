var Generator = require('yeoman-generator');

module.exports = class extends Generator {
    constructor(args, opts) {
        let ans;
        super(args, opts);
    }
    async initPackage() {
        let answer = await this.prompt([{
            type: "input",
            name: "name",
            message: "Your project name",
            default: this.appname
        }]);

        this.ans = answer;

        const pkgJson = {
            "name": answer.name,
            "version": "1.0.0",
            "description": "",
            "main": "generators/app/index.js",
            "scripts": {
                "test": "mocha --require @babel/register",
                "build":"webpack",
                "coverage":"nyc mocha"
            },
            "author": "",
            "license": "ISC",
            "dependencies": {},
            "devDependencies": {}
        }
        this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
        this.npmInstall(["vue"], {'save-dev': false});
        this.npmInstall(["vue-loader","babel-loader", "webpack", "vue-template-compiler",
            "vue-style-loader", "css-loader", "copy-webpack-plugin","@babel/core",
            "@babel/preset-env","@babel/register", "@istanbuljs/nyc-config-babel",
            "babel-plugin-istanbul","webpack-cli","mocha","nyc"
        ], {
            'save-dev': true
        });

    };

    copyFiles() {
        this.fs.copyTpl(
            this.templatePath('sample-test.js'),
            this.destinationPath('test/sample-test.js'), {}
        );
        this.fs.copyTpl(
            this.templatePath('HelloWorld.vue'),
            this.destinationPath('src/HelloWorld.vue'), {}
        );
        this.fs.copyTpl(
            this.templatePath('webpack.config.js'),
            this.destinationPath('webpack.config.js'), {}
        );
        this.fs.copyTpl(
            this.templatePath('main.js'),
            this.destinationPath('src/main.js'), {}
        );
        this.fs.copyTpl(
            this.templatePath('index.html'),
            this.destinationPath('src/index.html'), {
                title: this.ans.name
            }
        );
        this.fs.copyTpl(
            this.templatePath('.babelrc'),
            this.destinationPath('.babelrc'), {}
        );
        this.fs.copyTpl(
            this.templatePath('.nycrc'),
            this.destinationPath('.nycrc'), {}
        );
    };


};