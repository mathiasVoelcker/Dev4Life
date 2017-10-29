angular.module('app').controller('tipsController', function ($scope, $rootScope, $routeParams, $http, $location) {

    if ($rootScope.summoner === undefined) {
        //$location.path("/");
    }

    $scope.matchId = $routeParams.idMatch
    $scope.summoner = $rootScope.summoner;
    $scope.loading = true;
    $scope.metrics = {}
    $scope.metrics.ruim = {'name':'ruim', 'color':'red', 'icon':'fa fa-exclamation'}
    $scope.metrics.ok = {'name':'ok', 'color':'yellow', 'icon':'fa fa-check'}
    $scope.metrics.otimo = {'name':'otimo', 'color':'green', 'icon':'fa fa-check'}
    $scope.metrics.perfeito = {'name':'perfeito', 'color':'blue', 'icon':'fa fa-check'}

    //Get Match
    $http.get("http://localhost:4040/match/" + $scope.matchId)
        .then(function (response) {
            $scope.loading = false;
            $scope.match = response.data;
            $scope.match.participantIdentities.forEach(function (participant) {
                /*console.log("api name: " + participant.player.summonerName)
                console.log("this name: " + $scope.summoner)*/
                if ($scope.summoner !== undefined && participant.player.summonerName.toUpperCase().replace(/\s/g, "") == $scope.summoner.toUpperCase()) {
                    $scope.participantId = participant.participantId
                }
            })
            $scope.gameMode = $scope.match.gameMode
            $scope.participant = $scope.match.participants[$scope.participantId - 1]
            $scope.longestTimeSpentLiving = $scope.participant.stats.longestTimeSpentLiving
            $scope.creepRatio = calcularCreepRatio($scope.participant.timeline.creepsPerMinDeltas
            )
            $scope.win = $scope.participant.stats.win
            $scope.largestKillingSpree = $scope.participant.stats.largestKillingSpree
        })

    // $scope.setLongestTimeSpentLiving = function(){
    //   var longestTimeSpentLiving
    //   return longestTimeSpentLiving
    // }

    //Get tips
    /*$http.get("tips.json")
        .then(function (response) {
            console.log(response.data);
        })*/


    function calcularCreepRatio(creepHash) {
        var creepRatio = 0;
        for (var creepKey in creepHash) {
            creepRatio = creepRatio + creepHash[creepKey];
        }
        creepRatio = Number(creepRatio / 4).toFixed(2)
        return creepRatio
    }

    /**
     * > 10 otimo,
     * <= 10 ok
     * <= 6 ruim
     * > 12 perfeito
     *
     * @param media
     */
    $scope.metricFarm = function (media) {
        if(media <= 6){
            return "ruim";
        }
        if(media <= 10){
            return "ok"
        }
        if(media > 12) {
            return "perfeito"
        }
        if(media > 10){
            return "otimo"
        }
    }

    /**
     * 1- ruim = morrer
     * 2- levar dano e sobreviver = bom
     * 3- não levou dano = ok
     */
    $scope.metricTower = function (media) {
        if(media == 1){
            return "ruim"
        }else if(media == 2){
            return "otimo"
        }else{
            return "ok"
        }
    }

    /**
     * perfeito kill 0
     * otimo = > 5
     * ok = 1 - 3
     * ruim <= 1
     */
    $scope.metricKda = function (media) {
        if(media == 0){
            return "perfeito"
        }else if(media >= 5){
            return "otimo"
        }else if(media > 1 && media <= 3){
            return "ok"
        }else if(media <= 1){
            return "ruim"
        }
    }


});
