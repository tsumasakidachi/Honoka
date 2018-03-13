var factorioService = function () {
    var exec = require('child_process').exec;
    var Csv = require('comma-separated-values');
    var command = 'tasklist /fi "imagename eq factorio.server.exe" /fo csv';

    var self = this;

    self.isOnlineAsync = function () {
        var p = new Promise((resolve, eject) => {
            exec(command, function (err, stdout, stderr) {
                let processes = new Csv(stdout, { 'header': true }).parse();
                resolve(processes.length >= 1);
            });
        });

        return p;
    }

    return this;
}

module.exports = factorioService;