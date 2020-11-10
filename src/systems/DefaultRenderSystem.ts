import { Entity, System } from 'ecsy';
import GL from 'global/gl';
import { Renderable } from 'components/TagComponents';
import { Model } from 'components/Model';
import { Material } from 'components/Material';
import * as shader from 'base/shader';
import { Position } from 'components/Position';
import { UniformBuffer } from 'base/UniformBuffer';
import { mat4, vec3, vec4 } from 'gl-matrix';
import Camera from 'global/camera';

const gl = GL.Instance;
const camera = Camera.Instance;

interface MaterialBuffer {
    modelView: mat4;
    projection: mat4;
    color: vec4;
    position: vec3;
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
        const position = entity.getComponent(Position)!;

        this.uniformBuffer.set({
            modelView: camera.modelView,
            projection: camera.projection,
            color: vec4.fromValues(material.r, material.g, material.b, material.a),
            position: vec3.fromValues(position.x, position.y, position.z)
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

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
            gl.drawElements(gl.TRIANGLES, model.length, gl.UNSIGNED_SHORT,0);
        });
    }
}

DefaultRenderSystem.queries = {
    renderables: { components: [Renderable, Model] }
};
