import GL from 'global/gl';
import Camera from 'global/camera';
import Scene from 'global/scene';
import * as shader from 'base/shader';
import { UniformBufferWrapper } from 'base/UniformBuffer';

const gl = GL.Instance;
const camera = Camera.Instance;

export class DefaultRenderer {
    private shaderProgram: WebGLProgram;
    private uniformBuffer: UniformBufferWrapper;
    private baseColorLocation: WebGLUniformLocation;
    private normalMapLocation: WebGLUniformLocation;
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
        this.shaderProgram = shader.createProgram();
        gl.attachShader(this.shaderProgram, shader.compileShader(require('shaders/default.vs.glsl'), gl.VERTEX_SHADER));
        gl.attachShader(this.shaderProgram, shader.compileShader(require('shaders/default.fs.glsl'), gl.FRAGMENT_SHADER));
        shader.linkProgram(this.shaderProgram);

        this.uniformBuffer = new UniformBufferWrapper(gl.getUniformBlockIndex(this.shaderProgram, 'uData'));

        this.baseColorLocation = gl.getUniformLocation(this.shaderProgram, 'uBaseColor')!;
        this.normalMapLocation = gl.getUniformLocation(this.shaderProgram, 'uNormalMap')!;

        gl.uniform1i(this.baseColorLocation, 0);
        gl.uniform1i(this.normalMapLocation, 1);
    }

    public render() {
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