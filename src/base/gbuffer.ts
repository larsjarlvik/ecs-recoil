import { vec3 } from 'gl-matrix';
import GL from 'global/gl';
import Camera from 'global/camera';
import * as shader from 'base/shader';
import { createQuad, Quad } from 'models/quad';
import { UniformBuffer } from './UniformBuffer';

const gl = GL.Instance;
const camera = Camera.Instance;

interface Uniforms {
    eyePosition: vec3;
}

export class GBuffer {
    fb: WebGLFramebuffer;
    textures: WebGLTexture[];

    shaderProgram: WebGLProgram;
    positionTarget: WebGLTexture | null;
    normalTarget: WebGLTexture | null;
    tangentTarget: WebGLTexture | null;
    baseColorTarget: WebGLTexture | null;
    normalMapTarget: WebGLTexture | null;

    positionLocation: WebGLUniformLocation;
    normalLocation: WebGLUniformLocation;
    tangentLocation: WebGLUniformLocation;
    baseColorLocation: WebGLUniformLocation;
    normalMapLocation: WebGLUniformLocation;

    eyePosition: WebGLUniformLocation;

    uniformBuffer: UniformBuffer<Uniforms>;
    renderQuad: Quad;

    private createBufferTexture(internalFormat: number, attachment: number) {
        gl.getExtension('EXT_color_buffer_float');

        const target = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, target);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texStorage2D(gl.TEXTURE_2D, 1, internalFormat, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, target, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return target;
    }

    constructor() {
        this.renderQuad = createQuad();

        this.shaderProgram = shader.createProgram();
        gl.attachShader(this.shaderProgram, shader.compileShader(require('shaders/main.vs.glsl'), gl.VERTEX_SHADER));
        gl.attachShader(this.shaderProgram, shader.compileShader(require('shaders/main.fs.glsl'), gl.FRAGMENT_SHADER));
        shader.linkProgram(this.shaderProgram);

        gl.useProgram(this.shaderProgram);

        this.positionLocation = gl.getUniformLocation(this.shaderProgram, 'uPositionBuffer')!;
        this.normalLocation = gl.getUniformLocation(this.shaderProgram, 'uNormalBuffer')!;
        this.tangentLocation = gl.getUniformLocation(this.shaderProgram, 'uTangentBuffer')!;
        this.baseColorLocation = gl.getUniformLocation(this.shaderProgram, 'uBaseColor')!;
        this.normalMapLocation = gl.getUniformLocation(this.shaderProgram, 'uNormalMap')!;
        this.uniformBuffer = new UniformBuffer(gl.getUniformBlockIndex(this.shaderProgram, 'uData'));

        this.fb = gl.createFramebuffer()!;
        this.bind();

        gl.activeTexture(gl.TEXTURE0);
        this.positionTarget = this.createBufferTexture(gl.RGBA16F, gl.COLOR_ATTACHMENT0);
        this.normalTarget = this.createBufferTexture(gl.RGBA16F, gl.COLOR_ATTACHMENT1);
        this.tangentTarget = this.createBufferTexture(gl.RGBA16F, gl.COLOR_ATTACHMENT2);
        this.baseColorTarget = this.createBufferTexture(gl.RGBA16F, gl.COLOR_ATTACHMENT3);
        this.normalMapTarget = this.createBufferTexture(gl.RGBA16F, gl.COLOR_ATTACHMENT4);
        this.createBufferTexture(gl.DEPTH_COMPONENT16, gl.DEPTH_ATTACHMENT);

        gl.drawBuffers([
            gl.COLOR_ATTACHMENT0,
            gl.COLOR_ATTACHMENT1,
            gl.COLOR_ATTACHMENT2,
            gl.COLOR_ATTACHMENT3,
            gl.COLOR_ATTACHMENT4,
        ]);

        gl.uniform1i(this.positionLocation, 0);
        gl.uniform1i(this.normalLocation, 1);
        gl.uniform1i(this.tangentLocation, 2);
        gl.uniform1i(this.baseColorLocation, 3);
        gl.uniform1i(this.normalMapLocation, 4);

        this.unbind();
    }

    public bind() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
    }

    public unbind() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    public render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(this.shaderProgram);

        this.uniformBuffer.set({
            eyePosition: camera.position,
        });

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.positionTarget);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.normalTarget);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.tangentTarget);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.baseColorTarget);
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, this.normalMapTarget);

        gl.enableVertexAttribArray(0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.renderQuad.vertexBuffer);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, this.renderQuad.length);
    }
}
