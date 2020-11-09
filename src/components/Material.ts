import { Component, Types } from 'ecsy';

export class Material extends Component<Material> {
    r: number;
    g: number;
    b: number;
    a: number;
}

Material.schema = {
    r: { type: Types.Number },
    g: { type: Types.Number },
    b: { type: Types.Number },
    a: { type: Types.Number },
};
