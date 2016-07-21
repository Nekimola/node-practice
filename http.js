"use strict";

const net = require('net');

let parseHeaders = headers => {
        return headers.reduce((prev, current) => {
            let headerArr = current.split(':'),
                [key, ...value] = headerArr;

            prev[headerArr[0]] = value.join('');

            return prev;
        }, {});
    },

    parseUrl = urlStr => {
        var info = urlStr.split(' ');

        return {
            method: info[0],
            url: info[1],
            protocolVersion: info[2]
        }
    };


module.exports = {
    createServer: callback => {
        return net.createServer(socket => {
            const separator = '\r\n\r\n';
            let request = '';

            socket.setEncoding('utf-8');

            socket.on('data', data => {
                request += data;

                if (request.indexOf(separator) === -1) {
                    return;
                }

                let headersStr = request.split(separator)[0],
                    headersArr = headersStr.split('\n'),
                    [url, ...headers] = headersArr;

                socket.temp = Object.assign({ headers: parseHeaders(headers) }, parseUrl(url)) ;

                callback(socket);
            });
        });
    }
};