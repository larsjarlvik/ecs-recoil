import { Component, Types } from 'ecsy';
import { vec4 } from 'gl-matrix';

export class Text extends Component<Text> {
    value: string;
    color: vec4;
    buffer: number;
    gamma: number;
    size: number;
}

Text.schema = {
    value: { type: Types.String },
    color: { type: Types.Array },
    buffer: { type: Types.Number },
    gamma: { type: Types.Number },
    size: { type: Types.Number },
};
