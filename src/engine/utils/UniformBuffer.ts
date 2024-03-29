import { mat4, vec3, vec4 } from 'gl-matrix';
import GL from 'engine/gl';

const gl = GL.Instance;

type Type = 'float' | 'vec' | 'mat' | 'struct';

export interface UniformBufferItem {
    type: Type;
    value: vec3 | vec4 | mat4 | number | UniformBuffer | UniformBuffer[];
    size?: number;
    arrayLength?: number;
}

export interface UniformBuffer {
    [key: string]: UniformBufferItem;
}

export class UniformBufferWrapper {
    boundLocation: number;
    serializedData: number[];
    buffer: WebGLBuffer;
    bufferArr: Float32Array;

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
                    if (item.arrayLength && item.size) {
                        const pad = item.size * (item.arrayLength - (item.value as []).length);
                        if (pad > 0) this.serializedData.push(...(new Array(pad)));
                    }
                    break;
            }
        }
    }

    set(data: UniformBuffer) {
        this.serializedData = [];
        this.build(data);
        this.bufferArr = new Float32Array(this.serializedData);

        gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer);
        gl.bufferData(gl.UNIFORM_BUFFER, this.bufferArr, gl.DYNAMIC_DRAW);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, this.boundLocation, this.buffer);
    }
}
