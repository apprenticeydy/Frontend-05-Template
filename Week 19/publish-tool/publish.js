let http = require('http');
let fs = require('fs');
let archiver = require('archiver');
let child_process = require("child_process");
let querystring = require('querystring');
const { report } = require('process');
// fs.stat("./sample.html",(err, stats) => {
//     let request = http.request({
//         hostname: "127.0.0.1",
//         port: 8002,
//         method: "POST",
//         headers: {
//             'Content-Type': 'application/octet-stream',
//             'Content-Length': stats.size,
//         }
//     }, response => {

//         console.log(response);
//     });


//     let file = fs.createReadStream("./sample.html");

//     file.pipe(request);


//     file.on('end', () => request.end()); 
// })

// 1. 打开https://github.com/login/oauth/authorize

child_process.exec(`start https://github.com/login/oauth/authorize?client_id=Iv1.baec3ef8250ee94b`);

// 3. 创建server， 接受token， 点击发布
http.createServer(function(request, response){
    let query = querystring.parse(request.url.match(/^\/\?([\s\S]+)$/)[1]);
    publish(query.token);

}).listen(8003);

function publish(token) {
    let request = http.request({
        hostname: "127.0.0.1",
        port: 8002,
        method: "POST",
        path: "/publish?token=" + token,
        headers: {
            'Content-Type': 'application/octet-stream',
            //'Content-Length': stats.size,
        }
    }, response => {
        console.log(response);
    });

    const archive = archiver('zip', {
        zlib: {level:9}
    });
    archive.directory('./sample/', false);

    archive.finalize();
    archive.pipe(request);

}


