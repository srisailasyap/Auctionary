const
    db = require('../config/db');

exports.reset = function(schema, done) {
    try {
        db.get_pool().query(schema, function (err, result) {
            if (result === undefined) return done({err: "Internal server error", status: 500});
            if (err) return done({err: "Bad request.", status: 400});
            done(result);
        });
    } catch (err) {
        done({err: "Internal server error", status: 500});
    }
};

exports.resample = function(setup, done) {
    try {
        db.get_pool().query(setup, function (err, result) {
            if (result === undefined) return done({err: "Internal server error", status: 500});
            if (err) return done({err: "Bad request.", status: 400});
            done(result);
        });
    } catch (err) {
        done({err: "Internal server error", status: 500});
    }
};