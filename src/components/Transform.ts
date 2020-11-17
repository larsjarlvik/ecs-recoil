import { Component, Types } from 'ecsy';
import { vec3 } from 'gl-matrix';

export class Transform extends Component<Transform> {
    translation: vec3;
    rotation: vec3;
}

Transform.schema = {
    translation: { type: Types.Array },
    rotation: { type: Types.Array },
};
