import GL from 'engine/gl';
import Scene from 'scene';
import { UniformBufferWrapper } from 'engine/utils/UniformBuffer';
import Camera from 'camera';
import { shader, ShaderType } from 'engine';
import { mat4 } from 'gl-matrix';

const gl = GL.Instance;

export class InstancedRenderer {
    private shaderProgram: WebGLProgram;
    private uniformBuffer: UniformBufferWrapper;
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
        this.shaderProgram = shader.createProgram();
        shader.attachShader(this.shaderProgram, require('shaders/default.instanced.vs.glsl'), ShaderType.Vertex);
        shader.attachShader(this.shaderProgram, require('shaders/default.fs.glsl'), ShaderType.Fragment);
        shader.linkProgram(this.shaderProgram);

        this.uniformBuffer = new UniformBufferWrapper(gl.getUniformBlockIndex(this.shaderProgram, 'uData'));

        gl.useProgram(this.shaderProgram);
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, 'uBaseColor')!, 0);
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, 'uOrm')!, 1);
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, 'uNormalMap')!, 2);
    }

    public static createBuffer(arr: number[]) {
        const buffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.DYNAMIC_DRAW);
        return buffer;
    }

    public render(camera: Camera) {
        gl.useProgram(this.shaderProgram);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.enableVertexAttribArray(3);
        gl.enableVertexAttribArray(4);
        gl.enableVertexAttribArray(5);

        Object.keys(this.scene.root.instancedModels).forEach(key => {
            const instances = this.scene.root.instancedModels[key];

            this.uniformBuffer.set({
                modelView: { type: 'mat', value: camera.modelView },
                projection: { type: 'mat', value: camera.projection },
                transform: { type: 'mat', value: mat4.create() },
                hasNormalMap: { type: 'float', value: instances.model.normalTexture !== null ? 1.0 : 0.0 },
                hasOrmTexture: { type: 'float', value: instances.model.ormTexture !== null ? 1.0 : 0.0 },
                metallic: { type: 'float', value: instances.model.metallicFactor },
                roughness: { type: 'float', value: instances.model.roughnessFactor },
            });

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, instances.model.baseColorTexture);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, instances.model.ormTexture);
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, instances.model.normalTexture);

            gl.bindBuffer(gl.ARRAY_BUFFER, instances.model.vertexBuffer);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, instances.model.normalBuffer);
            gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, instances.model.tangentBuffer);
            gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, instances.model.uvBuffer);
            gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, instances.position);
            gl.vertexAttribPointer(4, 3, gl.FLOAT, false, 0, 0);
            gl.vertexAttribDivisor(4, 1);

            gl.bindBuffer(gl.ARRAY_BUFFER, instances.rotScale);
            gl.vertexAttribPointer(5, 2, gl.FLOAT, false, 0, 0);
            gl.vertexAttribDivisor(5, 1);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, instances.model.indexBuffer);
            gl.drawElementsInstanced(gl.TRIANGLES, instances.model.length, gl.UNSIGNED_SHORT, 0, instances.count);
        });


        gl.disableVertexAttribArray(1);
        gl.disableVertexAttribArray(2);
        gl.disableVertexAttribArray(3);
        gl.disableVertexAttribArray(4);
        gl.disableVertexAttribArray(5);
    }
}