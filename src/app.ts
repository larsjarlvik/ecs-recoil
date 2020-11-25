
import { World } from 'ecsy';
import { vec2, vec3, vec4 } from 'gl-matrix';
import Camera from 'camera';
import Scene from 'scene';
import { Model } from 'ecs/components/Model';
import { Light } from 'ecs/components/Light';
import { Transform } from 'ecs/components/Transform';
import { FpsCounter, InstancedRender, Render, Spin } from 'ecs/components/TagComponents';
import { Text } from 'ecs/components/Text';
import { DefaultRenderSystem } from 'ecs/systems/DefaultRenderSystem';
import { SpinnerSystem } from 'ecs/systems/SpinnerSystem';
import { LightSystem } from 'ecs/systems/LightSystem';
import { TransformSystem } from 'ecs/systems/TransformSystem';
import { UiSystem } from 'ecs/systems/UiSystem';
import { FpsRenderSystem } from 'ecs/systems/FpsRenderSystem';
import * as engine from 'engine';
import { Instances } from 'ecs/components/Instance';
import { InstancedRenderSystem } from 'ecs/systems/InstancedRenderSystem';

const camera = Camera.Instance;
const scene = Scene.Instance;

async function start() {
    const model = await engine.gltf.loadModel('waterbottle/waterbottle');

    const world = new World()
        .registerComponent(Model)
        .registerComponent(Transform)
        .registerComponent(Render)
        .registerComponent(InstancedRender)
        .registerComponent(Instances)
        .registerComponent(Spin)
        .registerComponent(Light)
        .registerComponent(Text)
        .registerComponent(FpsCounter)
        .registerSystem(TransformSystem)
        .registerSystem(SpinnerSystem)
        .registerSystem(DefaultRenderSystem)
        .registerSystem(InstancedRenderSystem)
        .registerSystem(LightSystem)
        .registerSystem(FpsRenderSystem)
        .registerSystem(UiSystem);

    world.createEntity('waterbottle')
        .addComponent(Model, model)
        .addComponent(Spin)
        .addComponent(Transform, { translation: vec3.fromValues(-0.1, 0.0, 0.0), rotation: vec3.fromValues(0.5, 0.5, 0.5) })
        .addComponent(Render);

    world.createEntity('waterbottle2')
        .addComponent(Model, model)
        .addComponent(Spin)
        .addComponent(Transform, { translation: vec3.fromValues( 0.1, 0.0, 0.0), rotation: vec3.fromValues(0.5, 0.5, 0.5) })
        .addComponent(Render);

    world.createEntity('myFirstLight')
        .addComponent(Transform, { translation: vec3.fromValues( 0.5, 0.0, 0.0) })
        .addComponent(Light, { color: vec3.fromValues(0.0, 0.0, 1.0), range: 1.5, intensity: 0.5 });

    world.createEntity('myFirstLight2')
        .addComponent(Transform, { translation: vec3.fromValues(-0.5, 0.0, 0.0) })
        .addComponent(Light, { color: vec3.fromValues(0.0, 1.0, 0.0), range: 1.5, intensity: 0.5 });

    world.createEntity('test')
        .addComponent(FpsCounter)
        .addComponent(Text, { position: vec2.fromValues(10.0, 10.0), color: vec4.fromValues(1.0, 1.0, 1.0, 1.0), size: 15 });

    let lastTime = performance.now();

    function run() {
        const time = performance.now();
        const delta = time - lastTime;

        // Update
        camera.update();
        world.execute(delta, time);

        // Render
        scene.render(delta, time);

        lastTime = time;
        requestAnimationFrame(run);
    }

    run();
}

start();
