import { IComponent } from './component';
import { IAwake, IUpdate } from './lifecycle';

type constr<T> = { new(...args: unknown[]): T };

export abstract class Entity implements IUpdate, IAwake {
    protected _components: IComponent[] = [];

    public get Components(): IComponent[] {
        return this._components;
    }

    public AddComponent(component: IComponent) {
        this._components.push(component);
        component.Entity = this;
    }

    public GetComponent<C extends IComponent>(constr: constr<C>) {
        for (const component of this._components) {
            if (component instanceof constr) return component as IComponent;
        }

        throw new Error(`${constr.name} no found in entity ${this.constructor.name}!`);
    }

    public RemoveComponent<C extends IComponent>(constr: constr<C>) {
        let toRemove: IComponent | undefined;
        let index: number | undefined;

        for (let i = 0; i < this._components.length; i ++) {
            const component = this._components[i];
            if (component instanceof constr) {
                toRemove = component;
                index = i;
                break;
            }
        }

        if (toRemove && index) {
            toRemove.Entity = null;
            this._components.splice(index, 1);
        }
    }

    public HasComponent<C extends IComponent>(constr: constr<C>) {
        for (const component of this._components) {
            if (component instanceof constr) {
                return true;
            }
        }

        return false;
    }

    public Update(deltaTime: number): void {
        for(const component of this._components){
            component.Update(deltaTime);
        }
    }

    public Awake(): void {
        for(const component of this._components){
            component.Awake();
        }
    }
}