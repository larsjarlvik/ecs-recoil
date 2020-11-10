import { Entity, System } from 'ecsy';
import GL from 'base/gl';
import { Renderable } from 'components/TagComponents';
import { Model } from 'components/Model';
import { Material } from 'components/Material';
import * as shader from 'base/shader';
import { Position } from 'components/Position';
import { UniformBuffer } from 'base/UniformBuffer';
import { mat4, vec3, vec4 } from 'gl-matrix';
import { CameraMatrix } from 'components/Camera';

const gl = GL.Instance;

export class DefaultRenderSystem extends System {
    shaderProgram: WebGLProgram;
    uniformBuffer: UniformBuffer;

    init() {
        this.shaderProgram = shader.createProgram();
        gl.attachShader(this.shaderProgram, shader.compileShader(require('shaders/default.vs.glsl'), gl.VERTEX_SHADER));
        gl.attachShader(this.shaderProgram, shader.compileShader(require('shaders/default.fs.glsl'), gl.FRAGMENT_SHADER));
        shader.linkProgram(this.shaderProgram);

        this.uniformBuffer = new UniformBuffer([
            ...vec4.create(),
            ...vec3.create(),
            ...mat4.create(),
            ...mat4.create(),
        ], gl.getUniformBlockIndex(this.shaderProgram, 'uData'));
    }

    update(entity: Entity) {
        const camera = entity.getComponent(CameraMatrix);
        const material = entity.getComponent(Material);

        if (!camera) {
            throw new Error('No camera object!');
        }

        this.uniformBuffer.update(camera.modelView, 0);
        this.uniformBuffer.update(camera.projection, 16);

        if (material) {
            this.uniformBuffer.update([material.r, material.g, material.b, material.a], 32);
        }

        const position = entity.getComponent(Position);
        this.uniformBuffer.update(position
            ? [position.x, position.y, position.z]
            : [0.0, 0.0, 0.0]
        , 36);
    }

    execute() {
        gl.useProgram(this.shaderProgram);

        this.queries.renderables.results.forEach(entity => {
            const model = entity.getComponent(Model)!;

            this.update(entity);

            gl.enableVertexAttribArray(0);
            gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
            gl.drawElements(gl.TRIANGLES, model.length, gl.UNSIGNED_SHORT,0);
        });
    }
}

DefaultRenderSystem.queries = {
    renderables: { components: [Renderable, Model, CameraMatrix] }
};
