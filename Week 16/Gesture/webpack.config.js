module.exports = {
    entry: "./gesture.js",
    module: {
        rules: [{
            test: /\.js$/,
            use: {
                loader: "babel-loader",
                options: {
                    presets: ["@babel/preset-env"],
                },
            },
        }, ],
    },
    mode: "development",
/*     devServer: {
      open: true,
      hot: true,
      compress: true,
      disableHostCheck: true, //webpack4.0 开启热更新
    }, */
};