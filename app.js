const http = require('./http');

const port = process.env.port || 3000;

let server = http.createServer(socket => {
    console.log(socket.temp);
    socket.end('Test');
});

server.listen(port, function () {
    console.log('Listening on port ' + port);
});