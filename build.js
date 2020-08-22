const fs = require('fs');
const ncp = require('ncp').ncp;
const async = require('async');
const child_process = require('child_process');
var archiver = require('archiver');

const config = require('./config');
const repo = require('./repo');

exports.build_log = '';

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
    ['C:\\msys32\\mingw32\\lib\\gdk-pixbuf-2.0',
        'release/lib/gdk-pixbuf-2.0'],
    ['C:\\msys32\\mingw32\\lib\\gtk-2.0',
        'release/lib/gtk-2.0'],
];

let async_cp = (dir, done) => {
    let a = dir[1].split('/');
    for(let i = 0; i < a.length - 1; i++) {
        try {
            // sorry for the random syncronous code here
            console.log('making dir:', a.slice(0, i + 1).join('/'));
            if (!fs.existsSync(a.slice(0, i + 1).join('/'))) fs.mkdirSync(a.slice(0, i + 1).join('/'));
        } catch {}
    }
    ncp(dir[0], dir[1], function (err) {
        if (err) {
            exports.build_log += `There was an error copying files (${err})\n`;
            // return done(err);
        } 
        done();
    });
}

archive = archiver('zip');

archive.on('error', err => {
    console.log('unable to zip file');
    throw err;
});

exports.make_release = () => {
    // TODO write something in the log that indicates we are making an archive
    fs.mkdirSync('release');
    async.each(release_files, async_cp, err => {
        if (err) {
            console.log('there was an error copying files', err);
            this.building = false;
            return;
        }
        const ostream = fs.createWriteStream(config.archive_name);
        archive.pipe(ostream);
        archive.directory(config.source_dir + '/build/release', false);
        archive.finalize();
        console.log('build completed');
        this.building = false;
    });
};

exports.building = false;
exports.need_build = false;

exports.do_build = update => {
    exports.build_log = '';
    this.building = true;
    this.need_build = false;
    if (update) {
        await repo.update();
        return;
    }
    if (fs.existsSync('build')) fs.rmdirSync('build', { recursive: true });
    fs.mkdirSync('build');
    process.chdir('build');
    // exports.build_log += `>>>>> cd ${config.source_dir}build\n`;
    const child = child_process.exec('cmake -G "MinGW Makefiles" ..');
    child.stdout.on('data', data => {
        exports.build_log += data;
    });
    child.stderr.on('data', data => {
        exports.build_log += data;
    });
    child.on('exit', code => {
        if (code) {
            exports.build_log += 'There was an error with the build\n';
            this.building = false;
            return;
        }
        const child = child_process.exec('mingw32-make');
        child.stdout.on('data', data => {
            exports.build_log += data;
        });
        child.stderr.on('data', data => {
            exports.build_log += data;
        });
        child.on('exit', code => {
            if (code) {
                exports.build_log += 'There was an error with the build\n';
                this.building = false;
                return;
            }
            const child = child_process.exec('mingw32-make install');
            child.stdout.on('data', data => {
                exports.build_log += data;
            });
            child.stderr.on('data', data => {
                exports.build_log += data;
            });
            child.on('exit', code => {
                if (code) {
                    exports.build_log += 'There was an error with the build\n';
                    this.building = false;
                    return;
                }
                this.make_release();
            });
        });
    });
};