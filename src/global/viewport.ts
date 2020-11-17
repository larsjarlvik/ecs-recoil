export default class Viewport {
    private static _instance: Viewport;
    public viewport: HTMLCanvasElement;
    public width: number;
    public height: number;
    public aspect: number;
    private resize: CustomEvent<unknown>;

    private setSize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.aspect = this.width / this.height;

        this.viewport.width = this.width;
        this.viewport.height = this.height;
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
