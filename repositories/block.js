var block = {
    bot: bot,
    vec3: require('vec3'),
    horizontalRadius: 16,
    blocks: {},

    get: function () {
        return this.blocks;
    },

    getChunk: function (xMin, zMin) {
        if (this.bot.entity == null) return;

        var result = {};

        // var xMin = xMin;
        var xMax = xMin + 16;

        var yMin = 0;
        var yMax = 255;

        // var zMin = x + 16;
        var zMax = zMin + 16;

        for (var x = xMin; x < xMax; x++)
            for (var z = zMin; z < zMax; z++)
                for (var y = yMin; y < yMax; y++) {
                    var key = this.makeBlockKey(x, y, z);

                    if (key in this.blocks) {
                        result[key] = this.blocks[key];
                    }
                    else {
                        var block = bot.blockAt(this.vec3(x, y, z));
                        if (block == null || block.type == 0) continue;

                        var vm = this.makeBlockModel(block);
                        this.blocks[key] = vm;
                        result[key] = vm;
                    }
                }

        return result;
    },

    load: function () {
        if (this.bot.entity == null) return;

        this.clear();

        var xMin = Math.round(this.bot.entity.position.x - this.horizontalRadius);
        var xMax = Math.round(this.bot.entity.position.x + this.horizontalRadius);
        var yMin = 0;
        var yMax = 255;
        var zMin = Math.round(this.bot.entity.position.z - this.horizontalRadius);
        var zMax = Math.round(this.bot.entity.position.z + this.horizontalRadius);

        for (var x = xMin; x < xMax; x++)
            for (var z = zMin; z < zMax; z++)
                for (var y = yMin; y < yMax; y++) {
                    var block = bot.blockAt(this.vec3(x, y, z));

                    if (block == null || block.type == 0) continue;

                    var key = this.makeBlockKey(x, y, z);
                    this.blocks[key] = this.makeBlockModel(block);
                }
    },

    clear: function () {
        delete this.blocks;
        this.blocks = {};
    },

    makeBlockKey: function (x, y, z) {
        return x + "+" + y + "+" + z;
    },

    makeBlockModel: function (block) {
        return {
            type: block.type,
            metadata: block.metadata,
            position: block.position
        }
    }
}

module.exports = block;