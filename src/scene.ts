import { mat4 } from 'gl-matrix';
import { Model } from 'ecs/components/Model';
import { Light } from 'ecs/components/Light';
import { Text } from 'ecs/components/Text';
import { Environment, loadEnvironment } from 'engine/utils/environment';
import * as engine from 'engine';
import Camera from './camera';
import { Metrics, TextBuffer } from 'engine/utils/text';
import settings from 'settings';

const camera = Camera.Instance;

export class FpsCounter {
    lastUpdate: number;
    fps: number;
    current: number;
    frameTime: number;
}

export interface SceneText {
    buffers: TextBuffer;
    data: Text;
}

export interface SceneUi {
    font?: {
        texture: WebGLTexture;
        metrics: Metrics;
        width: number;
        height: number;
    };
    texts: { [key: string ]: SceneText };
}

export interface SceneRoot {
    fps: FpsCounter;
    models: { [key: string]: Model };
    instancedModels: { [key: string]: { model: Model, position: WebGLBuffer, rotScale: WebGLBuffer, count: number }}
    lights: { [key: string]: Light };
    lightCount: number;
    transforms: { [key: string]: mat4 };
    ui: SceneUi;
}

export default class Scene {
    private static _instance: Scene;
    public root: SceneRoot;
    private environment: Environment;
    private fxaa: engine.Fxaa;
    private gBuffer: engine.GBuffer;
    private isReady = false;
    private defaultRenderer: engine.DefaultRenderer;
    private instancedRenderer: engine.InstancedRenderer;
    private textRenderer: engine.TextRenderer;

    private constructor() {
        this.defaultRenderer = new engine.DefaultRenderer(this);
        this.instancedRenderer = new engine.InstancedRenderer(this);
        this.textRenderer = new engine.TextRenderer(this);
        this.root = {
            fps: { lastUpdate: 0, fps: 0, current: 0, frameTime: 0 },
            models: {},
            instancedModels: {},
            lights: {},
            lightCount: 0,
            transforms: {},
            ui: {
                texts: {},
            },
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

        const fontImage = await engine.image.load(`ui/${settings.fontName}.png`);
        const fontMetrics = await engine.http.request(`ui/${settings.fontName}.json`);

        this.root.ui.font = {
            ...engine.TextRenderer.createFontTexture(fontImage),
            metrics: fontMetrics,
        };
    }

    public render(_: number, time: number) {
        if (!this.isReady) return;

        camera.perspective();

        // Render
        this.gBuffer.bind();
        engine.screen.clearScreen(settings.renderScale);
        this.defaultRenderer.render(camera);
        this.instancedRenderer.render(camera);
        this.gBuffer.unbind();

        // Draw pass
        this.fxaa.bind();
        this.gBuffer.render(camera, this.environment);
        this.fxaa.unbind();

        // Draw to screen
        engine.screen.clearScreen(1.0);
        this.fxaa.render();

        // UI
        camera.ortho();
        this.textRenderer.render();


        // Fps
        if (this.root.fps.lastUpdate <= time - 1000) {
            this.root.fps.fps = Math.round(this.root.fps.current / (time - this.root.fps.lastUpdate) * 1000.0);
            this.root.fps.current = 0;
            this.root.fps.lastUpdate = time;
        }

        this.root.fps.frameTime = Math.round(performance.now() - time);
        this.root.fps.current ++;
    }
}
