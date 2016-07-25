module.exports = class Request {
    constructor (headersStr) {
        let headersArr = headersStr.split('\n'),
            [url, ...headers] = headersArr;

        this.headers = this._parseHeaders(headers);
        Object.assign(this, this._parseUrl(url)) ;
    };

    _parseHeaders (headers) {
        return headers.reduce((prev, current) => {
            let headerArr = current.split(':');
            let [key, ...value] = headerArr;

            prev[key] = value.join('');

            return prev;
        }, {});
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
