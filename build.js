const fs = require('fs');
const ncp = require('ncp').ncp;
const async = require('async');
const child_process = require('child_process');
var archiver = require('archiver');

const config = require('./config');

exports.build_log = '';
exports.release_dir = '';
exports.log_dir = '';
exports.revisions = [];

const verbose = true;

const release_files = [
    ['bin/crossfire-client-gtk2.exe', 'release/crossfire-client-gtk2.exe'],
    ['bin/cfsndserv.exe', 'release/cfsndserv.exe'],
    ['share', 'release/share'],
    ['C:\\msys32\\mingw32\\share\\themes', 'release/share/themes'],
    ['C:\\msys32\\mingw32\\bin\\libatk-1.0-0.dll', 'release/libatk-1.0-0.dll'],
    ['C:\\msys32\\mingw32\\bin\\libbrotlicommon.dll', 'release/libbrotlicommon.dll'],
    ['C:\\msys32\\mingw32\\bin\\libbrotlidec.dll', 'release/libbrotlidec.dll'],
    ['C:\\msys32\\mingw32\\bin\\libbz2-1.dll', 'release/libbz2-1.dll'],
    ['C:\\msys32\\mingw32\\bin\\libcairo-2.dll', 'release/libcairo-2.dll'],
    ['C:\\msys32\\mingw32\\bin\\libcrypto-1_1.dll', 'release/libcrypto-1_1.dll'],
    ['C:\\msys32\\mingw32\\bin\\libcurl-4.dll', 'release/libcurl-4.dll'],
    ['C:\\msys32\\mingw32\\bin\\libdatrie-1.dll', 'release/libdatrie-1.dll'],
    ['C:\\msys32\\mingw32\\bin\\libexpat-1.dll', 'release/libexpat-1.dll'],
    ['C:\\msys32\\mingw32\\bin\\libffi-7.dll', 'release/libffi-7.dll'],
    ['C:\\msys32\\mingw32\\bin\\libfontconfig-1.dll', 'release/libfontconfig-1.dll'],
    ['C:\\msys32\\mingw32\\bin\\libfreetype-6.dll', 'release/libfreetype-6.dll'],
    ['C:\\msys32\\mingw32\\bin\\libfribidi-0.dll', 'release/libfribidi-0.dll'],
    ['C:\\msys32\\mingw32\\bin\\libgcc_s_dw2-1.dll', 'release/libgcc_s_dw2-1.dll'],
    ['C:\\msys32\\mingw32\\bin\\libgdk_pixbuf-2.0-0.dll', 'release/libgdk_pixbuf-2.0-0.dll'],
    ['C:\\msys32\\mingw32\\bin\\libgdk-win32-2.0-0.dll', 'release/libgdk-win32-2.0-0.dll'],
    ['C:\\msys32\\mingw32\\bin\\libgio-2.0-0.dll', 'release/libgio-2.0-0.dll'],
    ['C:\\msys32\\mingw32\\bin\\libglib-2.0-0.dll', 'release/libglib-2.0-0.dll'],
    ['C:\\msys32\\mingw32\\bin\\libgmodule-2.0-0.dll', 'release/libgmodule-2.0-0.dll'],
    ['C:\\msys32\\mingw32\\bin\\libgobject-2.0-0.dll', 'release/libgobject-2.0-0.dll'],
    ['C:\\msys32\\mingw32\\bin\\libgraphite2.dll', 'release/libgraphite2.dll'],
    ['C:\\msys32\\mingw32\\bin\\libgtk-win32-2.0-0.dll', 'release/libgtk-win32-2.0-0.dll'],
    ['C:\\msys32\\mingw32\\bin\\libharfbuzz-0.dll', 'release/libharfbuzz-0.dll'],
    ['C:\\msys32\\mingw32\\bin\\libiconv-2.dll', 'release/libiconv-2.dll'],
    ['C:\\msys32\\mingw32\\bin\\libidn2-0.dll', 'release/libidn2-0.dll'],
    ['C:\\msys32\\mingw32\\bin\\libintl-8.dll', 'release/libintl-8.dll'],
    ['C:\\msys32\\mingw32\\bin\\libnghttp2-14.dll', 'release/libnghttp2-14.dll'],
    ['C:\\msys32\\mingw32\\bin\\libpango-1.0-0.dll', 'release/libpango-1.0-0.dll'],
    ['C:\\msys32\\mingw32\\bin\\libpangocairo-1.0-0.dll', 'release/libpangocairo-1.0-0.dll'],
    ['C:\\msys32\\mingw32\\bin\\libpangoft2-1.0-0.dll', 'release/libpangoft2-1.0-0.dll'],
    ['C:\\msys32\\mingw32\\bin\\libpangowin32-1.0-0.dll', 'release/libpangowin32-1.0-0.dll'],
    ['C:\\msys32\\mingw32\\bin\\libpcre-1.dll', 'release/libpcre-1.dll'],
    ['C:\\msys32\\mingw32\\bin\\libpixman-1-0.dll', 'release/libpixman-1-0.dll'],
    ['C:\\msys32\\mingw32\\bin\\libpng16-16.dll', 'release/libpng16-16.dll'],
    ['C:\\msys32\\mingw32\\bin\\libpsl-5.dll', 'release/libpsl-5.dll'],
    ['C:\\msys32\\mingw32\\bin\\libssh2-1.dll', 'release/libssh2-1.dll'],
    ['C:\\msys32\\mingw32\\bin\\libssl-1_1.dll', 'release/libssl-1_1.dll'],
    ['C:\\msys32\\mingw32\\bin\\libstdc++-6.dll', 'release/libstdc++-6.dll'],
    ['C:\\msys32\\mingw32\\bin\\libthai-0.dll', 'release/libthai-0.dll'],
    ['C:\\msys32\\mingw32\\bin\\libunistring-2.dll', 'release/libunistring-2.dll'],
    ['C:\\msys32\\mingw32\\bin\\libwinpthread-1.dll', 'release/libwinpthread-1.dll'],
    ['C:\\msys32\\mingw32\\bin\\SDL.dll', 'release/SDL.dll'],
    ['C:\\msys32\\mingw32\\bin\\zlib1.dll', 'release/zlib1.dll'],
    ['C:\\msys32\\mingw32\\lib\\gdk-pixbuf-2.0', 'release/lib/gdk-pixbuf-2.0'],
    ['C:\\msys32\\mingw32\\lib\\gtk-2.0', 'release/lib/gtk-2.0'],
];

let abort_build = err => {
    if (verbose) console.log('Build aborting', err);
    this.build_log += `There was an error with the build (${err})\n`;
    fs.writeFile(this.log_dir + '/log-' + building_rev, this.build_log, err => {
        if (err) return console.log('unable to write log');
    });
    this.building = false;
};

let async_cp = (dir, done) => {
    let a = dir[1].split('/');
    for(let i = 0; i < a.length - 1; i++) {
        try {
            // sorry for the random syncronous code here
            if (!fs.existsSync(a.slice(0, i + 1).join('/'))) {
                this.build_log += `creating directory ${a.slice(0, i + 1).join('/')}`;
                if (verbose) console.log(`creating directory ${a.slice(0, i + 1).join('/')}`);
                fs.mkdirSync(a.slice(0, i + 1).join('/'));
            }
        } catch {}
    }
    ncp(dir[0], dir[1], err => {
        this.build_log += `copying from ${dir[0]} to ${dir[1]}\n`;
        if (verbose) console.log(`copying from ${dir[0]} to ${dir[1]}`);
        if (err) return abort_build(err);
        done();
    });
}

archive = archiver('zip');

archive.on('error', err => {
    this.build_log += `Unable to create archive (${err})\n`;
    throw err;
});

exports.building = false;
exports.need_build = false;
let building_rev;

exports.make_release = () => {
    // TODO write something in the log that indicates we are making an archive
    fs.mkdirSync('release');
    async.each(release_files, async_cp, err => {
        if (err) return abort_build(err);
        const ostream = fs.createWriteStream(`${this.release_dir}\\client-${building_rev}.zip`);
        archive.pipe(ostream);
        archive.directory(config.source_dir + '/build/release', false);
        archive.finalize();
        console.log(this.release_dir);
        fs.writeFile(this.log_dir + '/log-' + building_rev, this.build_log, err => {
            if (err) return console.log('unable to write log');
        });
        this.revisions.push(building_rev);
        this.building = false;
        console.log('build completed');
    });
};

exports.do_cmake = async () => {
    // await repo.update();
    if (fs.existsSync('build')) fs.rmdirSync('build', { recursive: true });
    fs.mkdirSync('build');
    process.chdir('build');
    const child = child_process.exec('cmake -G "MinGW Makefiles" ..');
    child.stdout.on('data', data => {
        if (verbose) process.stdout.write(data);
        this.build_log += data;
    });
    child.stderr.on('data', data => {
        if (verbose) process.stdout.write(data);
        this.build_log += data;
    });
    child.on('exit', code => {
        if (code) return abort_build('There was an error with the build\n');
        const child = child_process.exec('mingw32-make');
        child.stdout.on('data', data => {
            if (verbose) process.stdout.write(data);
            this.build_log += data;
        });
        child.stderr.on('data', data => {
            if (verbose) process.stdout.write(data);
            this.build_log += data;
        });
        child.on('exit', code => {
            if (code) return abort_build('There was an error with the build\n');
            const child = child_process.exec('mingw32-make install');
            child.stdout.on('data', data => {
                if (verbose) process.stdout.write(data);
                this.build_log += data;
            });
            child.stderr.on('data', data => {
                if (verbose) process.stdout.write(data);
                this.build_log += data;
            });
            child.on('exit', code => {
                if (code) abort_build('There was an error with the build\n');
                this.make_release();
            });
        });
    });
};

exports.do_build = async () => {
    process.chdir(config.source_dir);
    this.building = true;
    this.need_build = false;
    this.build_log = '';
    console.log('doing build');
    let svn_output = '';
    const child = child_process.exec('svn up ..');
    child.stdout.on('data', data => {
        if (verbose) process.stdout.write(data);
        svn_output += data;
    });
    child.stderr.on('data', data => {
        if (verbose) process.stdout.write(data);
        svn_output += data;
    });
    child.on('exit', code => {
        if (code) abort_build('There was an svn error\n');
        building_rev = /(\d{5,})/g.exec(svn_output)[0];
        this.do_cmake();
    });
};