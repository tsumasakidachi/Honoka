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

var hostInfoService = require('../services/hostInfoService.js')();
var factorioService = require('../services/factorioService.js')();
var lineRepository = require("../repositories/lineRepository.js")(mysql);
var echoService = require('../services/echoService.js')(lineRepository, hostInfoService, factorioService);

lineRepository.canSend = () => true
lineRepository.onSent = (text) => console.log(text);

lineRepository.receive('localhost:25565', {
    json: {},
    text: '[通常]<tsumasakidachi> factorio',
    bold: undefined,
    italic: undefined,
    underlined: undefined,
    strikethrough: undefined,
    obfuscated: undefined,
    color: undefined
});
