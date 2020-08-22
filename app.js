const fs = require('fs');
const http = require('http');
const express = require('express');
const app = express();

const config = require('./config');
const app_dir = process.cwd();
process.chdir(config.source_dir);

const build = require('./build');
build.do_build();
console.log(build.build_log);
// process.exit();

app.use(require('morgan')('dev'));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.send(build.build_log.replace(/\n/g, '<br>'));
});

app.get('/download', (req, res) => {
    if (fs.existsSync(config.source_dir + `/build/${config.archive_name}`)) res.download(config.source_dir + `/build/${config.archive_name}`);
    else res.send('The download is not availible');
});

// The latest build that built sucessfully
app.get('/latest_release', (req, res) => {
    
});

// The latest build, regardless of wheather 
app.get('/latest', (req, res) => {

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