angular.module('app').controller('tipsController', function ($scope, $rootScope, $routeParams, $http, $location) {


    if ($rootScope.summoner === undefined) {
        $location.path("/");
    }

    $scope.tips = [];

    $scope.matchId = $routeParams.idMatch
    $scope.summoner = $rootScope.summoner;
    $scope.summonerLevel = $rootScope.summonerLevel;
    $scope.profileIcon = $rootScope.profileIcon
    $scope.loading = true;

    //Metrics
    $scope.metrics = {}
    $scope.metrics.ruim = {'name':'ruim', 'color':'red', 'icon':'fa fa-exclamation'}
    $scope.metrics.ok = {'name':'ok', 'color':'yellow', 'icon':'fa fa-check'}
    $scope.metrics.otimo = {'name':'otimo', 'color':'green', 'icon':'fa fa-check'}
    $scope.metrics.perfeito = {'name':'perfeito', 'color':'blue', 'icon':'fa fa-check'}

    //Tips para mostrar na view
    $scope.viewFarmTips = []
    $scope.viewKdaTips = []
    $scope.viewTimeLiveTips = []

    $scope.showTipsFarm = false
    $scope.showTipsTime = false
    $scope.showTipsKda = false

    //Get Match
    $http.get("https://intense-waters-52899.herokuapp.com/match/" + $scope.matchId)
        .then(function (response) {
            $scope.loading = false;
            $scope.match = response.data;
            $scope.match.participantIdentities.forEach(function (participant) {
                if ($scope.summoner !== undefined && participant.player.summonerName.toUpperCase().replace(/\s/g, "") == $scope.summoner.toUpperCase().replace(/\s/g, "")) {
                    $scope.participantId = participant.participantId
                }
            })
            $scope.gameMode = $scope.match.gameMode
            $scope.participant = $scope.match.participants[$scope.participantId - 1]
            if($scope.participant !== undefined) {
                $scope.longestTimeSpentLiving = $scope.participant.stats.longestTimeSpentLiving
                $scope.creepRatio = calcularCreepRatio($scope.participant.timeline.creepsPerMinDeltas)
                $scope.win = $scope.participant.stats.win
                $scope.largestKillingSpree = $scope.participant.stats.largestKillingSpree
            }
            $scope.longestTimeSpentLiving = calcularTempoEmMinSeg($scope.participant.stats.longestTimeSpentLiving)
            $scope.creepRatio = calcularCreepRatio($scope.participant.timeline.creepsPerMinDeltas)
            $scope.win = $scope.participant.stats.win
            $scope.largestKillingSpree = $scope.participant.stats.largestKillingSpree
            $scope.assists = $scope.participant.stats.assists
            $scope.kills = $scope.participant.stats.kills
            $scope.deaths = $scope.participant.stats.deaths

            $scope.kda = Number(($scope.kills + $scope.assists)/$scope.deaths).toFixed(2)

            //Metricas calculadas
            $scope.metricFarm = $scope.calculateMetricFarm($scope.creepRatio);
            $scope.metricKda = $scope.calculateMetricKda($scope.kills, $scope.assists, $scope.deaths);
            $scope.metricTimeLiving = $scope.calculateMetricTimeLiving();


            setTips()
        })

    /**
     * Define tips de acordo com as metricas calculadas
     */
    function setTips() {
        $http.get("tips.json")
            .then(function (response) {
                $scope.tips = response.data.tips;

                $scope.viewFarmTips = $scope.tips['farm'][$scope.metricFarm.name];
                $scope.viewKdaTips = $scope.tips['kda'][$scope.metricKda.name];
                $scope.viewTimeLiveTips = $scope.tips['time']["ok"];
            });
    }



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
    $scope.calculateMetricFarm = function (media) {
        if(media <= 6){
            return $scope.metrics.ruim;
        }
        if(media <= 10){
            return $scope.metrics.ok;
        }
        if(media > 12) {
            return $scope.metrics.perfeito;
        }
        if(media > 10){
            return $scope.metrics.otimo;
        }
    }

    /**
     * 1- ruim = morrer
     * 2- levar dano e sobreviver = bom
     * 3- não levou dano = ok
     */
    $scope.calculateMetricTimeLiving = function () {
        return $scope.metrics.ok;
    }

    /**
     * perfeito kill 0
     * otimo = > 5
     * ok = 1 - 3
     * ruim <= 1
     */
    $scope.calculateMetricKda = function (kills, assists, deaths) {
        if(deaths==0 && kills==0 && assists==0){
            return $scope.metrics.ok;
        }
        if(deaths == 0 && (kills+assists>=3)){
            return $scope.metrics.perfeito;
        }
        if(deaths == 0 && (kills+assists>=2)){
            return $scope.metrics.otimo;
        }
        if(deaths == 0){
            return $scope.metrics.bom;
        }
        var media = (kills + assists)/deaths

        if(media >= 10){
            return $scope.metrics.otimo;
        }if(media > 1 && media < 10){
            return $scope.metrics.ok;
        }if(media <= 1){
            return $scope.metrics.ruim;
        }
    }

    function calcularTempoEmMinSeg(tempo) {
        var minutos = Math.floor(tempo/60)
        var segundos = tempo%60
        return minutos+" min e "+segundos+" seg"
    }

    $scope.setKda = function(){
      if($scope.showTipsKda){
        $scope.showTipsKda = false;
      }
      else{
        $scope.showTipsKda = true
      }
    }

    $scope.setTime = function(){
      if($scope.showTipsTime){
        $scope.showTipsTime = false;
        return false
      }
      $scope.showTipsTime = true
      return true
    }

    $scope.setFarm = function(){
      if($scope.showTipsFarm){
        $scope.showTipsFarm = false;
        return false
      }
      $scope.showTipsFarm = true
      return true
    }
});
