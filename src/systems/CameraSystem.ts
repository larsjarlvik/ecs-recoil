import { System } from 'ecsy';
import { mat4, vec3 } from 'gl-matrix';
import { CameraMatrix, CameraPosition } from 'components/Camera';

export class CameraSystem extends System {
    execute() {
        this.queries.cameras.results.forEach(entity => {
            const position = entity.getComponent(CameraPosition);
            const modelViewProjection = entity.getMutableComponent(CameraMatrix);

            if (!position || !modelViewProjection) return;

            mat4.lookAt(modelViewProjection.modelView, position.position, vec3.fromValues(0.0, 0.0, 0.0), vec3.fromValues(0.0, 1.0, 0.0));
            mat4.perspective(modelViewProjection.projection, 45.0, 1.0, 0.1, 100.0);
        });
    }
}

CameraSystem.queries = {
    cameras: { components: [CameraPosition] }
};
