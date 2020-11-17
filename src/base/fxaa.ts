import GL from 'global/gl';
import * as shader from 'base/shader';
import { createQuad, Quad } from 'models/quad';

const gl = GL.Instance;

export class Fxaa {
    renderQuad: Quad;
    shaderProgram: WebGLProgram;
    resolutionLocation: WebGLUniformLocation;
    colorLocation: WebGLUniformLocation;
    frameBuffer: WebGLFramebuffer;
    colorTarget: WebGLTexture | null;

    buildColorTexture() {
        const texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.drawingBufferWidth, gl.drawingBufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        return texture;
    }

    constructor() {
        this.renderQuad = createQuad();

        this.shaderProgram = shader.createProgram();
        gl.attachShader(this.shaderProgram, shader.compileShader(require('shaders/fxaa.vs.glsl'), gl.VERTEX_SHADER));
        gl.attachShader(this.shaderProgram, shader.compileShader(require('shaders/fxaa.fs.glsl'), gl.FRAGMENT_SHADER));
        shader.linkProgram(this.shaderProgram);

        gl.useProgram(this.shaderProgram);

        this.resolutionLocation = gl.getUniformLocation(this.shaderProgram, 'uResolution')!;
        this.colorLocation = gl.getUniformLocation(this.shaderProgram, 'uColor')!;

        gl.uniform1i(this.colorLocation, 0);
        gl.uniform2f(this.resolutionLocation, gl.drawingBufferWidth, gl.drawingBufferHeight);

        this.frameBuffer = gl.createFramebuffer()!;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        this.colorTarget = this.buildColorTexture();

        window.addEventListener('viewportResize', () => {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
            gl.uniform2f(this.resolutionLocation, gl.drawingBufferWidth, gl.drawingBufferHeight);
            this.colorTarget = this.buildColorTexture();
        });
    }

    public bind() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    }

    public render() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(this.shaderProgram);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.colorTarget);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.renderQuad.vertexBuffer);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, this.renderQuad.length);
    }
}