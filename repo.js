const exec = require('await-exec');

const config = require('./config');

exports.update = async () => {
    return exec('svn up ..');
};

exports.revision = () => {
    return exec('svn log -l 1 ..').split('/n')[1].split(' ')[0];
};

exports.log = () => {
    
};
