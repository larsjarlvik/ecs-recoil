import { Component, Types } from 'ecsy';

export class Position extends Component<Position> {
    x: number;
    y: number;
    z: number;
}

Position.schema = {
    x: { type: Types.Number },
    y: { type: Types.Number },
    z: { type: Types.Number },
};
