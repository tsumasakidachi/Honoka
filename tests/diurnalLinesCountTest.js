var test = async function()
{
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
    var counts = await lineRepository.countDiurnalAsync();
    console.log(JSON.stringify(counts));
}

test();