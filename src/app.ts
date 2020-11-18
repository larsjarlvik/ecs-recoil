
import { World } from 'ecsy';
import { vec3 } from 'gl-matrix';
import Camera from 'camera';
import Scene from 'scene';
import { Model } from 'ecs/components/Model';
import { Light } from 'ecs/components/Light';
import { Transform } from 'ecs/components/Transform';
import { Renderable, Spin } from 'ecs/components/TagComponents';
import { DefaultRenderSystem } from 'ecs/systems/DefaultRenderSystem';
import { SpinnerSystem } from 'ecs/systems/SpinnerSystem';
import { LightSystem } from 'ecs/systems/LightSystem';
import { TransformSystem } from 'ecs/systems/TransformSystem';
import * as engine from 'engine';

const camera = Camera.Instance;
const scene = Scene.Instance;

async function start() {
    const model = await engine.gltf.loadModel('waterbottle/waterbottle');

    const world = new World()
        .registerComponent(Model)
        .registerComponent(Transform)
        .registerComponent(Renderable)
        .registerComponent(Spin)
        .registerComponent(Light)
        .registerSystem(TransformSystem)
        .registerSystem(SpinnerSystem)
        .registerSystem(DefaultRenderSystem)
        .registerSystem(LightSystem);

    world.createEntity('waterbottle')
        .addComponent(Model, model)
        .addComponent(Spin)
        .addComponent(Transform, { translation: vec3.fromValues(-0.1, 0.0, 0.0), rotation: vec3.fromValues(0.5, 0.5, 0.5) })
        .addComponent(Renderable);

    world.createEntity('waterbottle2')
        .addComponent(Model, model)
        .addComponent(Spin)
        .addComponent(Transform, { translation: vec3.fromValues( 0.1, 0.0, 0.0), rotation: vec3.fromValues(0.5, 0.5, 0.5) })
        .addComponent(Renderable);

    world.createEntity('myFirstLight')
        .addComponent(Transform, { translation: vec3.fromValues( 0.5, 0.0, 0.0) })
        .addComponent(Light, { color: vec3.fromValues(0.0, 0.0, 1.0), range: 1.5, intensity: 6.5 });

    world.createEntity('myFirstLight2')
        .addComponent(Transform, { translation: vec3.fromValues(-0.5, 0.0, 0.0) })
        .addComponent(Light, { color: vec3.fromValues(0.0, 1.0, 0.0), range: 1.5, intensity: 6.5 });

    let lastTime = performance.now();

    function run() {
        const time = performance.now();
        const delta = time - lastTime;

        // Update
        camera.update();
        world.execute(delta, time);

        // Render
        scene.render();

        lastTime = time;
        requestAnimationFrame(run);
    }

    run();
}

start();
