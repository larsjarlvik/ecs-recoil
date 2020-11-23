import { Component, Types } from 'ecsy';
import { vec2, vec4 } from 'gl-matrix';

export class Text extends Component<Text> {
    value: string;
    color: vec4;
    position: vec2;
    size: number;
}

Text.schema = {
    value: { type: Types.String },
    color: { type: Types.Array },
    position: { type: Types.Array },
    size: { type: Types.Number },
};
