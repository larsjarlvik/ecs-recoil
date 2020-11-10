import { Component, Types } from 'ecsy';
import { mat4, vec3 } from 'gl-matrix';

export class CameraMatrix extends Component<CameraMatrix> {
    modelView: mat4;
    projection: mat4;
}

CameraMatrix.schema = {
    modelView: { type: Types.Array },
    projection: { type: Types.Array },
};

export class CameraPosition extends Component<CameraPosition> {
    position: vec3;
}

CameraPosition.schema = {
    position: { type: Types.Array },
};
