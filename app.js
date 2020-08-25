const fs = require('fs');
const http = require('http');
const express = require('express');
const app = express();

const config = require('./config');
const build = require('./build');
const app_dir = process.cwd();
if (!fs.existsSync('releases')) fs.mkdirSync('releases');
if (!fs.existsSync('logs')) fs.mkdirSync('logs');
build.release_dir = app_dir + '/releases';
build.log_dir = app_dir + '/logs';
process.chdir(config.source_dir);


build.revisions = [];

fs.readdir(build.log_dir, (err, files) => {
    if (err) return console.log('error reading log file names');
    build.revisions = files.map(x => x.split('-')[1]);
});

app.use(require('morgan')('dev'));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('home.ejs', { revisions: build.revisions });
});

app.get('/release', (req, res) => {
    if (fs.existsSync(build.release_dir + `/client-${req.query.rev}.zip`)) res.download(build.release_dir + `/client-${req.query.rev}.zip`);
    else res.send('This release is not availible');
});

app.get('/log', (req, res) => {
    if (fs.existsSync(build.log_dir + `/log-${req.query.rev}`)) res.download(build.log_dir + `/log-${req.query.rev}`);
    else res.send('This log is not availible');
});

app.get('/somehook', (req, res) => {
    build.need_build = true;
    res.send('will do a build');
});

setInterval(() => { 
    if (build.need_build && !build.building) {
        build.do_build();
    };
 }, 5000);

const httpServer = http.createServer(app);

httpServer.listen(config.port, () => {
	console.log(`HTTP Server running on port ${config.port}`);
}); 