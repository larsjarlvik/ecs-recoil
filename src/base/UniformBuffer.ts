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

    private pad() {
        for (let i = 0; i < this.serializedData.length % 4; i ++) {
            this.serializedData.push(0.0);
        }
    }

    private build(struct: UniformBuffer) {
        this.pad();

        for (const key of Object.keys(struct)) {
            const item = struct[key];
            switch(item.type) {
                case 'float':
                    this.serializedData.push(item.value as number);
                    break;
                case 'vec':
                    this.serializedData.push(...item.value as number[]);
                    this.pad();
                    break;
                case 'mat':
                    this.serializedData.push(...item.value as number[]);
                    break;
                case 'struct':
                    for (let i = 0; i < (item.value as []).length; i ++) this.build(item.value[i]);
                    break;
            }
        }

        this.pad();
    }

    set(data: UniformBuffer) {
        this.serializedData = [];
        this.build(data);

        gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer);
        gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(this.serializedData), gl.DYNAMIC_DRAW);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, this.boundLocation, this.buffer);
    }
}
