var hostInfoService = function () {
    var request = require('request');
    let self = this;
    let uri = 'http://tmsk.s1001.xrea.com/files/hostinfo/';

    self.getHostInfoAsync = function () {
        let hostInfo = null;
        let p = new Promise((resolve, reject) => {
            request.get(uri,
                {
                    'timeout': 4 * 1000,
                    'json': true,
                    'headers': {
                        'User-Agent': 'Honoka'
                    }
                },
                function (error, response, body) {
                    if(error) reject(error);
                    
                    resolve(body);
                });
        });

        return p;
    }

    return this;
}

module.exports = hostInfoService;