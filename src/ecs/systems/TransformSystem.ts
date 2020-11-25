import { System } from 'ecsy';
import { mat4 } from 'gl-matrix';
import { Transform } from 'ecs/components/Transform';
import Scene from 'scene';

const scene = Scene.Instance;

export class TransformSystem extends System {
    private transformMatrix: mat4;

    execute() {
        this.queries.transforms.results.forEach((entity) => {
            const transform = entity.getComponent(Transform)!;
            this.transformMatrix = mat4.create();

            if (transform.translation.length) mat4.translate(this.transformMatrix, this.transformMatrix, transform.translation);
            if (transform.rotation.length) {
                mat4.rotateX(this.transformMatrix, this.transformMatrix, transform.rotation[0]);
                mat4.rotateY(this.transformMatrix, this.transformMatrix, transform.rotation[1]);
                mat4.rotateZ(this.transformMatrix, this.transformMatrix, transform.rotation[2]);
            }

            scene.root.transforms[entity.id] = this.transformMatrix;
        });
    }
}

TransformSystem.queries = {
    transforms: { components: [Transform] }
};
