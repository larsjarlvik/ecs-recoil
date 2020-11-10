import GL from 'global/gl';

const gl = GL.Instance;

export class UniformBuffer<T> {
    boundLocation: number;
    serializedData: number[];
    buffer: WebGLBuffer;

    constructor(boundLocation: number) {
        this.boundLocation = boundLocation;

        this.buffer = gl.createBuffer()!;
        gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer);
        gl.bindBuffer(gl.UNIFORM_BUFFER, null);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, this.boundLocation, this.buffer);
    }

    set(data: T) {
        this.serializedData = [];
        for(const key of Object.keys(data)) {
            this.serializedData.push(...data[key]);
        }

        gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer);
        gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(this.serializedData), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.UNIFORM_BUFFER, null);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, this.boundLocation, this.buffer);
    }
}
