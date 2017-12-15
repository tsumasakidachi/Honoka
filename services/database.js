var mysql = require("mysql");
var settings = require("../settings.json");

var database = mysql.createConnection(
    {
        host: settings.database.host,
        user: settings.database.user,
        password: settings.database.password,
        database: settings.database.database,
        charset: "utf8mb4"
    });

database.lines = {};

database.lines.insert = function (line) {
    database.query(
        "insert into `lines` (`created_at`, `host`, `type`, `player`, `message`) values (?, ?, ?, ?, ?)",
        [line.createdAt, line.host, line.type, line.player, line.message],
        async (error, results, fields) => {
            if (error) throw error;
        });
};

database.lines.select = function (option, callback) {
    var params = [];
    var query = "select `id`, `created_at` as `createdAt`, `host`, `type`, `player`, `message` from `lines`";

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
        
        callback(error, rows, fields);
    });
}

module.exports = database;