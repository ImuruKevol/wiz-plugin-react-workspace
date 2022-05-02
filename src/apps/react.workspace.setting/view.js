let wiz_controller = async ($sce, $scope, $timeout) => {
    _builder($scope, $timeout);
    $scope.monaco_properties = $scope.monaco("python");
}