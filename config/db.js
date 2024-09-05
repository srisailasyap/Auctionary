const
    mysql = require('mysql');

let state = {
    pool: null
};

exports.connect = function(done) {
    state.pool = mysql.createPool( {
        host: null,
        user: null,
        password: null,
        database: null,
        multipleStatements: true
    });
    done();
};

exports.get_pool = function() {
    return state.pool;
};