"use strict";

const fs = require('fs');
const mime = require('mime');

const http = require('./http');

const port = process.env.port || 3000;

let server = http.createServer((request, response) => {
    const url = request.url,
          path = './public' + url;

    fs.stat(path, function (err) {
        if (err) {
            response.writeHead(404);
            response.end(`${url}: The requested resource could not be found.`);
            return;
        }

        fs.readFile(path, function (err, data) {
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

server.listen(port, function () {
    console.log('Listening on port ' + port);
});