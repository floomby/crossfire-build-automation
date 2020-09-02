const ms = require('ms');

exports.source_dir = 'D:\\crossfire-code\\client\\trunk\\';
//exports.source_dir = 'C:\\msys32\\home\\Josh\\crossfire-code\\client\\trunk\\';

exports.http_port = 8080;
exports.https_port = 8443;

exports.check_interval = ms('5m'); 

exports.use_https = false;
