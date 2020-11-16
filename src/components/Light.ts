import { Component, Types } from 'ecsy';
import { vec3 } from 'gl-matrix';

export class Light extends Component<Light> {
    color: vec3;
    range: number;
    intensity: number;
}

Light.schema = {
    color: { type: Types.Array },
    range: { type: Types.Number },
    intensity: { type: Types.Number },
};
