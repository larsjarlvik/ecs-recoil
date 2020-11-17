import { System } from 'ecsy';
import { vec3 } from 'gl-matrix';
import { Spin } from 'components/TagComponents';
import { Transform } from 'components/Transform';

const speed = 0.001;

export class SpinnerSystem extends System {
    execute(delta: number) {
        this.queries.spinnable.results.forEach(entity => {
            const transform = entity.getMutableComponent(Transform)!;
            transform.rotation = vec3.fromValues(
                transform.rotation[0] + speed * delta,
                transform.rotation[1] + speed * delta,
                transform.rotation[2] + speed * delta,
            );
        });
    }
}

SpinnerSystem.queries = {
    spinnable: { components: [Spin, Transform] }
};
