import { System } from 'ecsy';
import { Text } from 'ecs/components/Text';
import Scene from 'scene';
import * as engine from 'engine';

const scene = Scene.Instance;

export class UiSystem extends System {
    execute() {
        this.queries.texts.added!.forEach(entity => {
            const data = entity.getComponent(Text)!;
            const buffers = engine.text.createText(data.value, data.size);
            scene.root.ui.texts[entity.id] = {
                buffers,
                data,
            };
        });
    }
}

UiSystem.queries = {
    texts: { components: [Text], listen: { added: true, removed: true }  }
};
