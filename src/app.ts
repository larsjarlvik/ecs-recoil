import { Material } from 'components/Material';
import { Model } from 'components/Model';
import { World } from 'ecsy';
import { DefaultRenderSystem } from 'systems/DefaultRenderSystem';
import { createTriangle } from 'models/triangle';
import GL from 'global/gl';
import { Position } from 'components/Position';
import { Renderable } from 'components/TagComponents';
import Camera from 'global/camera';
import Viewport from 'global/viewport';
// import { GBuffer } from 'base/gbuffer';

const gl = GL.Instance;
const camera = Camera.Instance;
const viewport = Viewport.Instance;
// const gBuffer = new GBuffer();

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
    .registerComponent(Position)
    .registerComponent(Material)
    .registerComponent(Renderable)
    .registerSystem(DefaultRenderSystem);

const triangle = createTriangle();

world.createEntity('triangle')
    .addComponent(Model, triangle)
    .addComponent(Position, { x: -0.2, y: -0.2, z: 1.0 })
    .addComponent(Material, { r: 1.0, g: 0.0, b: 0.0, a: 1.0 })
    .addComponent(Renderable);

world.createEntity('triangle2')
    .addComponent(Model, triangle)
    .addComponent(Position, { x: 0.4, y: 0.4, z: 0.0 })
    .addComponent(Material, { r: 0.0, g: 1.0, b: 0.0, a: 1.0 })
    .addComponent(Renderable);

let lastTime = performance.now();

function run() {
    const time = performance.now();
    const delta = time - lastTime;

    // Render pass
    // gBuffer.bind();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, viewport.width, viewport.height);
    camera.update();
    world.execute(delta, time);

    // gBuffer.unbind();
    // gBuffer.render();

    lastTime = time;
    requestAnimationFrame(run);
}

run();
