import { mat4 } from 'gl-matrix';
import { Model } from 'ecs/components/Model';
import { Light } from 'ecs/components/Light';
import { Environment, loadEnvironment } from 'engine/utils/environment';
import * as engine from 'engine';
import Camera from './camera';

const camera = Camera.Instance;

export interface SceneRoot {
    models: { [key: string]: Model };
    lights: { [key: string]: Light }
    lightCount: number;
    transforms: { [key: string]: mat4 }
}

export default class Scene {
    private static _instance: Scene;
    public root: SceneRoot;
    private environment: Environment;
    private fxaa: engine.Fxaa;
    private gBuffer: engine.GBuffer;
    private isReady = false;
    private defaultRenderer: engine.DefaultRenderer;

    private constructor() {
        this.defaultRenderer = new engine.DefaultRenderer(this);
        this.root = {
            models: {},
            lights: {},
            lightCount: 0,
            transforms: {},
        };

        this.init();
    }

    public static get Instance(): Scene {
        return this._instance || (this._instance = new this());
    }

    private async init() {
        const names = ['right', 'left', 'top', 'bottom', 'front', 'back'];
        const diffuseTextures = await Promise.all(names.map(n => engine.image.load(`environment/diffuse_${n}.jpg`)));
        const specularTextures = await Promise.all(names.map(n => engine.image.load(`environment/specular_${n}.jpg`)));
        this.environment = await loadEnvironment(diffuseTextures, specularTextures);

        this.fxaa = new engine.Fxaa();
        this.gBuffer = new engine.GBuffer(this);
        this.isReady = true;
    }

    public render() {
        if (!this.isReady) return;

        // Render
        this.gBuffer.bind();
        engine.screen.clearScreen();
        this.defaultRenderer.render(camera);

        // Draw pass
        this.fxaa.bind();
        this.gBuffer.render(camera, this.environment);

        // Draw to screen
        this.fxaa.render();
    }
}
