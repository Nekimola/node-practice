const EventEmitter = require('events');

module.exports = class Game extends EventEmitter {
    constructor (options) {
        super();

        Object.assign(this, options, {
            state    : 'new',
            clientId : null,
            clientRes: null,
            turn     : null,
            moves    : []
        });
    }

    connect (clientId, res) {
        if (this.state === 'pending' && this.hostId !== clientId) {
            this.emit('error', {
                status: 401,
                message: 'Game is waiting for host to get started.'
            });
            return;
        }

        if (this.state === 'pending' && this.hostId === clientId) {
            this.state = 'started';
            this.turn = this.hostId;
            this.hostRes = res;
            this.emit('started');
            return;
        }

        if (this.state === 'new') {
            this.state = 'pending';
            this.clientId = clientId;
            this.clientRes = res;
            this.emit('connected');
        }
    }
};
