import GL from 'global/gl';
import * as shader from 'base/shader';

const gl = GL.Instance;

export class GBuffer {
    fb: WebGLFramebuffer;
    textures: WebGLTexture[];
    shaderProgram: WebGLProgram;
    positionTarget: WebGLTexture | null;
    normalTarget: WebGLTexture | null;
    uvTarget: WebGLTexture | null;

    private createBufferTexture(internalFormat: number, attachment: number) {
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
        this.shaderProgram = shader.createProgram();
        gl.attachShader(this.shaderProgram, shader.compileShader(require('shaders/main.vs.glsl'), gl.VERTEX_SHADER));
        gl.attachShader(this.shaderProgram, shader.compileShader(require('shaders/main.fs.glsl'), gl.FRAGMENT_SHADER));
        shader.linkProgram(this.shaderProgram);

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

        this.unbind();
    }

    public async bla() {
        return new Promise((resolve) => {
            const image = new Image();

            image.onload = () => {
                const colorTexture = gl.createTexture();

                gl.bindTexture(gl.TEXTURE_2D, colorTexture);

                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

                const levels = Math.floor(Math.log2(Math.max(this.width, this.height))) + 1;
                gl.texStorage2D(gl.TEXTURE_2D, levels, gl.RGBA8, image.width, image.height);
                gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, image.width, image.height, gl.RGBA, gl.UNSIGNED_BYTE, image);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.generateMipmap(gl.TEXTURE_2D);

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.positionTarget);
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, this.normalTarget);
                gl.activeTexture(gl.TEXTURE2);
                gl.bindTexture(gl.TEXTURE_2D, this.uvTarget);
                gl.activeTexture(gl.TEXTURE3);
                gl.bindTexture(gl.TEXTURE_2D, colorTexture);

                gl.useProgram(mainProgram);
                gl.uniform3fv(eyePositionLocation, eyePosition);
                gl.uniform1i(positionBufferLocation, 0);
                gl.uniform1i(normalBufferLocation, 1);
                gl.uniform1i(uVBufferLocation, 2);
                gl.uniform1i(textureMapLocation, 3);

                resolve();
            };
        });
    }

    public bind() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
    }

    public unbind() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
    }
}
