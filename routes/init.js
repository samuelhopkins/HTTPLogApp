var express = require('express');
var router = express.Router();
var fs = require('fs');
var times = [];

router.get('/', function(req, res, next) {
    getTime(res);
});


var NginxParser = require('nginxparser');

parser = new NginxParser('$remote_addr - $remote_user [$time_local] '
        + '"$request" $status $body_bytes_sent "$http_referer" "$http_user_agent"');


function getTime(res){
    var time;
	parser.read('access.log', function (row) {
    time_split = row.time_local.split(" ")[0].split(':');
    times.push(Number(time_split[3]) + Number(time_split[2]) * 60 + Number(time_split[1]) * 3600);
    }, function (err) {
        if (err) throw err;
        res.send(times[times.length - 1].toString());
    });
    };


module.exports = router;
