import Viewport from './viewport';

const viewport = Viewport.Instance;

export default class GL {
    private static _instance: GL;
    public gl: WebGL2RenderingContext;

    private constructor() {
        this.gl = viewport.viewport.getContext('webgl2', {
            antialias: false,
            desynchronized: false,
            alpha: true,
            depth: true,
            premultipliedAlpha: true,
            failIfMajorPerformanceCaveat: true,
            preserveDrawingBuffer: false,
            powerPreference: 'high-performance',
        }) as WebGL2RenderingContext;
    }

    public static get Instance(): WebGL2RenderingContext {
        return (this._instance || (this._instance = new this())).gl;
    }
}
