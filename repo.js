const exec = require('await-exec');

const config = require('./config');

exports.update = async () => {
    // TODO I probably need to update the sounds as well
    return exec('svn up ..');
};

exports.revision = () => {
    return exec('svn log -l 1 ..').split('/n')[1].split(' ')[0];
};