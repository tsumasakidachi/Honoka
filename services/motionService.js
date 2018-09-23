var Vec3 = require('vec3').Vec3;

var motion = function (bot, line, entity) {
    var self = this;
    self.bot = bot;
    self.line = line;
    self.entity = entity;

    // 視野
    var fov = 0.5 * Math.PI; // 90 度

    // 視程
    var viewDistance = 10;

    // 一番近くの生き物を見る
    self.lookAtNearestLiving = function () {
        // 視界の中にいるエンティティ
        var inSights = self.getLivingInSight();

        // 最も近いエンティティを探す
        var nearestBy = null;
        var distanceNearestBy = null;

        for (id in inSights) {
            var distance = self.bot.entity.position.distanceTo(inSights[id].position);

            if (distanceNearestBy == null || Math.min(distance, distanceNearestBy) == distance) {
                nearestBy = inSights[id];
                distanceNearestBy = distance;
            }
        }

        var targetPosition = nearestBy.position;

        targetPosition.y += (nearestBy.height * 0.75);
        self.bot.lookAt(targetPosition);
    }

    self.getLivingInSight = function () {
        var living = self.entity.getLiving();
        var results = {};

        for (id in living) {
            if (self.isInSight(living[id])) {
                results[id] = living[id];
            }
        }

        return results;
    };

    self.isInSight = function (e) {
        if (!self.bot.entity) return;

        var yaw = self.bot.entity.yaw;
        var P = self.bot.entity.position;

        // VD の座標
        var VDX = self.viewDistance * Math.sin(yaw) + P.x;
        var VDZ = self.viewDistance * Math.cos(yaw) + P.z;
        var VD = new Vec3(VDX, P.y, VDZ);

        // とりあえず視程を半径とする円の内側にいるかどうかにする

        var distance = P.distanceTo(e.position);

        return distance <= self.viewDistance;
    };

    self.onMoved = function (e) {
        // 視界の中でエンティティが動いたとき
        if (self.isInSight(e)) {
            self.lookAtNearestLiving();
        }
    };

    self.onChatReceived = function (line) {
        if(!line.body) return;

        var match = line.body.match(/^heading (\d+)$/);

        if(!match) return;

        var yaw = Math.abs(360 - parseInt(match[1]));
        var heading = yaw / 180 * Math.PI;

        bot.look(heading, 0);
    };

    line.onReceived(self.onChatReceived);

    return self;
}

module.exports = motion;