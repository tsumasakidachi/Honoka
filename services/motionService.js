var motion = function (bot, line, entity) {
    var self = this;

    // 視野
    var fov = 0.5 * Math.PI; // 90 度

    // 視程
    var viewDistance = 20;

    self.lookLivingInSight = function () {
        var inSights = self.getLivingInSight();
    }

    self.getLivingInSight = function () {
        var living = entity.getLiving();
        var results = {};

        for (id in living) {
            if (self.isInSight(living[id])) {
                results[id] = living[id];
            }
        }

        return results;
    };

    self.isInSight = function (entity) {
        var yaw = bot.entity.yaw;
        var P = bot.entity.position;
        var A = 0;
        var B = 0;

        if (
            entity.position.x < north && entity.position.z > south
            &&
            entity.position.z < east && entity.position.z > west
            &&
            entity.position.y < top && entity.position.y > bottom
        ) {
        }

        return this;
    };
}

module.exports = motion;