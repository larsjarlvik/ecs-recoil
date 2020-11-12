import GL from 'global/gl';
import * as shader from 'base/shader';
import { createQuad, Quad } from 'models/quad';
import Camera from 'global/camera';

const gl = GL.Instance;
const camera = Camera.Instance;

export class GBuffer {
    fb: WebGLFramebuffer;
    textures: WebGLTexture[];

    uniforms

    shaderProgram: WebGLProgram;
    positionTarget: WebGLTexture | null;
    normalTarget: WebGLTexture | null;
    uvTarget: WebGLTexture | null;

    positionLocation: WebGLUniformLocation;
    normalLocation: WebGLUniformLocation;
    uvLocation: WebGLUniformLocation;
    modelView: WebGLUniformLocation;
    projection: WebGLUniformLocation;
    eyePosition: WebGLUniformLocation;

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
        this.uvLocation = gl.getUniformLocation(this.shaderProgram, 'uUVBuffer')!;

        this.modelView = gl.getUniformLocation(this.shaderProgram, 'modelView')!;
        this.projection = gl.getUniformLocation(this.shaderProgram, 'projection')!;
        this.eyePosition = gl.getUniformLocation(this.shaderProgram, 'eyePosition')!;

        this.fb = gl.createFramebuffer()!;
        this.bind();

        gl.activeTexture(gl.TEXTURE0);
        this.positionTarget = this.createBufferTexture(gl.RGBA16F, gl.COLOR_ATTACHMENT0);
        this.normalTarget = this.createBufferTexture(gl.RGBA16F, gl.COLOR_ATTACHMENT1);
        this.uvTarget = this.createBufferTexture(gl.RG16F, gl.COLOR_ATTACHMENT2);
        this.createBufferTexture(gl.DEPTH_COMPONENT16, gl.DEPTH_ATTACHMENT);

        gl.drawBuffers([
            gl.COLOR_ATTACHMENT0,
            gl.COLOR_ATTACHMENT1,
            gl.COLOR_ATTACHMENT2,
        ]);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.positionTarget);
        gl.uniform1i(this.positionLocation, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.normalTarget);
        gl.uniform1i(this.normalLocation, 1);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.uvTarget);
        gl.uniform1i(this.uvLocation, 2);

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

        gl.uniformMatrix4fv(this.modelView, false, camera.modelView);
        gl.uniformMatrix4fv(this.projection, false, camera.projection);
        gl.uniform3f(this.eyePosition, 0, 0, -camera.distance);

        gl.enableVertexAttribArray(0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.renderQuad.vertexBuffer);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, this.renderQuad.length);
    }
}
