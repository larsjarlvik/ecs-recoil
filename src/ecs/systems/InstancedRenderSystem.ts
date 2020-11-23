import { System } from 'ecsy';
import { InstancedRender } from 'ecs/components/TagComponents';
import { Model } from 'ecs/components/Model';
import Scene from 'scene';
import { Instances } from 'ecs/components/Instance';
import { InstancedRenderer } from 'engine/renderers/InstancedRenderer';

const scene = Scene.Instance;

export class InstancedRenderSystem extends System {
    execute() {
        this.queries.renderables.added!.forEach(entity => {
            const model = entity.getComponent(Model)!;
            const instances = entity.getComponent(Instances)!;

            const positions: number[] = [];
            const rotScale: number[] = [];
            instances.instances.forEach(i => {
               positions.push(i.position[0]); positions.push(i.position[1]); positions.push(i.position[2]);
               rotScale.push(i.rotation); rotScale.push(i.scale);
            });

            scene.root.instancedModels[entity.id] = {
                model,
                position: InstancedRenderer.createBuffer(positions),
                rotScale: InstancedRenderer.createBuffer(rotScale),
                count: instances.instances.length,
            };
        });

        this.queries.renderables.removed!.forEach(entity => {
            delete scene.root.instancedModels[entity.id];
        });
    }
}

InstancedRenderSystem.queries = {
    renderables: { components: [InstancedRender, Model, Instances], listen: { added: true, removed: true } }
};
