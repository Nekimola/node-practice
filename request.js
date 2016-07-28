const Readable = require('stream').Readable;

module.exports = class Request extends  Readable {
    constructor (socket) {
        super();

        this.socket = socket;
        this.hasHeaders = false;

        this._parseData();
    };

    _read () {
        this.push(this.socket.read());
    };

    _parseData () {
        const separator = '\r\n\r\n';
        let requestData = new Buffer(0);
        let index;

        this.socket.on('data', data => {
            requestData = Buffer.concat([requestData, data]);
            index = requestData.indexOf(separator);

            if (this.hasHeaders) {
                return;
            }

            this._setHeaders(requestData, index);

            this.socket.unshift(requestData.slice(index));
            //this.socket.pause();
        });
    };

    _setHeaders (requestData, index) {
        let headersStr = requestData.slice(0, index).toString();
        let headersArr = headersStr.split('\n');
        let [url, ...headers] = headersArr;

        Object.assign(this, this._parseUrl(url)) ;

        this.headers = headers.reduce((prev, current) => {
            let headerArr = current.split(':');
            let [key, ...value] = headerArr;

            prev[key] = value.join('');

            return prev;
        }, {});

        this.hasHeaders = true;
        this.emit('has_headers');
    };

    _parseUrl (urlStr) {
        var info = urlStr.split(' ');

        return {
            method: info[0],
            url: info[1],
            protocolVersion: info[2]
        }
    };
};
