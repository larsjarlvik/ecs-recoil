import { System } from 'ecsy';
import { mat4 } from 'gl-matrix';
import Scene from 'global/scene';
import { Light } from 'components/Light';

const scene = Scene.Instance;

export class LightSystem extends System {
    execute() {
        this.queries.renderables.added!.forEach(entity => {
            const light = entity.getComponent(Light)!;
            scene.root.lights[entity.id] = light;
            scene.root.transforms[entity.id] = mat4.create();
        });

        this.queries.renderables.removed!.forEach(entity => {
            delete scene.root.lights[entity.id];
            delete scene.root.transforms[entity.id];
        });
    }
}

LightSystem.queries = {
    renderables: { components: [Light], listen: { added: true, removed: true } }
};
