"use strict";

module.exports = {
    get: (socket, contentType) => {
        const index = contentType.indexOf('boundary='),
              boundary = index !== -1 ? contentType.substr(index + 9, contentType.length - 2) : '';

        console.log(boundary);

        return new Promise((resolve, reject) => {
            if (!boundary) {
                reject('Not a form was sent.');
            }

            socket.on('data', data => {
                console.log('Data called');
                console.log(data.toString().split(`Content-Disposition`));
            });
        });
    }
};