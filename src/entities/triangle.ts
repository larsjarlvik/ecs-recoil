import { RenderComponent } from 'components/render';
import { Entity } from 'ecs';
import { Shader } from './shader';
import { Buffer } from './buffer';

export class Triangle extends Entity {
    private _entities: Entity[] = []

    private readonly vertices: number[];
    private indices = [0, 1, 2];

    constructor(
        public readonly gl: WebGL2RenderingContext,
        public readonly x1: number,
        public readonly y1: number,
        public readonly x2: number,
        public readonly y2: number,
    ) {
        super();

        this.vertices = [
            this.x1, this.y2, 0.0,
            this.x1, this.y1, 0.0,
            this.x2, this.y1, 0.0,
        ];
    }

    public Update(deltaTime: number): void {
        for (const component of this.Components) {
            component.Update(deltaTime);
        }
    }

    public Awake(): void {
        super.Awake();
        this._entities.push(
            new Buffer(this.gl, this.gl.ARRAY_BUFFER, this.vertices),
            new Buffer(this.gl, this.gl.ELEMENT_ARRAY_BUFFER, this.indices),
            new Shader(this.gl),
        );

        for (const entity of this._entities) {
            entity.Awake();
        }

        this.AddComponent(new RenderComponent(this.gl, this._entities, this.indices.length));
    }
}