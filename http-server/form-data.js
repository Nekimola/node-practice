"use strict";

const fs = require('fs');

module.exports = class FormData {
    constructor (request) {
        this.request = request;
    }

    get () {
        const contentType = this.request.headers['Content-Type'];
        const index = contentType.indexOf('boundary=');
        const boundary = index !== -1 ? contentType.substr(index + 9) : '';
        const internalSep = `\r\n--${boundary}\r\n`;
        const finishSep = `\r\n--${boundary}--\r\n`;

        return new Promise((resolve, reject) => {
            if (!boundary) {
                reject('Not a form was sent.');
            }

            let result = [];
            let requestData = new Buffer(0);

            this.request.on('data', data => {
                requestData = Buffer.concat([requestData, data]);

                if (requestData.indexOf(finishSep) === -1) {
                    return;
                }

                let formData = requestData
                        .toString('binary')
                        .replace(finishSep, '')
                        .split(internalSep);

                formData.forEach(val => {
                    let inputDataArr = val.split('\r\n\r\n');

                    if (inputDataArr[0].indexOf('Content-Disposition') === -1) {
                        return;
                    }

                    if (inputDataArr[0].indexOf('filename=') === -1) {
                        result.push(this._getTextInfo(inputDataArr));
                        return;
                    }

                    result.push(this._getFileInfo(inputDataArr));
                });

                resolve(result);
                this.request.emit('end');
            });
        });
    };

    _getFileInfo (infoArr) {
        const fileInfo = infoArr[0].split('; ');
        const name = this._parseValue(fileInfo[1]);
        const filename = this._parseValue(fileInfo[2]);
        const data = new Buffer(infoArr[1], 'binary');

        if (filename) {
            fs.writeFile(`./tmp/${filename}`, data, 'binary', err => {
                if (err) {
                    this.request.emit('error', err);
                }
            });
        }

        return {
            name: name,
            filename: filename,
            path: `./tmp/${filename}`
        };
    };

    _parseValue (str) {
        return str.match(/"(.*?)"/)[1];
    };

    _getTextInfo (info) {
        return {
            name: this._parseValue(info[0]),
            value: info[1]
        };
    };
};
