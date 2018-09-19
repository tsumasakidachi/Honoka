var entity = function () {
    var self = this;
    self.entities = {};

    self.onSpawn = function (e) {
        self.entities[e.id] = e;
    };

    self.onMoved = function (e) {
        self.entities[e.id] = e;
    };

    self.onGone = function (e) {
        delete self.entities[e.id];
    };

    self.getLiving() = function () {
        var results = {};

        for (id in self.entities) {
            if (self.entities[id].type == 'player' || self.entities[id].type == 'mob') {
                results[id] = self.entities[id];
            }
        }

        return results;
    }

    return this;
}

module.exports = entity;
