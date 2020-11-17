import { mat4, vec3 } from 'gl-matrix';
import Viewport from './viewport';

const viewport = Viewport.Instance;

export default class Camera {
    private static _instance: Camera;
    public position: vec3;
    public modelView: mat4;
    public projection: mat4;

    public lookAt: vec3;
    public rX: number;
    public rY: number;
    public distance: number;

    private constructor() {
        this.lookAt = vec3.fromValues(0.0, 0.0, 0.0);
        this.rX = 0.0;
        this.rY = 0.0;
        this.distance = 0.6;
        this.modelView = mat4.create();
        this.projection = mat4.create();
    }

    public static get Instance(): Camera {
        return this._instance || (this._instance = new this());
    }

    public update() {
        this.position = vec3.fromValues(
            this.distance * Math.sin(-this.rY) * Math.cos(-this.rX),
            this.distance * Math.sin( this.rX),
            this.distance * Math.cos(-this.rY) * Math.cos(-this.rX),
        );

        mat4.identity(this.modelView);
        mat4.translate(this.modelView, this.modelView, vec3.fromValues(0.0, 0.0, -this.distance));
        mat4.rotateX(this.modelView, this.modelView, this.rX);
        mat4.rotateY(this.modelView, this.modelView, this.rY);

        mat4.perspective(this.projection, 45.0, viewport.aspect, 0.1, 100.0);
    }
}
