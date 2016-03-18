
describe('logAlerts', function(){

  beforeEach(module('logApp'));
  var $controller;

   beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));

  describe('create_alert', function(){
    it('should create an alert in alerts', function(){
      var $scope = {};
      var controller = $controller('LogController', { $scope: $scope });
      $scope.threshold = 2
      var data = { 'log' : 3 }
      $scope.parseSections(data);
      expect($scope.alerts[0].alert == true);
    });
  });

  describe('recover_alert', function(){
    it('should recover an alert in alerts', function(){
      var $scope = {};
      var controller = $controller('LogController', { $scope: $scope });
      $scope.threshold = 2
      var data = { 'log' : 3 }
      $scope.parseSections(data);
      expect($scope.alerts[0].alert == true);
      $scope.threshold = 10;
      $scope.parseSections(data);
      expect($scope.alerts[1].alert == false);
    });
  });
});