class GL
{
    private static _instance: GL;
    public gl: WebGL2RenderingContext;

    private constructor()
    {
        const canvas = document.getElementById('gfx') as HTMLCanvasElement;
        this.gl = canvas.getContext('webgl2', {
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

    public static get Instance(): WebGL2RenderingContext
    {
        const instance = this._instance || (this._instance = new this());
        return instance.gl;
    }
}

export default GL;
