import { System } from 'ecsy';
import { mat4 } from 'gl-matrix';
import settings from 'settings';
import Scene from 'scene';
import { Light } from 'ecs/components/Light';

const scene = Scene.Instance;

export class LightSystem extends System {
    deleteLight(id: number) {
        delete scene.root.lights[id];
        delete scene.root.transforms[id];
        scene.root.lightCount = Object.keys(scene.root.lights).length;
    }

    execute() {
        this.queries.renderables.added!.forEach(entity => {
            const light = entity.getComponent(Light)!;
            const ids = Object.keys(scene.root.lights);

            if (ids.length >= settings.maxLights) {
                this.deleteLight(parseInt(ids[0]));
            }

            scene.root.lights[entity.id] = light;
            scene.root.transforms[entity.id] = mat4.create();
            scene.root.lightCount = Object.keys(scene.root.lights).length;
        });

        this.queries.renderables.removed!.forEach(entity => {
            this.deleteLight(entity.id);
        });
    }
}

LightSystem.queries = {
    renderables: { components: [Light], listen: { added: true, removed: true } }
};
