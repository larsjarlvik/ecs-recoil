import { Material } from 'components/Material';
import { Model } from 'components/Model';
import { World } from 'ecsy';
import { DefaultRenderSystem } from 'systems/DefaultRenderSystem';
import { createTriangle } from 'models/triangle';
import GL from 'base/gl';
import { Position } from 'components/Position';
import { CameraSystem } from 'systems/CameraSystem';
import { CameraMatrix, CameraPosition } from 'components/Camera';
import { Viewport } from 'components/Viewport';
import { Renderable } from 'components/TagComponents';
import { vec3 } from 'gl-matrix';

const gl = GL.Instance;
const canvas = document.getElementById('gfx') as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);
gl.frontFace(gl.CCW);

const world = new World();
world
    .registerComponent(Viewport)
    .registerComponent(Model)
    .registerComponent(Position)
    .registerComponent(Material)
    .registerComponent(CameraPosition)
    .registerComponent(CameraMatrix)
    .registerComponent(Renderable)
    .registerSystem(CameraSystem)
    .registerSystem(DefaultRenderSystem);

const triangle = createTriangle();

world.createEntity('triangle')
    .addComponent(CameraPosition, { position: vec3.fromValues(0.0, 0.0, -5.0) })
    .addComponent(CameraMatrix)
    .addComponent(Model, triangle)
    .addComponent(Position, { x: -0.2, y: -0.2, z: 1.0 })
    .addComponent(Material, { r: 1.0, g: 0.0, b: 0.0, a: 1.0 })
    .addComponent(Renderable);

world.createEntity('triangle2')
    .addComponent(CameraPosition, { position: vec3.fromValues(0.0, 0.0, -5.0) })
    .addComponent(CameraMatrix)
    .addComponent(Model, triangle)
    .addComponent(Position, { x: 0.4, y: 0.4, z: 0.0 })
    .addComponent(Material, { r: 0.0, g: 1.0, b: 0.0, a: 1.0 })
    .addComponent(Renderable);

let lastTime = performance.now();
function run() {
    const time = performance.now();
    const delta = time - lastTime;

    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);

    world.execute(delta, time);
    lastTime = time;
    requestAnimationFrame(run);
}

run();
