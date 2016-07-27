"use strict";

const net = require('net');

const Request = require('./request.js');
const Response = require('./response.js');


module.exports = {
    createServer: callback => {
        return net.createServer(socket => {
            let request = new Request(socket);
            let response = new Response(socket);

            request.on('has_headers', function () {
                console.log(request.headers);

                // callback(request, response);
            })
        });
    }
};