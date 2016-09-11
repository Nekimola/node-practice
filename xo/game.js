const EventEmitter = require('events');

module.exports = class Game extends EventEmitter {
    constructor (options) {
        super();

        Object.assign(this, options, {
            state    : 'new',
            clientId : null,
            clientRes: null,
            hostRes  : null,
            turn     : null,
            moves    : []
        });
    }

    start (clientId, res) {
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

            const gameInfo = {
                gameId: this.gameId,
                hostId: this.hostId,
                clientId: this.clientId
            };

            this.hostRes.json(Object.assign(gameInfo, {
                turn: true
            }));
            this.clientRes.json(Object.assign(gameInfo, {
                turn: false
            }));

            return;
        }

        if (this.state === 'new') {
            this.state = 'pending';
            this.clientId = clientId;
            this.clientRes = res;
            this.emit('connected');
        }
    }

    move (move, clientId) {
        if (this.moves.indexOf(move) !== -1) {
            this.emit('error', {
                status: 400,
                message: 'You can\'t move here.'
            });
            return;
        }

        if (clientId !== this.turn) {
            this.emit('error', {
                status: 400,
                message: 'It\'s not your turn.'
            });
            return;
        }

        this.moves.push(move);
        this.turn = clientId === this.clientId ? this.hostId : this.clientId;
        this.emit('move', { move });
    }
};
