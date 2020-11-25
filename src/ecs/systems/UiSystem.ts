import { System } from 'ecsy';
import { Text } from 'ecs/components/Text';
import Scene from 'scene';
import * as engine from 'engine';

const scene = Scene.Instance;

export class UiSystem extends System {
    execute() {
        this.queries.texts.removed!.forEach(entity => {
            delete scene.root.ui.texts[entity.id];
        });

        this.queries.texts.results.forEach(entity => {
            if (!scene.root.ui.font) return;
            const data = entity.getComponent(Text)!;

            if (!scene.root.ui.texts[entity.id] ||
                scene.root.ui.texts[entity.id].data.value !== data.value ||
                scene.root.ui.texts[entity.id].data.color !== data.color ||
                scene.root.ui.texts[entity.id].data.size !== data.size) {

                scene.root.ui.texts[entity.id] = {
                    buffers: engine.text.createText(scene.root.ui.font.metrics, data.value, data.size),
                    data: { ...data },
                };
            }
        });
    }
}

UiSystem.queries = {
    texts: { components: [Text], listen: { removed: true }  }
};
