export default class Viewport {
    private static _instance: Viewport;
    public viewport: HTMLCanvasElement;
    public aspect: number;
    private resize: CustomEvent<unknown>;

    private setSize() {
        const dpi = window.devicePixelRatio || 1;
        this.viewport.width = window.innerWidth * dpi;
        this.viewport.height = window.innerHeight * dpi;
        this.aspect = this.viewport.width / this.viewport.height;
    }

    private constructor() {
        this.resize = new CustomEvent('viewportResize');
        this.viewport = document.getElementById('gfx') as unknown as HTMLCanvasElement;

        window.addEventListener('resize', () => {
            this.setSize();
            window.dispatchEvent(this.resize);
        });

        this.setSize();
    }

    public static get Instance(): Viewport {
        return this._instance || (this._instance = new this());
    }
}
