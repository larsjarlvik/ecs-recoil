import { mat4 } from 'gl-matrix';
import { Model } from 'components/Model';
import { Light } from 'components/Light';
import { DefaultRenderer } from 'renderers/DefaultRenderer';
import Viewport from 'global/viewport';
import { GBuffer } from 'base/gbuffer';
import { Environment, loadEnvironment } from 'base/environment';
import { Fxaa } from 'base/fxaa';
import GL from './gl';

const viewport = Viewport.Instance;
const gl = GL.Instance;

export interface SceneRoot {
    models: { [key: string]: Model };
    lights: { [key: string]: Light }
    transforms: { [key: string]: mat4 }
}

export default class Scene {
    private static _instance: Scene;
    public root: SceneRoot;
    private defaultRenderer: DefaultRenderer;
    private environment: Environment;
    private fxaa: Fxaa;
    private gBuffer: GBuffer;
    private isReady = false;

    private constructor() {
        this.defaultRenderer = new DefaultRenderer(this);
        this.root = {
            models: {},
            lights: {},
            transforms: {},
        };

        this.init();
    }

    public static get Instance(): Scene {
        return this._instance || (this._instance = new this());
    }

    private async init() {
        this.environment = await loadEnvironment();
        this.fxaa = new Fxaa();
        this.gBuffer = new GBuffer(this, this.environment);
        this.isReady = true;
    }

    public render() {
        if (!this.isReady) return;

        // Render
        this.gBuffer.bind();
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, viewport.width, viewport.height);
        this.defaultRenderer.render();

        // Draw pass
        this.fxaa.bind();
        this.gBuffer.render();

        // Draw to screen
        this.fxaa.render();
    }
}
