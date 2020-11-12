import * as gltf from 'webgl-gltf';
import GL from 'global/gl';

const gl = GL.Instance;

export const loadModel = async (name: string) => {
    const model = await gltf.loadModel(gl, `/models/${name}/${name}.gltf`);

    return {
        vertexBuffer: model.meshes[0].positions.buffer,
        normalBuffer: model.meshes[0].normals!.buffer,
        uvBuffer: model.meshes[0].texCoord!.buffer,
        indexBuffer: model.meshes[0].indices!,
        baseColorTexture: model.materials[0].baseColorTexture,
        length: model.meshes[0].elementCount,
    };
};

