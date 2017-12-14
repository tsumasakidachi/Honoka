function Radar(view)
{
    var that = {};
    var worker = null;
    var requestAnimationFrameID = null;
    var gl = {};
    var scale = 16;

    gl.viewportWidth = view.innerWidth();
    gl.viewportHeight = view.innerHeight();
    
    gl.cameraSpecs = {
        aspectRatio: gl.viewportWidth / gl.viewportHeight,
        viewAngle: 90
    };

    gl.clippingPlane = {
        near: 1,
        far: 5000
    };
    
    gl.renderer = window.WebGLRenderingContext ? new THREE.WebGLRenderer({antialias: true, alpha: true}) : new THREE.CanvasRenderer({antialias: true, alpha: true});
    gl.renderer.setSize(gl.viewportWidth, gl.viewportHeight);
    gl.renderer.shadowMapEnabled = true;

    gl.scene = new THREE.Scene();
    gl.camera = new THREE.PerspectiveCamera(gl.cameraSpecs.viewAngle, gl.cameraSpecs.aspectRatio, gl.clippingPlane.near, gl.clippingPlane.far);
    gl.camera.rotation.x -= 0.5 * Math.PI;

    gl.basicLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.65);
    gl.scene.add(gl.basicLight);

    gl.directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    gl.directionalLight.position.set(0, 2000, 0);
    gl.directionalLight.castShadow = true;
    
    gl.scene.add(gl.directionalLight);

    gl.blocks = {};
    gl.entities = {};

    var initialize = function(model)
    {
        // 既存のキャンバスをキャンセル
        if(requestAnimationFrameID)
        {
            cancelAnimationFrame(requestAnimationFrameID);
        }

        // 既存のワーカーを停止
        if(worker)
        {
            worker.terminate();
        }

        // 新しいワーカー
        worker = new Worker('./resources/radarWorker.js');

        // 新しいキャンバス
        view.html(gl.renderer.domElement);

        // ジオメトリとマテリアルを生成
        var blockGeometry = new THREE.CubeGeometry(scale, scale, scale);
        var slabGeometry = new THREE.CubeGeometry(scale, scale / 2, scale);
        var blockMaterial = new THREE.MeshPhongMaterial( { color: 0xf3f3ff } );
        var organismGeometry = new THREE.Geometry();
        organismGeometry.vertices.push(new THREE.Vector3(-8, 32, 8));
        organismGeometry.vertices.push(new THREE.Vector3(0, 32, -8));
        organismGeometry.vertices.push(new THREE.Vector3(8, 32, 8));
        
        var personMaterial = new THREE.LineBasicMaterial({ linewidth: 2, color: 0x08B05C });
        var meMaterial = new THREE.LineBasicMaterial({ linewidth: 2, color: 0x000000 });
        var mobMaterial = new THREE.LineBasicMaterial({ linewidth: 2, color: 0x808080 });

        // ワーカーを開始
        worker.postMessage({
            command: 'initialize'
        });

        // 描画
        worker.onmessage = function (e)
        {
            // 絵ティティ

            // 無くなったものを削除
            for(var key in gl.entities)
            {
                var isExists = false;

                for(var exist in model.entities)
                if(key == exist)
                {
                    isExists = true;
                    break;
                }

                if(!isExists) removeEntity(key);
            }

            // 新しいものを生成
            // 今あるものを更新
            for(var key in model.entities)
            {
                if(gl.entities[key])
                {
                    moveEntity(model.me, key, model.entities[key])
                }
                else
                {
                    initializeEntity(model.me, key, model.entities[key]);
                }
            }

            // ブロック
            var count = 0;
            for(var key in model.blocks)
            {
                if(gl.blocks[key])
                {
                    count++;
                }
                else
                {
                    initializeBlock(model.me, key, model.blocks[key]);
                }
            }
            
            // カメラの位置
            if(model.me != null) gl.camera.position.set(model.me.position.x * scale, model.me.position.y * scale + 800, model.me.position.z * scale);
            
            gl.renderer.render(gl.scene, gl.camera);
        };
        
        function initializeEntity(me, key, initialEntity)
        {
            var entity = null;

            switch(initialEntity.type)
            {
                case 'player':
                    if(initialEntity.username == me.username) entity = new THREE.Line(organismGeometry, meMaterial);
                    else entity = new THREE.Line(organismGeometry, personMaterial);
                    break;
                case 'mob':
                    entity = new THREE.Line(organismGeometry, mobMaterial);
                    break;
                default:
                    return;
            }

            entity.position.set(initialEntity.position.x * scale, initialEntity.position.y * scale, initialEntity.position.z * scale);
            entity.rotation.y = initialEntity.yaw;

            gl.scene.add(entity);
            gl.entities[key] = entity;
        }

        function moveEntity(me, key, entity)
        {
            gl.entities[key].position.set(entity.position.x * scale, entity.position.y * scale, entity.position.z * scale);
            gl.entities[key].rotation.y = entity.yaw;
        }

        function removeEntity(key)
        {
            gl.scene.remove(gl.entities[key]);
            delete gl.entities[key];
        }

        function initializeBlock(me, key, initialBlock)
        {
            var xOffset = 0;
            var yOffset = 0;
            var zOffset = 0
            var block = null;

            switch(initialBlock.type)
            {
                // ハーフ
                case 43:
                case 44:
                case 126:
                case 181:
                case 182:
                    yOffset = scale / 4;
                    block = new THREE.Mesh(slabGeometry, blockMaterial);
                    break;
                // 普通
                default:
                    block = new THREE.Mesh(blockGeometry, blockMaterial);
            }

            block.position.set(initialBlock.position.x * scale, initialBlock.position.y * scale, initialBlock.position.z * scale);
            block.castShadow = true;
            block.receiveShadow = true;
            gl.scene.add(block);
            gl.blocks[key] = block;
        }
        
        function getMeRelativePosition(objPos, mePos)
        {
            return (objPos - mePos) * scale;
        }
    }
    
    var run = function()
    {
        worker.postMessage({
            command: 'update'
        });
        requestAnimationFrameID = window.requestAnimationFrame(run);
    }

    that.initialize = initialize;
    that.run = run;

    return that;
}