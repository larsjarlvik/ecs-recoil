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
            const data = entity.getComponent(Text)!;

            if (!scene.root.ui.texts[entity.id] || scene.root.ui.texts[entity.id].data.value !== data.value) {
                const buffers = engine.text.createText(data.value, data.size);
                scene.root.ui.texts[entity.id] = {
                    buffers,
                    data: { ...data },
                };
            }
        });
    }
}

UiSystem.queries = {
    texts: { components: [Text], listen: { removed: true }  }
};
