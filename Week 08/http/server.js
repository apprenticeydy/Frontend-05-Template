const http = require('http');

const server = http.createServer((request, response) => {
    let body = [];

    console.log('client connected');

    request.on('error', (err) => {
        console.log(err);
    }).on('data', (chunk) => {
        console.log('server data')
        body.push(chunk.toString());
    }).on('end', () => {
        console.log('server end')
            //body = Buffer.concat(body).toString();
        console.log("body:", body);
        response.writeHead(200, { 'Content-Type': 'text/html' })
        response.end(' Hellp Wprld\n');
    });

}).listen(8088);

server.on('error', (err) => {
    throw err;
});

console.log('server started')