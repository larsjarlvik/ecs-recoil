import { Entity, System } from 'ecsy';
import GL from 'global/gl';
import { Renderable } from 'components/TagComponents';
import { Model } from 'components/Model';
import { Material } from 'components/Material';
import * as shader from 'base/shader';
import { Transform } from 'components/Transform';
import { UniformBuffer } from 'base/UniformBuffer';
import { mat4, vec4 } from 'gl-matrix';
import Camera from 'global/camera';

const gl = GL.Instance;
const camera = Camera.Instance;

interface MaterialBuffer {
    modelView: mat4;
    projection: mat4;
    color: vec4;
    transform: mat4;
}

export class DefaultRenderSystem extends System {
    shaderProgram: WebGLProgram;
    uniformBuffer: UniformBuffer<MaterialBuffer>;

    init() {
        this.shaderProgram = shader.createProgram();
        gl.attachShader(this.shaderProgram, shader.compileShader(require('shaders/default.vs.glsl'), gl.VERTEX_SHADER));
        gl.attachShader(this.shaderProgram, shader.compileShader(require('shaders/default.fs.glsl'), gl.FRAGMENT_SHADER));
        shader.linkProgram(this.shaderProgram);

        this.uniformBuffer = new UniformBuffer(gl.getUniformBlockIndex(this.shaderProgram, 'uData'));
    }

    update(entity: Entity) {
        const material = entity.getComponent(Material)!;
        const transform = entity.getComponent(Transform);

        const transformMatrix = mat4.create();
        if (transform) {
            if (transform.translation) mat4.translate(transformMatrix, transformMatrix, transform.translation);
            if (transform.rotation) {
                mat4.rotateX(transformMatrix, transformMatrix, transform.rotation[0]);
                mat4.rotateY(transformMatrix, transformMatrix, transform.rotation[1]);
                mat4.rotateZ(transformMatrix, transformMatrix, transform.rotation[2]);
            }
        }

        this.uniformBuffer.set({
            modelView: camera.modelView,
            projection: camera.projection,
            color: vec4.fromValues(material.r, material.g, material.b, material.a),
            transform: transformMatrix,
        });
    }

    execute() {
        gl.useProgram(this.shaderProgram);

        this.queries.renderables.results.forEach(entity => {
            const model = entity.getComponent(Model)!;

            this.update(entity);

            gl.enableVertexAttribArray(0);
            gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

            gl.enableVertexAttribArray(1);
            gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
            gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
            gl.drawElements(gl.TRIANGLES, model.length, gl.UNSIGNED_SHORT,0);
        });
    }
}

DefaultRenderSystem.queries = {
    renderables: { components: [Renderable, Model] }
};
