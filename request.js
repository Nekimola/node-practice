const Readable = require('stream').Readable;

module.exports = class Request extends  Readable {
    constructor (socket) {
        super();

        this.socket = socket;
        this._parseData();
    };

    _read () {
        this.push(this.socket.read());
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

            //this.socket.pause();
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


// Pull off a header delimited by \n\n
// use unshift() if we get too much
// Call the callback with (error, header, stream)
const StringDecoder = require('string_decoder').StringDecoder;


function parseHeader(stream, callback) {
    stream.on('error', callback);
    stream.on('readable', onReadable);

    const decoder = new StringDecoder('utf8');

    var header = '';

    function onReadable() {
        var chunk;

        while (null !== (chunk = stream.read())) {
            var str = decoder.write(chunk);

            if (str.match(/\n\n/)) {
                // found the header boundary
                var split = str.split(/\n\n/);

                header += split.shift();

                const remaining = split.join('\n\n');
                const buf = Buffer.from(remaining, 'utf8');

                if (buf.length)
                    stream.unshift(buf);

                stream.removeListener('error', callback);
                stream.removeListener('readable', onReadable);
                // now the body of the message can be read from the stream.
                callback(null, header, stream);
            } else {
                // still reading the header.
                header += str;
            }
        }
    }
}
