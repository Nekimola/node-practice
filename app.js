"use strict";

const http = require('./http');
const fs = require('fs');
const mime = require('mime');

const port = process.env.port || 3000;
let setHeaders = function (data) {
        const status = data.error ? 404 : 200,
              type = mime.lookup(data.url);

        return [
            `HTTP/1.1 ${status} OK`,
            `Content-Type: ${type}; charset=UTF-8`,
            ``,
            ``
        ].join(`\r\n`);
    };


let server = http.createServer(socket => {
    fs.readFile('./public' + socket.temp.url, function (err, data) {
        if (err) {
            socket.write(setHeaders({ error: true }));
            socket.end('Something went wrong.');
            return;
        }

        socket.write(setHeaders({
            error: false,
            url: socket.temp.url
        }));
        socket.end(data);
    });
});

server.listen(port, function () {
    console.log('Listening on port ' + port);
});