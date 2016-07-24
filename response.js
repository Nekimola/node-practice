const fs = require('fs');
const mime = require('mime');

module.exports = class Response {
    constructor (socket) {
        this.socket = socket;
        this.writeHeadWasCalled = false;
        this.headers = [];
    };

    writeHead (status = 200, headers) {
        if (this.writeHeadWasCalled) {
            return;
        }

        this.headers.push(`HTTP/1.1 ${status} OK`);
        this.writeHeadWasCalled = true;

        if (headers) {
            Object.keys(headers).forEach(key => {
                this.setHeader(key, headers[key]);
            });
        }

        this.write(this._headersToString());
    };

    setHeader (key, header) {
        if (Array.isArray(header)) {
            header = header.join(', ');
        }

        this.headers.push(`${key}: ${header}`);
    };

    write (data) {
        if (!this.writeHeadWasCalled) {
            this.writeHead();
        }

        this.socket.write(data);
    };

    end (data) {
        if (!this.writeHeadWasCalled) {
            this.writeHead();
        }

        this.socket.end(data);
    };

    _headersToString () {
        return this.headers
            .concat(['', ''])
            .join(`\r\n`);
    };
};