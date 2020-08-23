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


let revisions = [];

fs.readdir(build.log_dir, (err, files) => {
    if (err) return console.log('error reading log file names');
    revisions = files.map(x => x.split('-')[1]);
});

app.use(require('morgan')('dev'));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('home.ejs', { revisions, test: 'This is a test' });
});

app.get('/release', (req, res) => {
    if (fs.existsSync(build.release_dir + `/client-${req.rev}.zip`)) res.download(build.release_dir + `/client-${req.rev}.zip`);
    else res.send('This release is not availible');
});

app.get('/log', (req, res) => {
    if (fs.existsSync(build.log_dir + `/log-${req.rev}`)) res.download(build.log_dir + `/log-${req.rev}`);
    else res.send('This log is not availible');
});

app.post('/somehook', (req, res) => {
    build.need_build = true;
});

setInterval(() => { 
    if (build.need_build && !build.building) {
        build.do_build();
    };
 }, 5000);

const httpServer = http.createServer(app);

httpServer.listen(8080, () => {
	console.log('HTTP Server running on port 8080');
}); 