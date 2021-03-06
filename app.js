const fs = require('fs');
const express = require('express');
const app = express();
const parseString = require('xml2js').parseString;

const config = require('./config');
const build = require('./build');

const app_dir = process.cwd();
if (!fs.existsSync('releases')) fs.mkdirSync('releases');
if (!fs.existsSync('logs')) fs.mkdirSync('logs');
build.release_dir = app_dir + '/releases';
build.log_dir = app_dir + '/logs';
process.chdir(config.source_dir);

let revision_logs, revisions = [];

let update_server_files = () => fs.readdir(build.log_dir, (err, files) => {
    if (err) return console.log('error reading log file names');
    revisions = files.map(x => x.split('-')[1]);
    let revision_numbers = revisions.map(x => parseInt(x));
    let oldest = Math.min(...revision_numbers);
    let newest = Math.max(...revision_numbers);
    
    console.log(revision_numbers);
    build.get_revision_log(oldest, newest, (err, xml) => {
        if (err) return console.log(err);
        parseString(xml, (err, data) => {
            if (err) return console.log('error parsing xml data', err);
            revision_logs = data['log']['logentry'];
        });
    });
});

update_server_files();

app.use(require('morgan')('dev'));
app.use(require('serve-favicon')(app_dir + '/favicon.ico'));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('home.ejs', { revisions, revision_logs });
});

app.get('/release', (req, res) => {
    if (fs.existsSync(build.release_dir + `/client-${req.query.rev}.zip`)) res.download(build.release_dir + `/client-${req.query.rev}.zip`);
    else res.send('This release is not availible');
});

app.get('/log', (req, res) => {
    if (fs.existsSync(build.log_dir + `/log-${req.query.rev}`)) fs.readFile(build.log_dir + `/log-${req.query.rev}`, 'utf8', (err, data) => {
        if (err) {
            res.send('This log is not availible');
            return;
        }
        res.send(data.replace(/\r?\n/g, '<br/>'));
    });
    else res.send('This log is not availible');
});

// Since I haven't figured the hooks out on sourceforge I 
// am just manually regularly checking if we are out of date.
app.get('/somehook', (req, res) => {
    build.need_build = true;
    res.send('will do a build');
});

setInterval(() => {
    update_server_files();
    if (build.need_build && !build.building) {
        build.do_build();
    };
    build.check_if_out_of_date();
}, config.check_interval);


if (config.use_https) {
    let private_key, certificate, ca, credentials;

    private_key = fs.readFileSync('C:\\Certbot\\live\\crossfire.floomby.us\\privkey.pem', 'utf8');
    certificate = fs.readFileSync('C:\\Certbot\\live\\crossfire.floomby.us\\cert.pem', 'utf8');
    ca = fs.readFileSync('C:\\Certbot\\live\\crossfire.floomby.us\\chain.pem', 'utf8');
    credentials = {
        key: private_key,
        cert: certificate,
        ca: ca,
    };

    const https_server = require('https').createServer(credentials, app);
    
    https_server.listen(config.https_port, () => {
        console.log(`HTTPS Server running on port ${config.https_port}`);
    });
    
    const redir_app = express();
    
    redir_app.get('*', (req, res) => {
        res.redirect(`https://${req.headers.host}${req.path}`);
    });

    const http_server = require('http').createServer(redir_app);
    
    http_server.listen(config.http_port, () => {
        console.log(`HTTP Server running on port ${config.http_port}`);
    });
} else {
    const http_server = require('http').createServer(app);
    
    http_server.listen(config.http_port, () => {
        console.log(`HTTP Server running on port ${config.http_port}`);
    });
}