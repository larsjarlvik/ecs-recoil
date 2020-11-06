import { Entity } from 'ecs';

export class Buffer extends Entity {
    public Length: number;
    private buffer: WebGLBuffer;

    constructor(
        public readonly gl: WebGL2RenderingContext,
        public readonly target: number,
        public readonly data: number[],
    ) {
        super();
    }

    public Awake(): void {
        this.buffer = this.gl.createBuffer()!;
        this.gl.bindBuffer(this.target, this.buffer);
        this.gl.bufferData(this.target, new Float32Array(this.data), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.target, null);
        this.Length = this.data.length;
    }

    public Update(): void {
        this.gl.bindBuffer(this.target, this.buffer);
    }
}