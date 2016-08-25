(function(angular) {
    'use strict';


    angular.module('heroApp', ['ngWebSocket'])


        .controller('MainCtrl', function MainCtrl ($http, $websocket) {
            const apiUrl = 'http://localhost:3000/games';
            const ws = $websocket('ws://localhost:3000');

            this.games = [];

            this.createGame = gameId => {
                $http.post(apiUrl, { gameId })
                    .then(response => {
                        console.log(response.data);
                    });
            };

            this.deleteGame = ($event, gameId) => {
                $event.preventDefault();
                $http.delete(apiUrl, { params: { gameId } });
            };


            $http.get(apiUrl)
                .then(response => {
                    this.games = response.data;
                });

            ws.onMessage(event => {
                const msg = angular.fromJson(event.data);

                if (msg.action === 'add') {
                    this.games.push({
                        gameId: msg.gameId
                    });
                }

                if (msg.action === 'remove') {
                    this.games = this.games.filter(g => g.gameId !== msg.gameId);
                }
            });
        });


})(window.angular);