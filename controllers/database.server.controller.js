const
    Database = require('../models/database.server.model'),
    fs = require("fs");

exports.resetDB = function(req, res) {
    try {
        let schema = fs.readFileSync('./DB_schema.sql', 'utf-8').toString();

        Database.reset(schema, function (result) {
            if (result.err) {
                res.status(result.status).send(result.err);
            } else {
            res.status(200).send("OK");
            }
        });
    } catch (err) {
        res.status(500).send("Internal server error");
    }
};

exports.resampleDB = function(req, res) {
    try {
        let setup = fs.readFileSync('./DB_data.sql', 'utf-8').toString();

        Database.resample(setup, function (result) {
            if (result.err) {
                res.status(result.status).send(result.err);
            } else {
                res.status(201).send("Sample of data has been reloaded.");
            }
        });
    } catch (err) {
        res.status(500).send("Internal server error");
    }
};