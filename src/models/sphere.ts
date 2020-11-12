import GL from 'global/gl';

const gl = GL.Instance;

interface Options {
    long_bands?: number;
    lat_bands?: number;
    radius?: number;
}


export function createSphere(options: Options = {}) {
    options = options || {};

    const longBands = options.long_bands || 32;
    const latBands = options.lat_bands || 32;
    const radius = options.radius || 1;
    const latStep = Math.PI / latBands;
    const longStep = 2 * Math.PI / longBands;
    const numPositions = longBands * latBands * 4;
    const numIndices = longBands * latBands * 6;

    const vertices = new Float32Array(numPositions * 3);
    const normals = new Float32Array(numPositions * 3);
    const uvs = new Float32Array(numPositions * 2);
    const indices = new Uint16Array(numIndices);

    let k = 0, l = 0;
    for (let i = 0; i < latBands; i++) {
        const latAngle = i * latStep;
        const y1 = Math.cos(latAngle);
        const y2 = Math.cos(latAngle + latStep);
        for (let j = 0; j < longBands; j++) {
            const longAngle = j * longStep;
            const x1 = Math.sin(latAngle) * Math.cos(longAngle);
            const x2 = Math.sin(latAngle) * Math.cos(longAngle + longStep);
            const x3 = Math.sin(latAngle + latStep) * Math.cos(longAngle);
            const x4 = Math.sin(latAngle + latStep) * Math.cos(longAngle + longStep);
            const z1 = Math.sin(latAngle) * Math.sin(longAngle);
            const z2 = Math.sin(latAngle) * Math.sin(longAngle + longStep);
            const z3 = Math.sin(latAngle + latStep) * Math.sin(longAngle);
            const z4 = Math.sin(latAngle + latStep) * Math.sin(longAngle + longStep);
            const u1 = 1 - j / longBands;
            const u2 = 1 - (j + 1) / longBands;
            const v1 = 1 - i / latBands;
            const v2 = 1 - (i + 1) / latBands;
            const vi = k * 3;
            const ti = k * 2;

            vertices[vi] = x1 * radius;
            vertices[vi + 1] = y1 * radius;
            vertices[vi + 2] = z1 * radius; //v0

            vertices[vi + 3] = x2 * radius;
            vertices[vi + 4] = y1 * radius;
            vertices[vi + 5] = z2 * radius; //v1

            vertices[vi + 6] = x3 * radius;
            vertices[vi + 7] = y2 * radius;
            vertices[vi + 8] = z3 * radius; // v2

            vertices[vi + 9] = x4 * radius;
            vertices[vi + 10] = y2 * radius;
            vertices[vi + 11] = z4 * radius; // v3

            normals[vi] = x1;
            normals[vi + 1] = y1;
            normals[vi + 2] = z1;

            normals[vi + 3] = x2;
            normals[vi + 4] = y1;
            normals[vi + 5] = z2;

            normals[vi + 6] = x3;
            normals[vi + 7] = y2;
            normals[vi + 8] = z3;

            normals[vi + 9] = x4;
            normals[vi + 10] = y2;
            normals[vi + 11] = z4;

            uvs[ti] = u1;
            uvs[ti + 1] = v1;

            uvs[ti + 2] = u2;
            uvs[ti + 3] = v1;

            uvs[ti + 4] = u1;
            uvs[ti + 5] = v2;

            uvs[ti + 6] = u2;
            uvs[ti + 7] = v2;

            indices[l] = k;
            indices[l + 1] = k + 1;
            indices[l + 2] = k + 2;
            indices[l + 3] = k + 2;
            indices[l + 4] = k + 1;
            indices[l + 5] = k + 3;

            k += 4;
            l += 6;
        }
    }

    const vertexBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const normalBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const indexBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);


    return {
        vertexBuffer,
        normalBuffer,
        indexBuffer,
        length: indices.length,
    };
}