import { System } from 'ecsy';
import { mat4 } from 'gl-matrix';
import { Transform } from 'ecs/components/Transform';
import Scene from 'scene';

const scene = Scene.Instance;

export class TransformSystem extends System {
    execute() {
        this.queries.transforms.results.forEach((entity) => {
            const transform = entity.getComponent(Transform)!;
            const transformMatrix = mat4.create();

            if (transform.translation) mat4.translate(transformMatrix, transformMatrix, transform.translation);
            if (transform.rotation) {
                mat4.rotateX(transformMatrix, transformMatrix, transform.rotation[0]);
                mat4.rotateY(transformMatrix, transformMatrix, transform.rotation[1]);
                mat4.rotateZ(transformMatrix, transformMatrix, transform.rotation[2]);
            }

            scene.root.transforms[entity.id] = transformMatrix;
        });
    }
}

TransformSystem.queries = {
    transforms: { components: [Transform] }
};
