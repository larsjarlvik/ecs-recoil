import { Material } from 'components/Material';
import { Model } from 'components/Model';
import { World } from 'ecsy';
import { DefaultRenderSystem } from 'systems/DefaultRenderSystem';
// import { createTriangle } from 'models/triangle';
import GL from 'global/gl';
import { Transform } from 'components/Transform';
import { Renderable, Spin } from 'components/TagComponents';
import Camera from 'global/camera';
import Viewport from 'global/viewport';
import { GBuffer } from 'base/gbuffer';
import { createCube } from 'models/cube';
import { vec3 } from 'gl-matrix';
import { SpinnerSystem } from 'systems/SpinnerSystem';

const gl = GL.Instance;
const camera = Camera.Instance;
const viewport = Viewport.Instance;
const gBuffer = new GBuffer();

const canvas = document.getElementById('gfx') as unknown as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);
gl.frontFace(gl.CCW);
gl.clearColor(0.3, 0.3, 0.3, 1.0);

const world = new World();
world
    .registerComponent(Model)
    .registerComponent(Transform)
    .registerComponent(Material)
    .registerComponent(Renderable)
    .registerComponent(Spin)
    .registerSystem(SpinnerSystem)
    .registerSystem(DefaultRenderSystem);

// world.createEntity('triangle')
//     .addComponent(Model, createTriangle())
//     .addComponent(Transform, { translation: vec3.fromValues(-2.0, -0.2, 1.0), rotation: vec3.fromValues(0.0, 0.0, 0.0) })
//     .addComponent(Material, { r: 1.0, g: 0.0, b: 0.0, a: 1.0 })
//     .addComponent(Renderable);

world.createEntity('cube')
    .addComponent(Model, createCube())
    .addComponent(Transform, { translation: vec3.fromValues(-0.2, -0.2, 1.0), rotation: vec3.fromValues(0.5, 0.5, 0.5) })
    .addComponent(Material, { r: 0.0, g: 1.0, b: 0.0, a: 1.0 })
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

    gBuffer.unbind();
    gBuffer.render();

    lastTime = time;
    requestAnimationFrame(run);
}

run();
