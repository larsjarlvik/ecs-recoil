import settings from 'settings';
import Viewport from './viewport';

const viewport = Viewport.Instance;

export default class GL {
    private static _instance: GL;
    public gl: WebGL2RenderingContext;

    private constructor() {
        this.gl = viewport.viewport.getContext('webgl2', {
            antialias: false,
            desynchronized: true,
            alpha: false,
            depth: false,
            premultipliedAlpha: true,
            failIfMajorPerformanceCaveat: true,
            preserveDrawingBuffer: false,
            powerPreference: 'high-performance',
        }) as WebGL2RenderingContext;

        this.gl.enableVertexAttribArray(0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);
        this.gl.frontFace(this.gl.CCW);
        this.gl.clearColor(settings.clearColor[0], settings.clearColor[1], settings.clearColor[2], settings.clearColor[3]);
    }

    public static get Instance(): WebGL2RenderingContext {
        return (this._instance || (this._instance = new this())).gl;
    }
}
