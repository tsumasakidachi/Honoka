var Vec3 = require('vec3').Vec3;

var motion = function (bot, line, entity) {
    var self = this;
    self.bot = bot;
    self.line = line;
    self.entity = entity;

    // 視野
    self.fov = 0.5 * Math.PI; // 90 度

    // 視程
    self.viewDistance = 10;

    // 自動で頭を回転;
    self.isHeadingAuto = true;

    // 一番近くの生き物を見る
    self.lookAtNearestLiving = function () {
        if (!self.isHeadingAuto) return;

        // 視界の中にいるエンティティ
        var inSights = self.getLivingInSight();

        // 最も近いエンティティを探す
        var nearestBy = null;
        var distanceNearestBy = null;

        for (id in inSights) {
            var distance = self.bot.entity.position.distanceTo(inSights[id].position);

            if ((distanceNearestBy == null || Math.min(distance, distanceNearestBy) == distance) && inSights[id].username != bot.username) {
                nearestBy = inSights[id];
                distanceNearestBy = distance;
            }
        }

        if(!nearestBy) return;

        var targetPosition = nearestBy.position.offset(0, nearestBy.height * 0.8, 0);
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
        if (!self.bot.entity) return false;
        if(!e.position) return false;

        var yaw = self.bot.entity.yaw;
        var P = self.bot.entity.position;

        // VD の座標
        var VDX = self.viewDistance * Math.sin(yaw) + P.x;
        var VDZ = self.viewDistance * Math.cos(yaw) + P.z;
        var VD = new Vec3(VDX, P.y, VDZ);

        // 距離と相対角度
        var distance = P.distanceTo(e.position);
        var base = P.z - e.position.z;
        var height = P.x - e.position.x;
        var relativeAngle = Math.atan2(height, base) + Math.PI;
        var fovLeftAngle = yaw - (self.fov / 2);
        var fovRightAngle = yaw + (self.fov / 2);

        console.log(yaw + ' | ' + fovRightAngle + ' <= ' + relativeAngle + ' <= ' + fovLeftAngle); ////////////////////////////////////////////////////////////////////////////

        return distance <= self.viewDistance && fovRightAngle <= relativeAngle && relativeAngle <= fovLeftAngle;
    };

    self.onMoved = function (e) {
        // 視界の中でエンティティが動いたとき
        var isInSight = self.isInSight(e);

        if (isInSight) {
            self.lookAtNearestLiving();
        }
    };

    self.onChatReceived = function (line) {
        if (!line.body) return;

        var headingAzimuth = line.body.match(/^heading (\d+)$/);
        var headingAuto = line.body.match(/^heading auto$/);

        if (headingAuto) {
            self.headingAuto();
        }
        else if (headingAzimuth) {
            self.headingAzimuth(parseInt(headingAzimuth[1]));
        }
    };

    self.headingAzimuth = function (azimuth) {
        self.isHeadingAuto = false;

        var yaw = Math.abs(360 - azimuth);
        var heading = yaw / 180 * Math.PI;

        bot.look(heading, 0);
    }

    self.headingAuto = function () {
        self.isHeadingAuto = true;
    }

    line.onReceived(self.onChatReceived);

    return self;
}

module.exports = motion;