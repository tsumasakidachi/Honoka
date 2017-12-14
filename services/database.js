var mysql = require("mysql");
var settings = require("../settings.json");

var database = mysql.createConnection(
    {
        host: settings.database.host,
        user: settings.database.user,
        password: settings.database.password,
        database: settings.database.database
    });

database.lines = {};

database.lines.insert = function (line) {
    database.query(
        "insert into `lines` (`created_at`, `host`, `type`, `player`, `body`) values (?, ?, ?, ?, ?)",
        [line.createdAt, line.host, line.type, line.player, line.body],
        async (error, results, fields) => {
            if (error) throw error;
        });
};

database.lines.select = function (option, callback) {
    var params = [];
    var query = "select `id`, `created_at` as `createdAt`, `host`, `type`, `player`, `body` from `lines`";

    query += " where `host` = ?";
    params.push(option.host);

    if ("since" in option) {
        query += " and `id` > ?";
        params.push(option.since);
    }

    if ("type" in option) {

    }

    query += " order by `id`";

    database.query(query, params, (error, rows, fields) => {
        if(error) throw error;
        
        rows.forEach((r) => {
            r.createdAt = new Date(r.createdAt);
        })
        callback(error, rows, fields);
    });
}

module.exports = database;