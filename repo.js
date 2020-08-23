const exec = require('await-exec');

const config = require('./config');

exports.update = async () => {
    return exec('svn up ..');
};

exports.version = () => {
    
};

exports.log = () => {
    
};
