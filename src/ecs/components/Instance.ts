import { Component, Types } from 'ecsy';
import { vec3 } from 'gl-matrix';

export interface Instance {
    position: vec3;
    rotation: number;
    scale: number;
}

export class Instances extends Component<Instances> {
    instances: Instance[];
}

Instances.schema = {
    instances: { type: Types.Ref },
};
