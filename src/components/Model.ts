import { Component, Types } from 'ecsy';

export class Model extends Component<Model> {
    vertexBuffer: WebGLBuffer;
    indexBuffer: WebGLBuffer;
    length: number;
}

Model.schema = {
    vertexBuffer: { type: Types.Ref },
    indexBuffer: { type: Types.Ref },
    length: { type: Types.Number },
};
