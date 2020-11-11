class Viewport {
    private static _instance: Viewport;
    public viewport: HTMLCanvasElement;
    public width: number;
    public height: number;
    public aspect: number;

    private setSize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.aspect = this.width / this.height;

        this.viewport.width = this.width;
        this.viewport.height = this.height;
    }

    private constructor() {
        this.viewport = document.getElementById('gfx') as unknown as HTMLCanvasElement;

        window.addEventListener('resize', () => {
            this.setSize();
        });

        this.setSize();
    }

    public static get Instance(): Viewport {
        const instance = this._instance || (this._instance = new this());
        return instance;
    }
}

export default Viewport;
