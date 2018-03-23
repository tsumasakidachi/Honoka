var factorioService = function (lineRepository, hostInfoService) {
    var exec = require('child_process').exec;
    var Csv = require('comma-separated-values');
    var command = 'tasklist /fi "imagename eq factorio.server.exe" /fo csv';

    var self = this;

    self.asnwer = async (line) => {
        if (!line.body || !line.body.match(/^(factorio|ファクトリオ|ふぁくとりお)$/i)) return;

        var hostInfo = await hostInfoService.getHostInfoAsync();
        var isOnline = await self.isOnlineAsync();

        var status = isOnline ? 'オンライン' : 'オフライン';

        lineRepository.send('Factorio マルチ: ' + hostInfo.address + ' ' + status);
    };

    self.isOnlineAsync = () => {
        var p = new Promise((resolve, reject) => {
            exec(command, function (error, stdout, stderr) {
                if(error) reject(error);

                var processes = new Csv(stdout, { 'header': true }).parse();
                resolve(processes.length >= 1);
            });
        });

        return p;
    }

    lineRepository.onReceived(self.asnwer);

    return this;
}

module.exports = factorioService;