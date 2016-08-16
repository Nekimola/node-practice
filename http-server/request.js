const Readable = require('stream').Readable;

module.exports = class Request extends  Readable {
    constructor (socket) {
        super();

        this.socket = socket;
        this._parseData();
    };

    _read () {
        let onData = data => {
            this.socket.pause();
            this.socket.removeListener('data', onData);
            this.push(data);

        };

        this.socket.resume();
        this.socket.on('data', onData);
    };

    _parseData () {
        const separator = '\r\n\r\n';
        let requestData = new Buffer(0);

        let onData = (data) => {
            requestData = Buffer.concat([requestData, data]);
            let index = requestData.indexOf(separator);

            if (index === -1) {
                return;
            }

            this._parseHeaders(requestData, index);

            this.socket.pause();
            this.socket.removeListener('data', onData);
            this.socket.unshift(requestData.slice(index));
        };

        this.socket.on('data', onData);
    };

    _parseHeaders(requestData, index) {
        let headersStr = requestData.slice(0, index).toString();
        let headersArr = headersStr.split('\r\n');
        let [url, ...headers] = headersArr;

        Object.assign(this, this._parseUrl(url)) ;

        this.headers = headers.reduce((prev, current) => {
            let headerArr = current.split(':');
            let [key, ...value] = headerArr;

            prev[key] = value.join('');

            return prev;
        }, {});

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
