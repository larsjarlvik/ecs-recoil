import GL from 'engine/gl';
import Scene from 'scene';
import { UniformBufferWrapper } from 'engine/utils/UniformBuffer';
import { shader, ShaderType } from 'engine';
import Camera from 'camera';
import { vec4 } from 'gl-matrix';

const gl = GL.Instance;

export class TextRenderer {
    private shaderProgram: WebGLProgram;
    private uniformBuffer: UniformBufferWrapper;
    private scene: Scene;
    private projectionLocation: WebGLUniformLocation;

    constructor(scene: Scene) {
        this.scene = scene;
        this.shaderProgram = shader.createProgram();
        shader.attachShader(this.shaderProgram, require('shaders/text.vs.glsl'), ShaderType.Vertex);
        shader.attachShader(this.shaderProgram, require('shaders/text.fs.glsl'), ShaderType.Fragment);
        shader.linkProgram(this.shaderProgram);

        this.uniformBuffer = new UniformBufferWrapper(gl.getUniformBlockIndex(this.shaderProgram, 'uData'));
        this.projectionLocation = gl.getUniformLocation(this.shaderProgram, 'projection')!;

        gl.useProgram(this.shaderProgram);
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, 'uTexture')!, 0);
    }

    public static createFontTexture(img: HTMLImageElement) {
        const texture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gl.LUMINANCE, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return { texture, width: img.width, height: img.height };
    }

    public render() {
        const font = this.scene.root.ui.font;
        if (!font) return;

        gl.enable(gl.BLEND);
        gl.useProgram(this.shaderProgram);
        gl.enableVertexAttribArray(1);

        gl.uniformMatrix4fv(this.projectionLocation, false, Camera.Instance.projection);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, font.texture);

        Object.keys(this.scene.root.ui.texts).forEach(key => {
            const text = this.scene.root.ui.texts[key];

            this.uniformBuffer.set({
                buffer: { type: 'float', value: 192 / 256 },
                gamma: { type: 'float', value: 1.6 * 1.4142 / text.data.size },
                positionTextureSize: { type: 'vec', value: vec4.fromValues(text.data.position[0], text.data.position[1], font.width, font.height) },
                color: { type: 'vec', value: text.data.color },
            });

            gl.bindBuffer(gl.ARRAY_BUFFER, text.buffers.vertexBuffer);
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, text.buffers.texCoordBuffer);
            gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLES, 0, text.buffers.length);
        });

        gl.disableVertexAttribArray(1);
        gl.disable(gl.BLEND);
    }
}