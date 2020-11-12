import { Component, Types } from 'ecsy';

export class Model extends Component<Model> {
    vertexBuffer: WebGLBuffer;
    normalBuffer: WebGLBuffer;
    tangentBuffer: WebGLBuffer;
    uvBuffer: WebGLBuffer;
    indexBuffer: WebGLBuffer;
    baseColorTexture: WebGLTexture | null;
    normalTexture: WebGLTexture | null;
    length: number;
}

Model.schema = {
    vertexBuffer: { type: Types.Ref },
    normalBuffer: { type: Types.Ref },
    tangentBuffer: { type: Types.Ref },
    uvBuffer: { type: Types.Ref },
    indexBuffer: { type: Types.Ref },
    baseColorTexture: { type: Types.Ref },
    normalTexture: { type: Types.Ref },
    length: { type: Types.Number },
};
