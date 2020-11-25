import { mat4, vec3 } from 'gl-matrix';
import Scene from 'scene';
import Camera from 'camera';
import settings from 'settings';
import GL from 'engine/gl';
import * as shader from 'engine/utils/shader';
import { createQuad, Quad } from 'engine/utils/quad';
import { UniformBufferItem, UniformBufferWrapper } from 'engine/utils/UniformBuffer';
import { Environment } from 'engine/utils/environment';

const gl = GL.Instance;

export class GBuffer {
    scene: Scene;
    framebuffer: WebGLFramebuffer;
    textures: WebGLTexture[];

    shaderProgram: WebGLProgram;
    positionTarget: WebGLTexture | null;
    normalTarget: WebGLTexture | null;
    baseColorTarget: WebGLTexture | null;
    ormTarget: WebGLTexture | null;
    depthTarget: WebGLTexture | null;

    eyePosition: WebGLUniformLocation;

    uniformBuffer: UniformBufferWrapper;
    renderQuad: Quad;
    lightUniforms: any;

    private createBufferTexture(internalFormat: number, attachment: number) {
        gl.getExtension('EXT_color_buffer_float');

        const target = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, target);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texStorage2D(gl.TEXTURE_2D, 1, internalFormat, gl.drawingBufferWidth * settings.renderScale, gl.drawingBufferHeight * settings.renderScale);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, target, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return target;
    }

    private createBufferTextures() {
        this.baseColorTarget = this.createBufferTexture(gl.RGBA16F, gl.COLOR_ATTACHMENT0);
        this.positionTarget = this.createBufferTexture(gl.RGBA16F, gl.COLOR_ATTACHMENT1);
        this.normalTarget = this.createBufferTexture(gl.RGBA16F, gl.COLOR_ATTACHMENT2);
        this.ormTarget = this.createBufferTexture(gl.RGBA16F, gl.COLOR_ATTACHMENT3);
        this.depthTarget = this.createBufferTexture(gl.DEPTH_COMPONENT24, gl.DEPTH_ATTACHMENT);
    }

    constructor(scene: Scene) {
        this.scene = scene;
        this.renderQuad = createQuad();

        this.shaderProgram = shader.createProgram();
        shader.attachShader(this.shaderProgram, require('shaders/main.vs.glsl'), gl.VERTEX_SHADER);
        shader.attachShader(this.shaderProgram, require('shaders/main.fs.glsl'), gl.FRAGMENT_SHADER);
        shader.linkProgram(this.shaderProgram);

        gl.useProgram(this.shaderProgram);

        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, 'uBaseColor')!, 0);
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, 'uPositionBuffer')!, 1);
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, 'uNormalBuffer')!, 2);
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, 'uOrmBuffer')!, 3);
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, 'uDepthBuffer')!, 4);
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, 'uBrdfLut')!, 5);
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, 'uEnvironmentDiffuse')!, 6);
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, 'uEnvironmentSpecular')!, 7);

        this.uniformBuffer = new UniformBufferWrapper(gl.getUniformBlockIndex(this.shaderProgram, 'uData'));

        this.framebuffer = gl.createFramebuffer()!;
        this.bind();

        gl.activeTexture(gl.TEXTURE0);
        this.createBufferTextures();

        gl.drawBuffers([
            gl.COLOR_ATTACHMENT0,
            gl.COLOR_ATTACHMENT1,
            gl.COLOR_ATTACHMENT2,
            gl.COLOR_ATTACHMENT3,
        ]);

        this.unbind();

        window.addEventListener('viewportResize', () => {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
            this.createBufferTextures();
        });
    }

    public bind() {
        gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    }

    public unbind() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);
    }

    private getLightBuffer() {
        const keys = Object.keys(this.scene.root.lights);
        this.lightUniforms = [];

        for (let i = 0; i < keys.length; i ++) {
            const translation = vec3.create();
            mat4.getTranslation(translation, this.scene.root.transforms[keys[i]]);
            this.lightUniforms.push({
                position: { type: 'vec', value: translation },
                range: { type: 'float', value: this.scene.root.lights[keys[i]].range },
                color: { type: 'vec', value: this.scene.root.lights[keys[i]].color },
                intensity: { type: 'float', value: this.scene.root.lights[keys[i]].intensity },
            });
        }

        return { type: 'struct', value: this.lightUniforms, arrayLength: settings.maxLights, size: 8 } as UniformBufferItem;
    }

    public render(camera: Camera, environment: Environment) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(this.shaderProgram);

        this.uniformBuffer.set({
            eyePosition: { type: 'vec', value: camera.position },
            lightCount: { type: 'float', value: this.scene.root.lightCount },
            lights: this.getLightBuffer(),
        });

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.baseColorTarget);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.positionTarget);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.normalTarget);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.ormTarget);
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, this.depthTarget);

        gl.activeTexture(gl.TEXTURE5);
        gl.bindTexture(gl.TEXTURE_2D, environment.brdfLut);
        gl.activeTexture(gl.TEXTURE6);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, environment.diffuse);
        gl.activeTexture(gl.TEXTURE7);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, environment.specular);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.renderQuad.vertexBuffer);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, this.renderQuad.length);
    }
}
