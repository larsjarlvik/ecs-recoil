import GL from 'base/gl';

const gl = GL.Instance;

export class UniformBuffer {
    boundLocation: number;
    data: Float32Array;
    buffer: WebGLBuffer;

    constructor(data: ArrayLike<number>, boundLocation = 0) {
        this.boundLocation = boundLocation;
        this.data = new Float32Array(data);

        this.buffer = gl.createBuffer()!;
        gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer);
        gl.bufferData(gl.UNIFORM_BUFFER, this.data, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.UNIFORM_BUFFER, null);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, this.boundLocation, this.buffer);
    }

    update(data: ArrayLike<number>, offset = 0) {
        this.data.set(data, offset);

        gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer);
        gl.bufferSubData(gl.UNIFORM_BUFFER, 0, this.data, 0);
        gl.bindBuffer(gl.UNIFORM_BUFFER, null);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, this.boundLocation, this.buffer);
    }
}
