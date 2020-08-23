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
build.release_dir = app_dir + '/logs';
process.chdir(config.source_dir);


let revisions = ['r<something>', 'something else']; // TODO Populate this with the past builds that we have done 

app.use(require('morgan')('dev'));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('home.ejs', { revisions, test: 'This is a test' });
});

// app.get('/latest', (req, res) => {
//     if (fs.existsSync(config.source_dir + `/build/${config.archive_name}`)) res.download(config.source_dir + `/build/${config.archive_name}`);
//     else res.send('The download is not availible');
// });

// The latest build that built sucessfully
app.get('/release', (req, res) => {
    if (fs.existsSync(config.source_dir + `/build/${config.archive_name}`)) res.download(config.source_dir + `/build/${config.archive_name}`);
    else res.send('The download is not availible');
});

// The latest build, regardless of wheather
app.get('/log', (req, res) => {
    // req.rev
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