import { Entity } from './entity';
import { IAwake, IUpdate } from './lifecycle';

export interface IComponent extends IUpdate, IAwake {
    Entity: Entity | null;
}