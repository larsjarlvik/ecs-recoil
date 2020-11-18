import GL from 'engine/gl';
import Scene from 'scene';
import { UniformBufferWrapper } from 'engine/utils/UniformBuffer';
import Camera from 'camera';
import { shader, ShaderType } from 'engine';

const gl = GL.Instance;

export class DefaultRenderer {
    private shaderProgram: WebGLProgram;
    private uniformBuffer: UniformBufferWrapper;
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
        this.shaderProgram = shader.createProgram();
        shader.attachShader(this.shaderProgram, require('shaders/default.vs.glsl'), ShaderType.Vertex);
        shader.attachShader(this.shaderProgram, require('shaders/default.fs.glsl'), ShaderType.Fragment);
        shader.linkProgram(this.shaderProgram);

        this.uniformBuffer = new UniformBufferWrapper(gl.getUniformBlockIndex(this.shaderProgram, 'uData'));

        gl.useProgram(this.shaderProgram);
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, 'uBaseColor')!, 0);
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, 'uNormalMap')!, 1);
    }

    public render(camera: Camera) {
        gl.useProgram(this.shaderProgram);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.enableVertexAttribArray(3);

        Object.keys(this.scene.root.models).forEach(key => {
            const model = this.scene.root.models[key];

            this.uniformBuffer.set({
                modelView: { type: 'mat', value: camera.modelView },
                projection: { type: 'mat', value: camera.projection },
                transform: { type: 'mat', value: this.scene.root.transforms[key] },
            });

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, model.baseColorTexture);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, model.normalTexture);

            gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
            gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, model.tangentBuffer);
            gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, model.uvBuffer);
            gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
            gl.drawElements(gl.TRIANGLES, model.length, gl.UNSIGNED_SHORT,0);
        });

        gl.disableVertexAttribArray(1);
        gl.disableVertexAttribArray(2);
        gl.disableVertexAttribArray(3);
    }
}