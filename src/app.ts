
import { World } from 'ecsy';
import { vec3 } from 'gl-matrix';
import GL from 'global/gl';
import Camera from 'global/camera';
import Viewport from 'global/viewport';
import { GBuffer } from 'base/gbuffer';
import { loadEnvironment } from 'base/environment';
import { Fxaa } from 'base/fxaa';
import { Model } from 'components/Model';
import { Transform } from 'components/Transform';
import { Renderable, Spin } from 'components/TagComponents';
import { DefaultRenderSystem } from 'systems/DefaultRenderSystem';
import { SpinnerSystem } from 'systems/SpinnerSystem';
import { loadModel } from 'models/gltf';
import { Settings } from 'settings';

const gl = GL.Instance;
const camera = Camera.Instance;
const viewport = Viewport.Instance;

async function start() {
    const fxaa = new Fxaa();
    const environment = await loadEnvironment();
    const gBuffer = new GBuffer(environment);

    const model = await loadModel('waterbottle/waterbottle');

    const canvas = document.getElementById('gfx') as unknown as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

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
        .registerSystem(SpinnerSystem)
        .registerSystem(DefaultRenderSystem);

    world.createEntity('waterbottle')
        .addComponent(Model, model)
        .addComponent(Transform, { translation: vec3.fromValues(-0.1, 0.0, 0.0), rotation: vec3.fromValues(0.5, 0.5, 0.5) })
        .addComponent(Spin)
        .addComponent(Renderable);

    world.createEntity('waterbottle2')
        .addComponent(Model, model)
        .addComponent(Transform, { translation: vec3.fromValues( 0.1, 0.0, 0.0), rotation: vec3.fromValues(0.5, 0.5, 0.5) })
        .addComponent(Spin)
        .addComponent(Renderable);

    let lastTime = performance.now();

    function run() {
        const time = performance.now();
        const delta = time - lastTime;

        // Render pass
        gBuffer.bind();

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, viewport.width, viewport.height);
        camera.update();
        world.execute(delta, time);

        // Draw pass
        fxaa.bind();
        gBuffer.render();

        // Draw to screen
        fxaa.render();

        lastTime = time;
        requestAnimationFrame(run);
    }

    run();
}

start();
