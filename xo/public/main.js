(function(angular) {
    'use strict';


    angular.module('heroApp', ['ngWebSocket'])


        .controller('MainCtrl', function MainCtrl ($websocket, GameSrv) {
            const ws = $websocket('ws://localhost:3000');

            this.clientId = '';
            this.games = [];

            this.createGame = gameId => {
                GameSrv.create(gameId)
                    .then(response => {
                        this.clientId = response.data.hostId;
                    });
            };


            this.deleteGame = ($event, gameId) => {
                $event.preventDefault();
                GameSrv.remove(gameId);
            };


            this.startGame = ($event, gameId) => {
                $event.preventDefault();
                GameSrv.start(gameId);
            };


            GameSrv.getList()
                .then(response => {
                    this.games = response.data;
                });


            ws.onMessage(event => {
                const msg = angular.fromJson(event.data);

                if (msg.action === 'add') {
                    this.games.push({
                        gameId: msg.gameId,
                        hostId: msg.hostId
                    });
                }

                if (msg.action === 'remove') {
                    this.games = this.games.filter(g => g.gameId !== msg.gameId);
                }

                if (msg.action === 'gameStart') {
                    if (this.clientId === msg.hostId) {
                        setTimeout(() => {
                            GameSrv.start(msg.gameId);
                        }, 5000);

                    }
                }
            });
        })


        .service('GameSrv', function ($http) {
            const apiUrl = 'http://localhost:3000/games';

            this.getList = () => {
                return $http.get(apiUrl);
            };

            this.create = (gameId) => {
                return $http.post(apiUrl, { gameId });
            };

            this.remove = (gameId) => {
                return $http.delete(apiUrl, { params: { gameId } });
            };

            this.start = (gameId) => {
                return $http.post(`${apiUrl}/start`, { gameId });
            };
        });

})(window.angular);