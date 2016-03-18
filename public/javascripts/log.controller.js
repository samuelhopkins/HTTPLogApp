angular.module('logApp', []).controller('LogController', function($scope, $http, $interval){
	$scope.threshold = 4;
	$scope.sections_totals = {};
	$scope.sections_two_min_totals = {};
	$scope.hits_queue = [];
	$scope.alerts = []
	$scope.alert_on = false;
	$scope.show_total = true;
	$scope.two_min_total = 0;
	$scope.total_hits = 0;

	$scope.parseSections = function(data){
		$scope.parseSectionTotals(data);
		$scope.parseTwoMinTotals(data);
	};

	$scope.checkThreshold = function(){
		var total = 0;
		$.each($scope.hits_queue, function(index, val){total += val;});
		$scope.two_min_total = total;
		if (total >= $scope.threshold && $scope.alert_on == false){
			var date = new Date();
			$scope.alerts.unshift({'alert': true, 'val' : total, 'date' : date })
			$scope.alert_on = true;
		}
		else if (total < $scope.threshold && $scope.alert_on == true){
			var date = new Date();
			$scope.alerts.unshift({'alert': false, 'val' : total, 'date' : date })
			$scope.alert_on = false;
		}

	}

	$scope.formatTwoMinWindowAverage = function(total){
		$scope.hits_queue.push(total);
		if($scope.hits_queue.length > 12){
			$scope.hits_queue.shift();
		}
		$scope.checkThreshold();
	}

	$scope.parseSectionTotals = function(data){
		var total = 0;
		$.each(data, function(key,val){
			if ($scope.sections_totals[key] !== undefined){
				$scope.sections_totals[key] += parseInt(val, 10);
			}
			else{
				$scope.sections_totals[key] = parseInt(val, 10)
			}
			total += parseInt(val, 10);
		});
		$scope.total_hits += total;
		$scope.formatTwoMinWindowAverage(total);
	};


	$scope.parseTwoMinTotals = function(data){
		$.each($scope.sections_two_min_totals, function(key, val){
			if(data[key] === undefined){
				$scope.sections_two_min_totals[key].push(0);
			}else{
				$scope.sections_two_min_totals[key].push(data[key]);
			}
		});
		$.each(data, function(key, val){
			if($scope.sections_two_min_totals[key] === undefined){
				$scope.sections_two_min_totals[key] = [val];
			}
		});

		$.each($scope.sections_two_min_totals, function(key, val){
			if($scope.sections_two_min_totals[key].length > 12){
				$scope.sections_two_min_totals[key].shift();
			};
		});
	};

	$scope.getLogData = function(){
		var data = { count : $scope.time};
		var config = { params: data };
		var url = 'logs/'+ $scope.time.toString();
		$http.get(url).success(function(data, status){
			$scope.time += 10;
			console.log(data);
			$scope.parseSections(data);
			$scope.chart();
		}).error(function(data, status){
			console.log('error');
		});
	};

	$scope.initServerTime = function(){
		$http.get('init').success(function(data, status){
			$scope.time = parseInt(data, 10);
			$scope.getLogData();
			$scope.chart = $scope.renderRequestTotals;
			$scope.chart();
			$scope.logCallInterval = $interval($scope.getLogData , 10000);
				}).error(function(data, status){
					console.log('init failed');
				});
		};

	$scope.chartText;
	$scope.chartCategories;
	$scope.chartYAxisText;
	$scope.chartSeriesName;
	$scope.chartData;

	$scope.renderTwoMinTotals = function(){
		$scope.chartText="Two Minute Window Request Total"
		var keys = [];
		var data = [];
		 $.each($scope.sections_two_min_totals, function(key, val){
			var total = 0;
			$.each(val, function(i, num){
				total += Number(num);
			});
			if(total > 0){
				keys.push(key)
				data.push(total);
			}
		});
		$scope.chartCategories = keys;
		$scope.chartYAxisText = "Total Request From Past 2 Min For Section"
		$scope.chartSeriesName = "requests"
		$scope.chartData = data;
		$scope.renderChart();
	}

	$scope.renderRequestTotals = function(){
		$scope.chartText="Total Hits By Section"
		var keys = [];
		var data = [];
		$.each($scope.sections_totals, function(key, val){
			keys.push(key);
			data.push(val);
		});
		$scope.chartCategories = keys;
		$scope.chartYAxisText = "Total Requests"
		$scope.chartSeriesName = "requests"
		$scope.chartData = data;
		$scope.renderChart();
	}

	$scope.renderChart = function () {
	    $('#container').highcharts({
	        chart: {
	            type: 'column'
	        },
	        title: {
	            text: $scope.chartText
	        },
	        xAxis: {
	            categories: $scope.chartCategories,
	            title: {
	                text: null
	            }
	        },
	        yAxis: {
	            min: 0,
	            title: {
	                text: $scope.chartYAxisText,
	                align: 'high'
	            },
	            labels: {
	                overflow: 'justify'
	            }
	        },
	        plotOptions: {
	            column: {
	                dataLabels: {
	                    enabled: true
	                }
	            }
	        },
	        legend: {
	            layout: 'vertical',
	            align: 'right',
	            verticalAlign: 'top',
	            x: -40,
	            y: 80,
	            floating: true,
	            borderWidth: 1,
	            backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
	            shadow: true
	        },
	        credits: {
	            enabled: false
	        },
	        series: [{
	        	name: $scope.chartSeriesName,
	            data: $scope.chartData
	 			}]
	    });
	};


	$scope.initServerTime();

});