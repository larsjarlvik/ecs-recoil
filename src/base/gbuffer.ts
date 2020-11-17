import { mat4, vec3 } from 'gl-matrix';
import GL from 'global/gl';
import Camera from 'global/camera';
import * as shader from 'base/shader';
import { createQuad, Quad } from 'models/quad';
import { Environment } from './environment';
import Scene from 'global/scene';
import { UniformBuffer, UniformBufferItem, UniformBufferWrapper } from './UniformBuffer';
import { Settings } from 'settings';

const gl = GL.Instance;
const camera = Camera.Instance;


export class GBuffer {
    scene: Scene;
    framebuffer: WebGLFramebuffer;
    textures: WebGLTexture[];

    shaderProgram: WebGLProgram;
    positionTarget: WebGLTexture | null;
    normalTarget: WebGLTexture | null;
    depthTarget: WebGLTexture | null;
    baseColorTarget: WebGLTexture | null;

    positionLocation: WebGLUniformLocation;
    normalLocation: WebGLUniformLocation;
    depthLocation: WebGLUniformLocation;
    baseColorLocation: WebGLUniformLocation;

    brfdLutLocation: WebGLUniformLocation;
    diffuseLocation: WebGLUniformLocation;
    specularLocation: WebGLUniformLocation;

    eyePosition: WebGLUniformLocation;

    uniformBuffer: UniformBufferWrapper;
    renderQuad: Quad;
    environment: Environment;

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

    private createBufferTextures() {
        this.positionTarget = this.createBufferTexture(gl.RGBA16F, gl.COLOR_ATTACHMENT0);
        this.normalTarget = this.createBufferTexture(gl.RGBA16F, gl.COLOR_ATTACHMENT1);
        this.baseColorTarget = this.createBufferTexture(gl.RGBA16F, gl.COLOR_ATTACHMENT2);
        this.depthTarget = this.createBufferTexture(gl.DEPTH_COMPONENT24, gl.DEPTH_ATTACHMENT);
    }

    constructor(scene: Scene, environment: Environment) {
        this.scene = scene;
        this.renderQuad = createQuad();
        this.environment = environment;

        this.shaderProgram = shader.createProgram();
        gl.attachShader(this.shaderProgram, shader.compileShader(require('shaders/main.vs.glsl'), gl.VERTEX_SHADER));
        gl.attachShader(this.shaderProgram, shader.compileShader(require('shaders/main.fs.glsl'), gl.FRAGMENT_SHADER));
        shader.linkProgram(this.shaderProgram);

        gl.useProgram(this.shaderProgram);

        this.positionLocation = gl.getUniformLocation(this.shaderProgram, 'uPositionBuffer')!;
        this.normalLocation = gl.getUniformLocation(this.shaderProgram, 'uNormalBuffer')!;
        this.depthLocation = gl.getUniformLocation(this.shaderProgram, 'uDepthBuffer')!;
        this.baseColorLocation = gl.getUniformLocation(this.shaderProgram, 'uBaseColor')!;
        this.brfdLutLocation = gl.getUniformLocation(this.shaderProgram, 'uBrdfLut')!;
        this.diffuseLocation = gl.getUniformLocation(this.shaderProgram, 'uEnvironmentDiffuse')!;
        this.specularLocation = gl.getUniformLocation(this.shaderProgram, 'uEnvironmentSpecular')!;

        this.uniformBuffer = new UniformBufferWrapper(gl.getUniformBlockIndex(this.shaderProgram, 'uData'));

        this.framebuffer = gl.createFramebuffer()!;
        this.bind();

        gl.activeTexture(gl.TEXTURE0);
        this.createBufferTextures();

        gl.drawBuffers([
            gl.COLOR_ATTACHMENT0,
            gl.COLOR_ATTACHMENT1,
            gl.COLOR_ATTACHMENT2,
        ]);

        gl.uniform1i(this.positionLocation, 0);
        gl.uniform1i(this.normalLocation, 1);
        gl.uniform1i(this.baseColorLocation, 2);
        gl.uniform1i(this.depthLocation, 3);

        gl.uniform1i(this.brfdLutLocation, 4);
        gl.uniform1i(this.diffuseLocation, 5);
        gl.uniform1i(this.specularLocation, 6);

        this.unbind();

        window.addEventListener('viewportResize', () => {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
            this.createBufferTextures();
        });
    }

    public bind() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    }

    public unbind() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    private getLightBuffer() {
        const keys = Object.keys(this.scene.root.lights);
        const uniforms: UniformBuffer[] = [];

        for (let i = 0; i < keys.length; i ++) {
            const translation = vec3.create();
            mat4.getTranslation(translation, this.scene.root.transforms[keys[i]]);
            uniforms.push({
                position: { type: 'vec', value: translation },
                range: { type: 'float', value: this.scene.root.lights[keys[i]].range },
                color: { type: 'vec', value: this.scene.root.lights[keys[i]].color },
                intensity: { type: 'float', value: this.scene.root.lights[keys[i]].intensity },
            });
        }

        return { type: 'struct', value: uniforms, arrayLength: Settings.maxLights, size: 8 } as UniformBufferItem;
    }

    public render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(this.shaderProgram);

        this.uniformBuffer.set({
            eyePosition: { type: 'vec', value: camera.position },
            lightCount: { type: 'float', value: this.scene.root.lightCount },
            lights: this.getLightBuffer(),
        });

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.positionTarget);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.normalTarget);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.baseColorTarget);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.depthTarget);

        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, this.environment.brdfLut);
        gl.activeTexture(gl.TEXTURE5);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.environment.diffuse);
        gl.activeTexture(gl.TEXTURE6);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.environment.specular);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.renderQuad.vertexBuffer);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, this.renderQuad.length);
    }
}
