
import { World } from 'ecsy';
import { vec3 } from 'gl-matrix';
import GL from 'global/gl';
import Camera from 'global/camera';
import Scene from 'global/scene';
import { Model } from 'components/Model';
import { Light } from 'components/Light';
import { Transform } from 'components/Transform';
import { Renderable, Spin } from 'components/TagComponents';
import { DefaultRenderSystem } from 'systems/DefaultRenderSystem';
import { SpinnerSystem } from 'systems/SpinnerSystem';
import { loadModel } from 'models/gltf';
import { Settings } from 'settings';
import { LightSystem } from 'systems/LightSystem';
import { TransformSystem } from 'systems/TransformSystem';

const gl = GL.Instance;
const camera = Camera.Instance;
const scene = Scene.Instance;

async function start() {
    const model = await loadModel('waterbottle/waterbottle');

    const canvas = document.getElementById('gfx') as unknown as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gl.enableVertexAttribArray(0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.clearColor(Settings.clearColor[0], Settings.clearColor[1], Settings.clearColor[2], Settings.clearColor[3]);

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
