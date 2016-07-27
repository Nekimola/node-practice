const Writable = require('stream').Writable;
const fs = require('fs');
const mime = require('mime');

module.exports = class Response extends Writable {
    constructor (socket, options = {}) {
        super(options);

        this.socket = socket;
        this.writeHeadWasCalled = false;
        this.headers = [];
    };

    _write (data, encoding, callback) {
        if (!this.writeHeadWasCalled) {
            this.writeHead();
        }

        return this.socket.write(data, encoding, callback);
    }

    writeHead (status = 200, headers) {
        // if (this.writeHeadWasCalled) {
        //     throw Error('WriteHead was already called.');
        // }

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

        this.socket.write(this._headersToString());
    };

    setHeader (key, header) {
        // if (this.writeHeadWasCalled) {
        //     throw Error('WriteHead was already called.');
        // }

        if (Array.isArray(header)) {
            header = header.join(', ');
        }

        this.headers.push(`${key}: ${header}`);
    };

    // write (data) {
    //     if (!this.writeHeadWasCalled) {
    //         this.writeHead();
    //     }
    //
    //     this.socket.write(data);
    // };

    // end (data) {
    //     if (!this.writeHeadWasCalled) {
    //         this.writeHead();
    //     }
    //
    //     this.socket.end(data);
    // };

    _headersToString () {
        return this.headers
            .concat(['', ''])
            .join(`\r\n`);
    };
};