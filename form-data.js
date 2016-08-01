"use strict";
const fs = require('fs');

module.exports = class FormData {
    getFileInfo (infoArr) {
        let fileInfo = infoArr[0].split('; ');
        let name = this.getInputName(fileInfo[1]);
        let filename = this.getInputName(fileInfo[2]);

        let data = new Buffer(infoArr[1], 'binary');

        console.log('File data', data.length);

        if (filename) {
            fs.writeFile(`./tmp/${filename}`, data, function(err) {
                console.log(err);
            });
        }

        return {
            name: name,
            filename: filename
        };
    }

    getInputName (str) {
        return str.match(/"(.*?)"/)[1];
    }

    getTextInfo (info) {
        return {
            name: this.getInputName(info[0]),
            value: info[1]
        };
    }

    get (request) {
        const contentType = request.headers['Content-Type'];
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

            request.on('data', data => {
                requestData = Buffer.concat([requestData, data]);

                if (requestData.indexOf(finishSep) === -1) {
                    return;
                }

                console.log('Request data', requestData.length);

                let formData = requestData
                        .toString('utf8')
                        .replace(finishSep, '')
                        .split(internalSep);

                formData.forEach(val => {
                    let inputDataArr = val.split('\r\n\r\n');

                    if (inputDataArr[0].indexOf('Content-Disposition') === -1) {
                        return;
                    }

                    if (inputDataArr[0].indexOf('filename=') === -1) {
                        result.push(this.getTextInfo(inputDataArr));
                        return;
                    }

                    result.push(this.getFileInfo(inputDataArr));
                });

                resolve(result);
                request.emit('end');
            });
        });
    }
};
