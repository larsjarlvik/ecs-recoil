import { mat4, vec3, vec4 } from 'gl-matrix';
import GL from 'global/gl';

const gl = GL.Instance;

type Type = 'float' | 'vec' | 'mat' | 'struct';

export interface UniformBufferItem {
    type: Type;
    value: vec3 | vec4 | mat4 | number | UniformBuffer | UniformBuffer[];
}

export interface UniformBuffer {
    [key: string]: UniformBufferItem;
}

export class UniformBufferWrapper {
    boundLocation: number;
    serializedData: number[];
    buffer: WebGLBuffer;

    constructor(boundLocation: number) {
        this.boundLocation = boundLocation;

        this.buffer = gl.createBuffer()!;
        gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, this.boundLocation, this.buffer);
    }

    private pad(length: number) {
        const l = length > 4 ? 4: length;

        if (l < this.serializedData.length % 4) return;
        for (let i = 0; i < this.serializedData.length % 4; i ++) {
            this.serializedData.push(0.0);
        }
    }

    private build(struct: UniformBuffer) {
        for (const key of Object.keys(struct)) {
            const item = struct[key];
            switch(item.type) {
                case 'float':
                    this.serializedData.push(item.value as number);
                    break;
                case 'vec':
                    this.pad((item.value as []).length);
                    this.serializedData.push(...item.value as number[]);
                    break;
                case 'mat':
                    this.pad((item.value as []).length);
                    this.serializedData.push(...item.value as number[]);
                    break;
                case 'struct':
                    this.pad((item.value as []).length);
                    for (let i = 0; i < (item.value as []).length; i ++) this.build(item.value[i]);
                    break;
            }
        }
    }

    set(data: UniformBuffer) {
        this.serializedData = [];
        this.build(data);

        gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer);
        gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(this.serializedData), gl.DYNAMIC_DRAW);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, this.boundLocation, this.buffer);
    }
}
