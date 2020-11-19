import * as gltf from 'webgl-gltf';
import GL from 'engine/gl';
import { Model } from 'ecs/components/Model';

const gl = GL.Instance;

export const loadModel = async (path: string) => {
    const model = await gltf.loadModel(gl, `/models/${path}.gltf`);

    return {
        vertexBuffer: model.meshes[0].positions.buffer,
        normalBuffer: model.meshes[0].normals!.buffer,
        tangentBuffer: model.meshes[0].tangents!.buffer,
        uvBuffer: model.meshes[0].texCoord!.buffer,
        indexBuffer: model.meshes[0].indices!,
        baseColorTexture: model.materials[0].baseColorTexture,
        ormTexture: model.materials[0].metallicRoughnessTexture,
        normalTexture: model.materials[0].normalTexture,
        hasNormalTexture: model.materials[0].normalTexture != null,
        hasOrmTexture: model.materials[0].metallicRoughnessTexture != null,
        metallicFactor: model.materials[0].metallicFactor,
        roughnessFactor: model.materials[0].roughnessFactor,
        length: model.meshes[0].elementCount,
    } as Model;
};

