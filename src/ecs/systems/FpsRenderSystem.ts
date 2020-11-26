import { System } from 'ecsy';
import { FpsCounter } from 'ecs/components/TagComponents';
import { Text } from 'ecs/components/Text';
import Scene from 'scene';
import { vec4 } from 'gl-matrix';

const scene = Scene.Instance;

export class FpsRenderSystem extends System {
    execute() {
        this.queries.fpsCounters.results.forEach(entity => {
            const text = entity.getMutableComponent(Text)!;
            text.value = `FPS: ${scene.root.fps.fps} - ${scene.root.fps.frameTime} ms`;

            const x = Math.min(scene.root.fps.fps / 60, 1.0);
            text.color = vec4.fromValues(2.0 * (1 - x), 2.0 * x, 0.0, 1.0);
        });
    }
}

FpsRenderSystem.queries = {
    fpsCounters: { components: [FpsCounter, Text] }
};
