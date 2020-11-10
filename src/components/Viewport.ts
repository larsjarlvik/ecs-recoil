import { Component, Types } from 'ecsy';

export class Viewport extends Component<Viewport> {
    width: number;
    height: number;
}

Viewport.schema = {
    width: { type: Types.Number },
    height: { type: Types.Number },
};
