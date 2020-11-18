import * as gltf from 'webgl-gltf';
import GL from 'engine/gl';
import { Model } from 'ecs/components/Model';

const gl = GL.Instance;

const getNormalTexture = (material: gltf.Material) => {
    if (material.normalTexture !== null) return material.normalTexture;

    const data = new Uint8Array([255, 255, 255, 255]);
    const placeholder = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, placeholder);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    return placeholder;
};

export const loadModel = async (path: string) => {
    const model = await gltf.loadModel(gl, `/models/${path}.gltf`);

    return {
        vertexBuffer: model.meshes[0].positions.buffer,
        normalBuffer: model.meshes[0].normals!.buffer,
        tangentBuffer: model.meshes[0].tangents!.buffer,
        uvBuffer: model.meshes[0].texCoord!.buffer,
        indexBuffer: model.meshes[0].indices!,
        baseColorTexture: model.materials[0].baseColorTexture,
        normalTexture: getNormalTexture(model.materials[0]),
        length: model.meshes[0].elementCount,
    } as Model;
};

