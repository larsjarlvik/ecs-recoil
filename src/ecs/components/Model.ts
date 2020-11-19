import { Component, Types } from 'ecsy';

export class Model extends Component<Model> {
    vertexBuffer: WebGLBuffer;
    normalBuffer: WebGLBuffer;
    tangentBuffer: WebGLBuffer;
    uvBuffer: WebGLBuffer;
    indexBuffer: WebGLBuffer;
    baseColorTexture: WebGLTexture;
    ormTexture: WebGLTexture | null;
    normalTexture: WebGLTexture | null;
    hasOrmTexture: boolean;
    hasNormalTexture: boolean;
    metallicFactor: number;
    roughnessFactor: number;
    length: number;
}

Model.schema = {
    vertexBuffer: { type: Types.Ref },
    normalBuffer: { type: Types.Ref },
    tangentBuffer: { type: Types.Ref },
    uvBuffer: { type: Types.Ref },
    indexBuffer: { type: Types.Ref },
    baseColorTexture: { type: Types.Ref },
    ormTexture: { type: Types.Ref },
    normalTexture: { type: Types.Ref },
    hasOrmTexture: { type: Types.Boolean },
    hasNormalTexture: { type: Types.Boolean },
    metallicFactor: { type: Types.Number },
    roughnessFactor: { type: Types.Number },
    length: { type: Types.Number },
};
