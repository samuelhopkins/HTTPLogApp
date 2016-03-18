var express = require('express');
var router = express.Router();
var fs = require('fs');
var NginxParser = require('nginxparser');

router.get('/:time', function(req, res, next) {
	parseLog(req.params.time, res);
});


parser = new NginxParser('$remote_addr - $remote_user [$time_local] '
        + '"$request" $status $body_bytes_sent "$http_referer" "$http_user_agent"');

var skip = ['javascripts', 'stylesheets', 'init'];

function parseLog(count, res){
	var request_counter = {};
	parser.read('access.log', function (row) {
    time_split = row.time_local.split(" ")[0].split(':');
    time = Number(time_split[3]) + Number(time_split[2]) * 60 + Number(time_split[1]) * 3600;

    if (time >= (count - 10) && time < count){
    	request_split = row.request.split(" ")[1].split('/');
    	if (request_split.length > 1){
    		var section = request_split[1];
    		if (section != "" && !(skip.indexOf(section) > -1 )){
    		request_counter[section] = (request_counter[section] || 0) + 1;
    		}
    	}
    }

	},
	function (err) {
    	if (err) throw err;
    	res.send(request_counter);
		});
	};


module.exports = router;
