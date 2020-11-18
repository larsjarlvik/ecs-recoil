import { System } from 'ecsy';
import { mat4 } from 'gl-matrix';
import { Renderable } from 'ecs/components/TagComponents';
import { Model } from 'ecs/components/Model';
import Scene from 'scene';


const scene = Scene.Instance;

export class DefaultRenderSystem extends System {
    execute() {
        this.queries.renderables.added!.forEach(entity => {
            const model = entity.getComponent(Model)!;
            scene.root.models[entity.id] = model;
            scene.root.transforms[entity.id] = mat4.create();
        });

        this.queries.renderables.removed!.forEach(entity => {
            delete scene.root.models[entity.id];
            delete scene.root.transforms[entity.id];
        });
    }
}

DefaultRenderSystem.queries = {
    renderables: { components: [Renderable, Model], listen: { added: true, removed: true } }
};
