"use strict";

const fs = require('fs');
const mime = require('mime');

const http = require('./http');
const formData = require('./form-data');

const port = process.env.port || 3000;

let server = http.createServer((request, response) => {
    const url = request.url;

    if (url === '/login') {
        formData.get(request.socket, request.headers)
            .then(data => {
                console.log(data);
            });

        return;
    }

    const path = './public' + url;

    fs.stat(path, err => {
        if (err) {
            response.writeHead(404);
            response.end(`${url}: The requested resource could not be found.`);
            return;
        }

        fs.readFile(path, (err, data) => {
            if (err) {
                response.writeHead(503);
                response.end('Something went wrong.');
                return;
            }

            const type = mime.lookup(url);

            response.writeHead(200, {'Content-Type': `${type}; charset=UTF-8`});
            response.end(data);
        });
    });
});

server.listen(port, () => {
    console.log('Listening on port ' + port);
});