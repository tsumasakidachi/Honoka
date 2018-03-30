var factorioService = function (lineRepository, hostInfoService) {
    var exec = require('child_process').exec;
    var Csv = require('comma-separated-values');
    var command = 'netstat -aon | find "34197"';
    var addressCache = '';

    var self = this;

    self.asnwer = async (line) => {
        if (!line.body || !line.body.match(/^(factorio|ファクトリオ|ふぁくとりお)$/i)) return;

        if(!addressCache)
        {
            let hostInfo = await hostInfoService.getHostInfoAsync();
            addressCache = hostInfo.address;
        }

        var isOnline = await self.isOnlineAsync();

        var status = isOnline ? 'オンライン' : 'オフライン';

        lineRepository.send('Factorio マルチ: ' + addressCache + ' ' + status);
    };

    self.setAddressCacheFromChat = (line) => {
        var result = line.body.match(/^SetFactorioAddress\s([0-9]{1-3}\.[0-9]{1-3}\.[0-9]{1-3}\.[0-9]{1-3})$/i);

        if (line.player != 'tsumasakidachi' || !line.body || result == null) return;

        addressCashe = result[1];
    }

    self.isOnlineAsync = () => {
        var p = new Promise((resolve, reject) => {
            exec(command, function (error, stdout, stderr) {
                if(error)
                {
                    resolve(false);
                    return;
                }

                var lines = stdout.trim().split(/\n/);
                var listeners = lines.map((l) => { return l.trim().split(/\s+/); });

                resolve(listeners.length >= 1);
            });
        });

        return p;
    }

    lineRepository.onReceived(self.asnwer);

    return this;
}

module.exports = factorioService;