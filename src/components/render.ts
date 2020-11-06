import { Entity, IComponent } from 'ecs';

export class RenderComponent implements IComponent {
    Entity: Entity;

    constructor(
        public readonly gl: WebGL2RenderingContext,
        public readonly entities: Entity[],
        public readonly length: number,
    ) {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    Awake(): void {
    }

    Update(deltaTime: number): void {
        for (const entity of this.entities) {
            entity.Update(deltaTime);
        }

        this.gl.drawElements(this.gl.TRIANGLES, this.length, this.gl.UNSIGNED_SHORT, 0);
    }
}