import GL from 'global/gl';

const gl = GL.Instance;

const vertices = [
     1.0,  1.0,
    -1.0,  1.0,
    -1.0, -1.0,
    -1.0, -1.0,
     1.0, -1.0,
     1.0,  1.0
];

export interface Quad {
    vertexBuffer: WebGLBuffer;
    length: number;
}

export const createQuad = () => {
    const vertexBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return {
        vertexBuffer,
        length: 6,
    } as Quad;
};
