// Settings
var settings = require("../settings.json");

// Database
var mysql = require("mysql").createConnection(
    {
        host: settings.database.host,
        user: settings.database.user,
        password: settings.database.password,
        database: settings.database.database,
        charset: "utf8mb4"
    });

var lineRepository = require("../repositories/lineRepository.js")(mysql);

var test = async function () {
    let options = {
        hostName: 'localhost',
        upper: null,
        lower: null,
        count: 500
    };

    let lines = await lineRepository.getAsync(options);
    let ids = lines.map((l) => l.id);

    console.log(JSON.stringify({
        upper: Math.max(...ids),
        lower: Math.min(...ids),
        lines: lines
    }));
}

test();