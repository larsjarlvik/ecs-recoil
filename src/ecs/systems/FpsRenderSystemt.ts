import { System } from 'ecsy';
import { FpsCounter } from 'ecs/components/TagComponents';
import { Text } from 'ecs/components/Text';
import Scene from 'scene';

const scene = Scene.Instance;

export class FpsRenderSystem extends System {
    execute() {
        this.queries.fpsCounters.results.forEach(entity => {
            const text = entity.getMutableComponent(Text)!;
            text.value = `FPS: ${scene.root.fps.fps}`;
        });
    }
}

FpsRenderSystem.queries = {
    fpsCounters: { components: [FpsCounter, Text] }
};
