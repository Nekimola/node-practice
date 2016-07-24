"use strict";

const net = require('net');

const Request = require('./request.js');
const Response = require('./response.js');


module.exports = {
    createServer: callback => {
        return net.createServer(socket => {
            const separator = '\r\n\r\n';
            let requestStr = '';

            socket.setEncoding('utf-8');

            socket.on('data', data => {
                requestStr += data;

                if (requestStr.indexOf(separator) === -1) {
                    return;
                }

                let request = new Request(requestStr.split(separator)[0]);
                let response = new Response(socket);

                callback(request, response);
            });
        });
    }
};