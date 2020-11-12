import * as gltf from 'webgl-gltf';
import GL from 'global/gl';
import { Model } from 'components/Model';

const gl = GL.Instance;

export const loadModel = async (name: string) => {
    const model = await gltf.loadModel(gl, `/models/${name}/${name}.gltf`);

    return {
        vertexBuffer: model.meshes[0].positions.buffer,
        normalBuffer: model.meshes[0].normals!.buffer,
        tangentBuffer: model.meshes[0].tangents!.buffer,
        uvBuffer: model.meshes[0].texCoord!.buffer,
        indexBuffer: model.meshes[0].indices!,
        baseColorTexture: model.materials[0].baseColorTexture,
        normalTexture: model.materials[0].normalTexture,
        length: model.meshes[0].elementCount,
    } as Model;
};

