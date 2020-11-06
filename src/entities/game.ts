import { Entity } from 'ecs';
import { Settings } from 'settings';
import { Triangle } from './triangle';

export class Game extends Entity {
    private _lastTimeStamp = 0;
    private _gl: WebGL2RenderingContext;
    private _entities: Entity[] = [];

    public get Entities(): Entity[] {
        return this._entities;
    }

    public Awake(): void {
        super.Awake();

        this.InitializeContext();
        this._entities.push(new Triangle(this._gl, -0.5, -0.5, 0.5, 0.5));

        for (const entity of this._entities) {
            entity.Awake();
        }

        window.requestAnimationFrame(() => {
            this._lastTimeStamp = performance.now();
            this.Update();
        });
    }

    public Update(): void {
        const deltaTime = performance.now() - this._lastTimeStamp;
        super.Update(deltaTime);

        this._gl.clear(this._gl.COLOR_BUFFER_BIT);

        for (const entity of this._entities) {
            entity.Update(deltaTime);

            if (this._gl.getError() !== 0) {
                console.log(this._gl.getError());
            }
        }

        this._lastTimeStamp = performance.now();
        window.requestAnimationFrame(() => this.Update());
    }

    private InitializeContext(): void {
        const canvas = document.getElementById('gfx') as HTMLCanvasElement | null;
        if (!canvas) throw new Error('Failed to locate canvas!');

        const gl = canvas.getContext('webgl2');
        if (!gl) throw new Error('Failed to create WebGL2 context!');

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientWidth;

        this._gl = gl;
        this._gl.clearColor(Settings.clearColor[0], Settings.clearColor[1], Settings.clearColor[2], Settings.clearColor[3]);
        this._gl.viewport(0, 0, canvas.width, canvas.height);
    }
}